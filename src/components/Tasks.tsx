import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Calendar, Tag, DollarSign, PlusCircle, Search, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import CreateTaskModal from './CreateTaskModal';

interface TasksProps {
  user: User | null;
}

const TaskCard = ({ task }: { task: Task }) => {
  const typeStyles = {
    request: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'SOLICITUD' },
    offer: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'OFERTA' }
  };
  const currentStyle = typeStyles[task.type];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-transform transform hover:-translate-y-1 hover:shadow-lg">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img src={task.profiles.avatar_url || `https://ui-avatars.com/api/?name=${task.profiles.full_name}&background=random`} alt={task.profiles.full_name || 'User'} className="w-10 h-10 rounded-full object-cover" />
            <span className="font-semibold text-brand-text-primary">{task.profiles.full_name}</span>
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${currentStyle.bg} ${currentStyle.text}`}>{currentStyle.label}</span>
        </div>
        <h3 className="text-lg font-bold text-brand-text-primary mb-2">{task.title}</h3>
        <p className="text-brand-text-secondary text-sm mb-4 line-clamp-2">{task.description}</p>
      </div>
      <div>
        <div className="border-t border-gray-100 pt-4 mb-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2"><Tag size={16} /><span>{task.subject}</span></div>
          <div className="flex items-center space-x-2"><Calendar size={16} /><span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span></div>
          <div className="flex items-center space-x-1 font-bold text-brand-purple"><DollarSign size={16} /><span>{task.price.toFixed(2)}</span></div>
        </div>
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
          <span>Ver Detalles</span>
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

const FilterButton = ({ text, active, onClick }: { text: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${active ? 'bg-gradient-to-r from-brand-purple to-brand-indigo text-white shadow-md' : 'bg-white text-brand-text-secondary hover:bg-gray-100 border'}`}
  >
    {text}
  </button>
);

function Tasks({ user }: TasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'request' | 'offer'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      let query = supabase
        .from('tasks')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }
      
      if (searchTerm) {
        query = query.textSearch('title', `'${searchTerm}'`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        setError('No se pudieron cargar las tareas.');
      } else {
        setTasks(data as any);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [filter, searchTerm]);

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  return (
    <>
      <CreateTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={handleTaskCreated}
        user={user}
      />
      <div className="max-w-7xl mx-auto">
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-text-primary">Mercado de Tareas</h1>
              <p className="text-brand-text-secondary mt-1">Encuentra ayuda o comparte tus conocimientos.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={!user}
              className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!user ? "Inicia sesión para publicar una tarea" : "Publicar una nueva tarea"}
            >
              <PlusCircle size={20} />
              <span>Publicar Tarea</span>
            </button>
          </div>
          <div className="border-t border-gray-100 mt-6 pt-6 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Buscar por título, materia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FilterButton text="Todos" active={filter === 'all'} onClick={() => setFilter('all')} />
              <FilterButton text="Solicitudes" active={filter === 'request'} onClick={() => setFilter('request')} />
              <FilterButton text="Ofertas" active={filter === 'offer'} onClick={() => setFilter('offer')} />
            </div>
          </div>
        </header>

        {loading && <p className="text-center py-10">Cargando tareas...</p>}
        {error && <p className="text-red-500 text-center py-10">{error}</p>}
        
        {!loading && tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        ) : (
          !loading && <div className="bg-white text-center p-12 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-brand-text-primary">No se encontraron tareas</h3>
            <p className="text-brand-text-secondary mt-2">Intenta con otra búsqueda o sé el primero en publicar.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Tasks;
