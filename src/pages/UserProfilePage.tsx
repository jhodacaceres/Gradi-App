import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, Post } from '../types';
import { PostCard } from '../components/Feed';
import { Edit, Share2 } from 'lucide-react'; // Agregué Share2 por si quieres un botón extra visual

interface UserProfilePageProps {
  currentUser: User | null;
  onAuthAction: () => void;
}

const UserProfilePage = ({ currentUser, onAuthAction }: UserProfilePageProps) => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Obtener datos del perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError || !profileData) {
          throw new Error('No se pudo encontrar el perfil del usuario.');
        }
        setProfile(profileData);

        // 2. Obtener publicaciones del usuario
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`*, profiles!posts_user_id_fkey (id, full_name, avatar_url)`)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (postsError) {
          throw new Error('No se pudieron cargar las publicaciones del usuario.');
        }
        setPosts(postsData as any);

      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500 font-medium">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center p-8 text-gray-500">Perfil no encontrado.</div>;
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      
      {/* --- TARJETA DE PERFIL --- */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        
        {/* 1. Portada / Banner (Gradiente) */}
        <div className="h-40 w-full bg-gradient-to-r from-purple-600 to-indigo-600"></div>

        {/* 2. Contenido del Perfil */}
        <div className="px-6 pb-8">
          
          {/* Contenedor del Avatar (Margen negativo para subirlo) */}
          <div className="relative flex flex-col items-center -mt-16">
            
            {/* Imagen del Avatar */}
            <img 
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=9E7FFF&color=fff`} 
              alt={profile.full_name || 'Usuario'} 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg bg-white"
            />

            {/* Texto: Nombre y Bio (Colores Oscuros para fondo blanco) */}
            <div className="mt-4 text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.full_name}
              </h1>
              <p className="mt-2 text-gray-500 max-w-lg mx-auto">
                {profile.bio || 'Este usuario aún no ha añadido una biografía.'}
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="mt-6 flex gap-3">
              {isOwnProfile && (
                <Link 
                  to="/configuracion" 
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition font-medium shadow-md shadow-purple-200"
                >
                  <Edit size={18} />
                  <span>Editar Perfil</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* --- LISTA DE PUBLICACIONES --- */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pl-2">Publicaciones</h2>
      
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              user={currentUser} 
              onAuthAction={onAuthAction} 
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Este usuario aún no ha realizado ninguna publicación.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;