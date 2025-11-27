import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface SettingsPageProps {
  user: User | null;
}

const SettingsPage = ({ user }: SettingsPageProps) => {
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata.full_name || '');
      setBio(user.user_metadata.bio || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.updateUser({
      data: { 
        full_name: fullName.trim(),
        bio: bio.trim()
      }
    });

    if (error) {
      setMessage({ type: 'error', text: 'No se pudo actualizar el perfil. Inténtalo de nuevo.' });
      console.error('Error updating profile:', error);
    } else {
      setMessage({ type: 'success', text: '¡Perfil actualizado con éxito!' });
    }
    setLoading(false);
  };

  if (!user) {
    return <div className="text-center p-8">Inicia sesión para ver tu perfil.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-text-primary mb-8">Mi Perfil y Configuración</h1>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-6 mb-8">
          <img 
            src={user.user_metadata.avatar_url} 
            alt={user.user_metadata.full_name} 
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold text-brand-text-primary">{user.user_metadata.full_name}</h2>
            <p className="text-brand-text-secondary">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-brand-text-secondary mb-2">Nombre Completo</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="bio" className="block text-sm font-medium text-brand-text-secondary mb-2">Biografía</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition"
              rows={4}
              placeholder="Cuéntanos un poco sobre ti..."
            />
          </div>
          
          {message && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
