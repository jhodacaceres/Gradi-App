import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Loader2, 
  Type, 
  AlignLeft, 
  Tag, 
  DollarSign, 
  MessageCircle 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface CreateTaskModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onTaskCreated: (task: any) => void;
  user?: User | null;
}

export function CreateTaskModal({ onClose, onTaskCreated, user }: CreateTaskModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Estados
  const [type, setType] = useState<'request' | 'offer'>('request');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // --- NUEVA FUNCIÓN PARA VALIDAR EL ARCHIVO ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // 20 MB en bytes = 20 * 1024 * 1024
      const maxSizeInBytes = 20 * 1024 * 1024;

      if (selectedFile.size > maxSizeInBytes) {
        // Alerta nativa (o podrías usar un modal custom)
        alert("⚠️ El archivo es demasiado pesado.\n\nEl límite máximo permitido es de 20 MB.");
        
        // Limpiamos el input para que no se quede seleccionado
        e.target.value = ''; 
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let fileUrl = null;
      let fileName = null;

      if (file) {
        // Doble verificación de seguridad antes de subir
        if (file.size > 20 * 1024 * 1024) {
             throw new Error("El archivo supera los 20MB permitidos.");
        }

        // Usamos 'task-files' (con guion medio)
        const fileExt = file.name.split('.').pop();
        // Usamos un nombre único para evitar colisiones
        const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('task_files') 
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('task_files')
          .getPublicUrl(filePath);
          
        fileUrl = publicUrlData.publicUrl;
        fileName = file.name;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
            title,
            description,
            price: parseFloat(price) || 0,
            subject,
            type,
            contact_info: contactInfo,
            user_id: user.id,
            file_url: fileUrl,
            file_name: fileName,
            status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;
      if (onTaskCreated) onTaskCreated(data);
      onClose();

    } catch (error: any) {
      console.error('Error creating task:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose} 
          className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex-shrink-0">Publicar una nueva tarea</h2>

        <div className="overflow-y-auto pr-2 -mr-2">
          <form onSubmit={handleSubmit}>
            
            {/* Selector de Tipo */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setType('request')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  type === 'request'
                    ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/25 translate-y-[-2px]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Necesito Ayuda (Solicitud)
              </button>
              <button
                type="button"
                onClick={() => setType('offer')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  type === 'offer'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 translate-y-[-2px]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ofrezco Ayuda (Oferta)
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Título */}
              <div className="relative group">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={20} />
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all"
                  placeholder="Título de la tarea (Ej: Resolver ejercicios de Física)"
                />
              </div>

              {/* Descripción */}
              <div className="relative group">
                <AlignLeft className="absolute left-4 top-4 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={20} />
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all resize-none"
                  placeholder="Describe la tarea en detalle..."
                />
              </div>

              {/* Grid de 3 columnas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Materia */}
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                    placeholder="Materia (Ej: Cálculo)"
                  />
                </div>

                {/* Precio */}
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                    placeholder="Precio"
                  />
                </div>

                {/* Contacto */}
                <div className="relative group">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-purple transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-sm"
                    placeholder="WhatsApp o Correo"
                  />
                </div>
              </div>

              {/* Subida de Archivo (Con validación 20MB) */}
              <div className="relative">
                <input 
                  type="file" 
                  onChange={handleFileChange} // <--- AQUÍ USAMOS LA NUEVA FUNCIÓN
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? 'border-brand-purple bg-brand-purple/5' : 'border-gray-200 hover:border-brand-purple/50 hover:bg-gray-50'}`}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className={`p-3 rounded-full ${file ? 'bg-brand-purple/10 text-brand-purple' : 'bg-gray-100 text-gray-400'}`}>
                      <Upload size={24} />
                    </div>
                    {file ? (
                      <span className="text-sm font-medium text-brand-purple">{file.name} ({(file.size / (1024*1024)).toFixed(2)} MB)</span>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-gray-700">Sube un archivo adjunto</span>
                        <span className="text-xs text-gray-400">PDF, Imágenes o Word (Max 10MB)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-brand-purple to-brand-indigo text-white font-bold rounded-xl shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Publicando...
                </>
              ) : (
                'Publicar Tarea'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateTaskModal;