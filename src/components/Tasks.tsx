import React, { useState, useEffect } from 'react';
import { Tag, DollarSign, Calendar, ArrowRight, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { User } from '@supabase/supabase-js';
import CreateTaskModal from './CreateTaskModal';

interface TasksProps {
  user: User | null;
  onAuthAction: () => void;
}

const TaskCard = ({ task }: { task: Task }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className="flex-grow">
      <div className="flex justify-between items-start">
        <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${task.type === 'request' ? 'bg-purple-100 text-brand-purple' : 'bg-emerald-100 text-emerald-600'}`}>
          {task.type === 'request' ? 'Solicitud' : 'Oferta'}
        </span>
        <div className="flex items-center">
          <img src={task.profiles.avatar_url} alt={task.profiles.full_name} className="w-8 h-8 rounded-full object-cover" />
        </div>
      </div>
      <h3 className="font-bold text-lg text-brand-text-primary mt-3">{task.title}</h3>
      <p className="text-sm text-brand-text-secondary mt-1 h-10 overflow-hidden">{task.description}</p>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-sm">
      <div className="flex items-center text-gray-500">
        <Tag size={16} className="mr-2 text-brand-purple" />
        <span>{task.subject}</span>
      </div>
      <div className="flex items-center text-gray-500">
        <DollarSign size={16} className="mr-2 text-emerald-500" />
        <span className="font-semibold text-brand-text-primary">${task.price.toFixed(2)}</span>
      </div>
      {task.due_date && (
        <div className="flex items-center text-gray-500">
          <Calendar size={16} className="mr-2 text-red-500" />
          <span>Vence: {new Date(task.due_date).toLocaleDateString()}</span>
        </div>
      )}
    </div>
    <button 
      onClick={() => alert(`Viendo detalles para: ${task.title}`)}
      className="mt-4 w-full flex justify-center items-center space-x-2 px-4 py-2.5 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-all"
    >
      <span>Ver Detalles</span>
      <ArrowRight size={18} />
    </button>
  </div>
);

function Tasks({ user, onAuthAction }: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles (*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        setError('No se pudieron cargar las tareas.');
      } else {
        setTasks(data as any);
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  const handleCreateTaskClick = () => {
    if (user) {
      setIsCreateModalOpen(true);
    } else {
      onAuthAction();
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-text-primary">Mercado de Tareas</h1>
            <p className="text-brand-text-secondary mt-1">Encuentra ayuda para tus tareas o ofrece tus habilidades.</p>
          </div>
          <button 
            onClick={handleCreateTaskClick}
            className="flex items-center space-x-2 px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Publicar Tarea</span>
          </button>
        </header>
        
        {loading && <p className="text-center py-10">Cargando tareas...</p>}
        {error && <p className="text-red-500 text-center py-10">{error}</p>}

        {!loading && !error && tasks.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <h3 className="text-xl font-semibold text-brand-text-primary">No hay tareas publicadas</h3>
            <p className="text-brand-text-secondary mt-2">¡Publica una tarea para empezar!</p>
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}
      </div>
      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        user={user}
      />
    </>
  );
}

export default Tasks;
