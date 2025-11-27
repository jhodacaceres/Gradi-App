import React, { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Task, TaskStatus, TaskType } from '../types';
import { Plus, UploadCloud, FileText, X, Briefcase, Search, DollarSign, Calendar, Tag } from 'lucide-react';

interface TasksProps {
  user: User | null;
  onAuthAction: () => void;
}

const TaskCard = ({ task }: { task: Task }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-purple transition-all duration-300">
    <div className="flex justify-between items-start">
      <h3 className="font-bold text-lg text-brand-text-primary mb-2">{task.title}</h3>
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${task.type === 'offer' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}`}>
        {task.type === 'offer' ? 'Oferta' : 'Solicitud'}
      </span>
    </div>
    <p className="text-sm text-brand-text-secondary mb-3 line-clamp-2">{task.description}</p>
    <div className="flex flex-wrap gap-2 text-xs text-brand-text-secondary mb-4">
      <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded"><Tag size={14} /> {task.subject || 'General'}</span>
      <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded"><DollarSign size={14} /> {task.price}</span>
      {task.due_date && <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded"><Calendar size={14} /> {new Date(task.due_date).toLocaleDateString()}</span>}
    </div>
    {task.file_url && (
      <a href={task.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-purple hover:underline mb-4">
        <FileText size={16} />
        <span>{task.file_name || 'Ver archivo adjunto'}</span>
      </a>
    )}
    <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src={task.profiles.avatar_url} alt={task.profiles.full_name} className="w-8 h-8 rounded-full" />
        <span className="text-sm font-medium text-brand-text-secondary">{task.profiles.full_name}</span>
      </div>
      <button className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-purple rounded-lg hover:bg-brand-indigo transition-colors">
        Ver Detalles
      </button>
    </div>
  </div>
);

const CreateTaskModal = ({ user, onClose, onTaskCreated }: { user: User, onClose: () => void, onTaskCreated: (task: Task) => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<TaskType>('request');
  const [price, setPrice] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('El archivo no debe superar los 10MB.');
      setFile(null);
    } else {
      setError(null);
      setFile(selectedFile || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || price === '') return;
    
    setIsSubmitting(true);
    setError(null);
    let fileUrl: string | null = null;
    let fileName: string | null = null;

    try {
      if (file) {
        fileName = file.name;
        const filePath = `${user.id}/task_files/${Date.now()}_${fileName}`;
        const { error: uploadError } = await supabase.storage.from('task_files').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('task_files').getPublicUrl(filePath);
        fileUrl = urlData.publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title,
          description,
          subject,
          type,
          price: price || 0,
          due_date: dueDate || null,
          file_url: fileUrl,
          file_name: fileName,
        })
        .select('*, profiles!user_id(*)')
        .single();

      if (insertError) throw insertError;
      
      onTaskCreated(data as Task);
      onClose();

    } catch (err: any) {
      console.error("Error creating task:", err);
      setError("No se pudo crear la tarea. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-brand-text-primary">Crear nueva tarea</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields here */}
          <input type="text" placeholder="Título de la tarea" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" required />
          <textarea placeholder="Descripción detallada" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" rows={4}></textarea>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Asignatura (e.g. Cálculo)" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" />
            <input type="number" placeholder="Precio/Recompensa (€)" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="w-full p-3 border border-gray-200 rounded-lg" required min="0" step="0.01" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={type} onChange={e => setType(e.target.value as TaskType)} className="w-full p-3 border border-gray-200 rounded-lg bg-white">
              <option value="request">Solicito Ayuda</option>
              <option value="offer">Ofrezco Ayuda</option>
            </select>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-text-secondary mb-2">Archivo adjunto (Opcional, max 10MB)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-purple hover:text-brand-indigo focus-within:outline-none">
                    <span>Sube un archivo</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">o arrástralo aquí</p>
                </div>
                {file ? <p className="text-xs text-gray-500">{file.name}</p> : <p className="text-xs text-gray-500">PDF, DOCX, PNG, JPG, etc.</p>}
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md disabled:opacity-50">
              {isSubmitting ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Tasks = ({ user, onAuthAction }: TasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles!user_id(full_name, avatar_url)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching tasks:", error);
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

  return (
    <div className="max-w-6xl mx-auto">
      {showModal && user && <CreateTaskModal user={user} onClose={() => setShowModal(false)} onTaskCreated={(newTask) => setTasks([newTask, ...tasks])} />}
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

      {loading && <p>Cargando tareas...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tasks.map(task => <TaskCard key={task.id} task={task} />)}
      </div>
    </div>
  );
};

export default Tasks;
