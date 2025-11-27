import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Tag, Book, DollarSign, Calendar, UploadCloud } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Task, TaskType } from '../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (newTask: Task) => void;
  user: User;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onTaskCreated, user }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<TaskType>('request');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setPrice('');
    setDueDate('');
    setType('request');
    setFile(null);
    setError(null);
  };

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
    if (!title || !price) {
      setError('El título y el precio son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    let fileUrl: string | null = null;
    let fileName: string | null = null;

    try {
      if (file) {
        fileName = file.name;
        const filePath = `${user.id}/${Date.now()}_${fileName}`;
        const { error: uploadError } = await supabase.storage.from('task_files').upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('task_files').getPublicUrl(filePath);
        fileUrl = urlData.publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({
          title,
          description,
          subject,
          price: parseFloat(price) || 0,
          due_date: dueDate || null,
          type,
          user_id: user.id,
          file_url: fileUrl,
          file_name: fileName,
        })
        .select(`*, profiles (*)`)
        .single();

      if (insertError) throw insertError;

      if (data) {
        onTaskCreated(data as Task);
        resetForm();
        onClose();
      }
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError('No se pudo crear la tarea. Revisa los datos e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 flex justify-between items-center">
                  Publicar una nueva tarea
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={24} className="text-gray-500" />
                  </button>
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div className="flex space-x-4">
                    <button type="button" onClick={() => setType('request')} className={`flex-1 py-3 rounded-lg font-semibold transition-all ${type === 'request' ? 'bg-gradient-to-r from-brand-purple to-brand-indigo text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                      Necesito Ayuda (Solicitud)
                    </button>
                    <button type="button" onClick={() => setType('offer')} className={`flex-1 py-3 rounded-lg font-semibold transition-all ${type === 'offer' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                      Ofrezco Ayuda (Oferta)
                    </button>
                  </div>

                  <div className="relative">
                    <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Título de la tarea" value={title} onChange={e => setTitle(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition" required />
                  </div>

                  <div>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition" rows={4} placeholder="Describe la tarea en detalle..."></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="text" placeholder="Materia (Ej: Cálculo)" value={subject} onChange={e => setSubject(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition" />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="number" placeholder="Precio / Recompensa" value={price} onChange={e => setPrice(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition" min="0" step="0.01" required />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Archivo adjunto (Opcional, max 10MB)</label>
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
                        {file ? <p className="text-xs text-gray-500 truncate max-w-xs">{file.name}</p> : <p className="text-xs text-gray-500">PDF, DOCX, PNG, JPG, etc.</p>}
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                  <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-wait">
                      {isSubmitting ? 'Publicando...' : 'Publicar Tarea'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateTaskModal;
