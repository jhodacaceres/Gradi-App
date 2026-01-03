import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from "../lib/supabase";
import { User, Lock, Save, Loader2 } from 'lucide-react';
import { Profile } from '../types';

const UserSettingsPage = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');

  // Cargar datos iniciales cuando el perfil esté listo
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || ''); // Ya no dará error gracias a la corrección de tipos
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await (supabase.from('profiles') as any)
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Si el usuario ingresó una contraseña nueva
      if (password) {
        const { error: passError } = await supabase.auth.updateUser({ password: password });
        if (passError) throw passError;
        
        // Actualizar flag has_password
        await (supabase.from('profiles') as any)
          .from('profiles')
          .update({ has_password: true })
          .eq('id', user.id);
      }

      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      setPassword(''); // Limpiar campo contraseña
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al actualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* CORRECCIÓN: Título oscuro para verse en fondo claro */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Configuración de Usuario</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          
          {/* Mensajes de éxito/error */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* Sección Información General */}
            <div>
              <h2 className="text-xl font-semibold text-brand-purple mb-4 flex items-center gap-2">
                <User size={20} />
                Información General
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Cuéntanos algo sobre ti..."
                  />
                </div>
                
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Sección Seguridad */}
            <div>
              <h2 className="text-xl font-semibold text-brand-purple mb-4 flex items-center gap-2">
                <Lock size={20} />
                Seguridad
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all"
                  placeholder="Dejar en blanco para mantener la actual"
                />
                <p className="mt-1 text-xs text-gray-500">Solo llena esto si deseas cambiar tu contraseña.</p>
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Guardar Cambios
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;