import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { Plus, FileText, Tag, DollarSign, Calendar } from 'lucide-react';
import CreateTaskModal from './CreateTaskModal'; // Import the refactored modal

interface TasksProps {
  user: User | null;
  onAuthAction: () => void;
}

const TaskCard = ({ task }: { task: Task }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-purple transition-all duration-300 flex flex-col">
    <div className="flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-brand-text-primary pr-2">{task.title}</h3>
        <span className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${task.type === 'offer' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
          {task.type === 'offer' ? 'Oferta' : 'Solicitud'}
        </span>
      </div>
      <p className="text-sm text-brand-text-secondary mb-3 line-clamp-3">{task.description}</p>
      <div className="flex flex-wrap gap-2 text-xs text-brand-text-secondary mb-4">
        <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded"><Tag size={14} /> {task.subject || 'General'}</span>
        <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded"><DollarSign size={14} /> {task.price}</span>
        {task.due_date && <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded"><Calendar size={14} /> {new Date(task.due_date).toLocaleDateString()}</span>}
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
        <img src={task.profiles.avatar_url ?? `https://api.dicebear.com/8.x/initials/svg?seed=${task.profiles.full_name}`} alt={task.profiles.full_name ?? 'Usuario'} className="w-8 h-8 rounded-full bg-gray-200" />
        <span className="text-sm font-medium text-brand-text-secondary">{task.profiles.full_name ?? 'Usuario Anónimo'}</span>
      </div>
      <button className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-purple rounded-lg hover:bg-brand-indigo transition-colors">
        Ver Detalles
      </button>
    </div>
  </div>
);

const Tasks = ({ user, onAuthAction }: TasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*, profiles!user_id(full_name, avatar_url)')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error("Error fetching tasks:", fetchError);
        setError("No se pudieron cargar las tareas.");
      } else {
        setTasks(data as Task[]);
      }
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const handleCreateTaskClick = () => {
    if (user) {
      setShowModal(true);
    } else {
      onAuthAction();
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {user && (
        <CreateTaskModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)} 
          onTaskCreated={handleTaskCreated}
          user={user}
        />
      )}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text-primary">Mercado de Tareas</h1>
          <p className="text-brand-text-secondary mt-1">Encuentra u ofrece ayuda para tus trabajos universitarios.</p>
        </div>
        <button onClick={handleCreateTaskClick} className="flex items-center gap-2 px-5 py-3 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-shadow w-full md:w-auto">
          <Plus size={20} />
          <span>Publicar Tarea</span>
        </button>
      </div>

      {loading && <div className="text-center py-10">Cargando tareas...</div>}
      {error && <div className="text-center py-10 text-red-500">{error}</div>}
      
      {!loading && !error && tasks.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700">No hay tareas publicadas</h3>
          <p className="text-gray-500 mt-2">¡Sé el primero en publicar una!</p>
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      )}
    </div>
  );
};

export default Tasks;
