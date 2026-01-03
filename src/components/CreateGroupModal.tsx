import React, { useState, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Users, FileText, UploadCloud, Lock, Check } from 'lucide-react'; // Agregamos Lock y Check
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Group } from '../types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (newGroup: Group) => void;
  user: User | null;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onGroupCreated, user }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false); // <--- Nuevo Estado
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('La imagen no debe superar los 5MB.');
      setImageFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setError(null);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsPrivate(false); // <--- Reseteamos a público por defecto
    removeImage();
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Debes iniciar sesión para crear un grupo.');
      return;
    }
    if (!name || !description) {
      setError('El nombre y la descripción son obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    let imageUrl: string | undefined = undefined;

    try {
      if (imageFile) {
        const filePath = `${user.id}/groups/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        imageUrl = urlData.publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          image_url: imageUrl || `https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`,
          created_by: user.id,
          is_private: isPrivate // <--- Enviamos el valor a la base de datos
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        onGroupCreated(data as Group);
        handleClose(); // Usamos handleClose para limpiar todo
      }
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError('No se pudo crear el grupo. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-brand-text-primary flex justify-between items-center">
                  Crear un nuevo grupo
                  <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={24} className="text-gray-500" />
                  </button>
                </Dialog.Title>
                
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  
                  {/* Nombre */}
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Nombre del grupo" value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition" />
                  </div>

                  {/* Descripción */}
                  <div className="relative">
                     <FileText className="absolute left-4 top-5 text-gray-400" size={20} />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition" rows={4} placeholder="Describe el propósito del grupo..."></textarea>
                  </div>

                  {/* Toggle Privado / Público */}
                  <div 
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${isPrivate ? 'bg-purple-50 border-brand-purple shadow-sm' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}
                    onClick={() => setIsPrivate(!isPrivate)}
                  >
                    <div className={`p-2 rounded-full transition-colors ${isPrivate ? 'bg-brand-purple text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <Lock size={20} />
                    </div>
                    <div className="flex-1 select-none">
                      <h4 className={`font-medium ${isPrivate ? 'text-brand-purple' : 'text-gray-900'}`}>Grupo Privado</h4>
                      <p className="text-sm text-gray-500">Solo los miembros aprobados pueden unirse y ver el contenido.</p>
                    </div>
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isPrivate ? 'bg-brand-purple border-brand-purple' : 'border-gray-300 bg-white'}`}>
                      {isPrivate && <Check size={14} className="text-white" />}
                    </div>
                  </div>

                  {/* Imagen Upload */}
                  <div 
                    className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-brand-purple transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/png, image/jpeg, image/gif, image/webp"
                    />
                    {previewUrl ? (
                      <div className="relative group">
                        <img src={previewUrl} alt="Preview" className="rounded-md max-h-48 mx-auto" />
                        <div 
                          onClick={(e) => { e.stopPropagation(); removeImage(); }}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                        >
                          <X size={32} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud size={40} className="mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-semibold text-brand-purple">Sube una imagen de portada</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WEBP hasta 5MB (Opcional)</p>
                      </>
                    )}
                  </div>

                  {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

                  <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="px-8 py-3 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-wait">
                      {isSubmitting ? 'Creando...' : 'Crear Grupo'}
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

export default CreateGroupModal;