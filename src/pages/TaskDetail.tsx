import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { 
  ArrowLeft, 
  FileText, 
  Tag, 
  DollarSign, 
  MessageCircle, // <--- NUEVO ICONO
  Clock, 
  User as UserIcon, 
  CheckCircle, 
  Loader 
} from 'lucide-react';

interface TaskDetailProps {
  user: User | null;
  onAuthAction: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ user, onAuthAction }) => {
  const { taskId } = useParams<{ taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      setError("ID de tarea no proporcionado.");
      setLoading(false);
      return;
    }

    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*, profiles!user_id(full_name, avatar_url)')
        .eq('id', taskId)
        .single();

      if (fetchError) {
        console.error("Error fetching task:", fetchError);
        setError("No se pudo cargar el detalle de la tarea.");
        setTask(null);
      } else if (data) {
        setTask(data as Task);
      } else {
        setError("Tarea no encontrada.");
      }
      setLoading(false);
    };
    fetchTask();
  }, [taskId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader className="animate-spin mx-auto text-brand-purple" size={32} />
        <p className="mt-4 text-brand-text-secondary">Cargando detalles de la tarea...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-red-500">
        <p className="text-xl font-semibold">{error}</p>
        <Link to="/" className="mt-4 inline-flex items-center text-brand-purple hover:underline">
          <ArrowLeft size={16} className="mr-1" /> Volver al Mercado
        </Link>
      </div>
    );
  }

  if (!task) return null;

  const isOwner = user?.id === task.user_id;
  const statusColor = {
    open: 'bg-green-500',
    in_progress: 'bg-yellow-500',
    completed: 'bg-brand-purple',
  }[task.status] || 'bg-gray-500';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/" className="inline-flex items-center text-brand-text-secondary hover:text-brand-purple transition mb-6">
        <ArrowLeft size={18} className="mr-2" /> Volver al Mercado
      </Link>

      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight pr-4">{task.title}</h1>
          <span className={`px-4 py-2 text-sm font-bold text-white rounded-full shadow-md ${statusColor} flex items-center gap-2`}>
            {task.status === 'completed' ? <CheckCircle size={16} /> : null}
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
        </div>

        {/* --- GRID DE INFORMACIÓN --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b pb-6 border-gray-100">
          
          {/* Recompensa */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <DollarSign size={24} className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Recompensa</p>
              <p className="text-xl font-bold text-gray-900">${task.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Materia */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Tag size={24} className="text-brand-purple" />
            <div>
              <p className="text-sm text-gray-500">Materia</p>
              <p className="text-xl font-bold text-gray-900">{task.subject || 'General'}</p>
            </div>
          </div>

          {/* CAMBIO AQUÍ: Contacto en lugar de Fecha */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <MessageCircle size={24} className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Contacto</p>
              <p className="text-xl font-bold text-gray-900 select-all">
                {task.contact_info || 'No especificado'}
              </p>
            </div>
          </div>
          
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Descripción</h2>
          <p className="text-brand-text-secondary leading-relaxed whitespace-pre-wrap">{task.description}</p>
        </div>

        {task.file_url && (
          <div className="mb-8 p-4 border border-brand-purple/30 bg-brand-purple/5 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Archivos Adjuntos</h3>
            <a href={task.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-brand-purple hover:text-brand-indigo transition p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm">
              <FileText size={20} />
              <span className="truncate font-medium">{task.file_name || 'Ver archivo adjunto'}</span>
            </a>
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-6 border-gray-100">
          <div className="flex items-center gap-3">
            <img src={task.profiles?.avatar_url ?? `https://api.dicebear.com/8.x/initials/svg?seed=${task.profiles?.full_name || 'U'}`} alt={task.profiles?.full_name ?? 'Usuario'} className="w-12 h-12 rounded-full bg-gray-200 border-2 border-brand-purple" />
            <div>
              <p className="text-sm text-gray-500">Publicado por</p>
              <p className="font-semibold text-gray-900 flex items-center gap-1">
                <UserIcon size={16} className="text-brand-purple" />
                {task.profiles?.full_name ?? 'Usuario Anónimo'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                <Clock size={14} /> Publicado el
            </p>
            <p className="font-medium text-gray-700">{new Date(task.created_at).toLocaleDateString()}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskDetail;