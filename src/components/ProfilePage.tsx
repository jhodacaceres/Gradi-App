import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { Camera, Edit3, Save, User as UserIcon, BookOpen, Briefcase } from 'lucide-react';

interface ProfilePageProps {
  user: User | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [university, setUniversity] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
        setFullName(data.full_name || '');
        setBio(data.bio || '');
        setUniversity(data.university || '');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !profile) return;

    setIsUploading(true);
    let avatar_url = profile.avatar_url;

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        alert('Error al subir la nueva imagen de perfil.');
      } else {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatar_url = `${urlData.publicUrl}?t=${new Date().getTime()}`;
      }
    }

    const updates = {
      id: user.id,
      full_name: fullName,
      bio,
      university,
      avatar_url,
      updated_at: new Date(),
    };

    const { data, error } = await supabase.from('profiles').upsert(updates).select().single();

    if (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil.');
    } else {
      setProfile(data);
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsEditing(false);
      // Consider a global state update or page reload to reflect changes in the header
      window.location.reload();
    }
    setIsUploading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-purple"></div></div>;
  }

  if (!profile) {
    return <div className="text-center py-10">No se pudo cargar el perfil.</div>;
  }

  const avatarSrc = avatarPreview || profile.avatar_url || `https://ui-avatars.com/api/?name=${fullName}&background=random&color=fff&size=128`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-brand-purple to-brand-indigo relative">
          <div className="absolute -bottom-16 left-8">
            <div className="relative group">
              <img src={avatarSrc} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
              {isEditing && (
                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={32} className="text-white" />
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start">
            <div>
              {isEditing ? (
                <input 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-3xl font-bold text-brand-text-primary border-b-2 border-gray-200 focus:border-brand-purple outline-none"
                />
              ) : (
                <h1 className="text-3xl font-bold text-brand-text-primary">{profile.full_name}</h1>
              )}
              <p className="text-brand-text-secondary">@{profile.full_name?.toLowerCase().replace(/\s+/g, '') || 'usuario'}</p>
            </div>
            <div>
              {isEditing ? (
                <button onClick={handleUpdateProfile} disabled={isUploading} className="flex items-center space-x-2 px-5 py-2.5 bg-green-500 text-white rounded-lg font-semibold shadow-md hover:bg-green-600 transition disabled:opacity-50">
                  <Save size={18} />
                  <span>{isUploading ? 'Guardando...' : 'Guardar'}</span>
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-brand-purple to-brand-indigo text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition">
                  <Edit3 size={18} />
                  <span>Editar Perfil</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <h2 className="text-xl font-bold text-brand-text-primary mb-4">Sobre mí</h2>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition"
                rows={4}
                placeholder="Cuéntanos un poco sobre ti..."
              />
            ) : (
              <p className="text-brand-text-secondary">{profile.bio || 'Aún no has añadido una biografía.'}</p>
            )}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-brand-text-primary mb-2 flex items-center"><BookOpen size={18} className="mr-2 text-brand-purple" /> Universidad</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition"
                  placeholder="¿Dónde estudias?"
                />
              ) : (
                <p className="text-brand-text-secondary">{profile.university || 'No especificado'}</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-brand-text-primary mb-2 flex items-center"><UserIcon size={18} className="mr-2 text-brand-purple" /> Miembro desde</h3>
              <p className="text-brand-text-secondary">{new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
