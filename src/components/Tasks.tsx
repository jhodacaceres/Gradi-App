import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { Plus, FileText, Tag, DollarSign, MessageCircle, Archive, History, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CreateTaskModal } from './CreateTaskModal'; 

interface TasksProps {
  user: User | null;
  onAuthAction: () => void;
}

const TaskCard = ({ task }: { task: Task }) => (
  <div className={`p-5 rounded-2xl shadow-sm border transition-all duration-300 flex flex-col ${task.status === 'archived' ? 'bg-gray-50 border-gray-200 opacity-80' : 'bg-white border-gray-100 hover:shadow-md hover:border-brand-purple'}`}>
    <div className="flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-brand-text-primary pr-2">{task.title}</h3>
        <span className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${task.type === 'offer' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
          {task.type === 'offer' ? 'Oferta' : 'Solicitud'}
        </span>
      </div>
      <p className="text-sm text-brand-text-secondary mb-3 line-clamp-3">{task.description}</p>
      
      <div className="flex flex-wrap gap-2 text-xs text-brand-text-secondary mb-4">
        <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded">
            <Tag size={14} /> {task.subject || 'General'}
        </span>
        <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded">
            <DollarSign size={14} /> {task.price}
        </span>
        <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded text-blue-600 bg-blue-50">
            <MessageCircle size={14} /> 
            {task.contact_info ? 'Contacto disponible' : 'Sin contacto'}
        </span>
      </div>

      {task.file_url && (
        <a href={task.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-purple hover:underline mb-4">
          <FileText size={16} />
          <span className="truncate">{task.file_name || 'Ver archivo adjunto'}</span>
        </a>
      )}
    </div>
    <div className="border-t border-gray-100 pt-3 flex items-center justify-between mt-auto">
      <div className="flex items-center gap-2">
        <img src={task.profiles?.avatar_url ?? `https://api.dicebear.com/8.x/initials/svg?seed=${task.profiles?.full_name || 'U'}`} alt={task.profiles?.full_name ?? 'Usuario'} className="w-8 h-8 rounded-full bg-gray-200" />
        <span className="text-sm font-medium text-brand-text-secondary">{task.profiles?.full_name ?? 'Usuario Anónimo'}</span>
      </div>
      <Link to={`/task/${task.id}`} className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-purple rounded-lg hover:bg-brand-indigo transition-colors">
        Ver Detalles
      </Link>
    </div>
  </div>
);

const Tasks = ({ user, onAuthAction }: TasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // NUEVO ESTADO: Controla si vemos las recientes o el historial
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      
      // Calculamos la fecha de corte (hace 15 días)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 15);
      const isoCutoff = cutoffDate.toISOString();

      let query = supabase
        .from('tasks')
        .select('*, profiles!user_id(full_name, avatar_url)')
        .order('created_at', { ascending: false });

      // LÓGICA DE OPTIMIZACIÓN DE MEMORIA:
      if (showHistory) {
        // Si el usuario pide historial, traemos SOLO las viejas (menor o igual a 15 días)
        query = query.lte('created_at', isoCutoff);
      } else {
        // Por defecto, traemos SOLO las recientes (mayor a 15 días)
        query = query.gt('created_at', isoCutoff);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        console.error("Error fetching tasks:", fetchError);
        setError("No se pudieron cargar las tareas.");
      } else {
        setTasks(data as Task[]);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [showHistory]); // <-- Importante: Se ejecuta de nuevo cuando cambiamos de modo

  const handleCreateTaskClick = () => {
    if (user) {
      setShowModal(true);
    } else {
      onAuthAction();
    }
  };

  const handleTaskCreated = () => {
    setShowModal(false);
    // Recargar página para ver la nueva tarea (o podrías llamar a fetchTasks de nuevo)
    window.location.reload(); 
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {user && showModal && (
        <CreateTaskModal 
          onClose={() => setShowModal(false)} 
          onTaskCreated={handleTaskCreated}
          user={user}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-brand-text-primary">
              {showHistory ? 'Historial de Tareas' : 'Mercado de Tareas'}
            </h1>
            
            {/* Botón Toggle de Historial */}
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${showHistory ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
              title={showHistory ? "Volver a recientes" : "Ver tareas antiguas (+15 días)"}
            >
              {showHistory ? <ArrowLeft size={14} /> : <History size={14} />}
              {showHistory ? 'Volver a Recientes' : 'Ver Antiguas'}
            </button>
          </div>

          <p className="text-brand-text-secondary mt-1">
            {showHistory 
              ? 'Viendo tareas publicadas hace más de 15 días.' 
              : 'Encuentra u ofrece ayuda (Últimos 15 días).'}
          </p>
        </div>

        {!showHistory && (
          <button onClick={handleCreateTaskClick} className="flex items-center gap-2 px-5 py-3 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-shadow w-full md:w-auto">
            <Plus size={20} />
            <span>Publicar Tarea</span>
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando tareas...</p>
        </div>
      )}
      
      {error && <div className="text-center py-10 text-red-500">{error}</div>}
      
      {!loading && !error && tasks.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <Archive className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-xl font-semibold text-gray-700">
            {showHistory ? 'No hay tareas antiguas' : 'No hay tareas recientes'}
          </h3>
          <p className="text-gray-500 mt-2">
            {showHistory 
              ? 'El historial está limpio.' 
              : '¡Sé el primero en publicar una nueva tarea!'}
          </p>
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      )}
    </div>
  );
};

export default Tasks;