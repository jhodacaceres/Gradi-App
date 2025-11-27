import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, Post } from '../types';
import { PostCard } from '../components/Feed';
import { Edit } from 'lucide-react';

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
        // Fetch profile details
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError || !profileData) {
          throw new Error('No se pudo encontrar el perfil del usuario.');
        }
        setProfile(profileData);

        // Fetch user's posts
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center p-8">Perfil no encontrado.</div>;
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
          <img 
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=random`} 
            alt={profile.full_name || 'Usuario'} 
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start space-x-4">
              <h1 className="text-3xl font-bold text-brand-text-primary">{profile.full_name}</h1>
              {isOwnProfile && (
                <Link to="/configuracion" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Edit size={18} className="text-brand-text-secondary" />
                </Link>
              )}
            </div>
            <p className="text-brand-text-secondary mt-2">{profile.bio || 'Este usuario aún no ha añadido una biografía.'}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-brand-text-primary mb-6">Publicaciones</h2>
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} user={currentUser} onAuthAction={onAuthAction} />)
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-brand-text-secondary">Este usuario aún no ha realizado ninguna publicación.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
