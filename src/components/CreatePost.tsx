import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Post } from '../types';
import { User } from '@supabase/supabase-js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CreatePost = ({ user, onPostCreated, onAuthAction }: { user: User | null, onPostCreated: (post: Post) => void, onAuthAction: () => void }) => {
  const [content, setContent] = useState('');
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

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const contentToInsert = content.trim();
    if ((!contentToInsert && !imageFile) || !user) return;

    setIsSubmitting(true);
    setError(null);
    let imageUrl: string | null = null;

    try {
      if (imageFile) {
        const filePath = `${user.id}/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        imageUrl = urlData.publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert({ 
          content: contentToInsert, 
          user_id: user.id,
          image_url: imageUrl
        })
        .select(`*, profiles!user_id (*)`)
        .single();

      if (insertError) {
        throw insertError;
      }

      if (data) {
        setContent('');
        removeImage();
        onPostCreated(data as Post);
      }
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError('No se pudo crear la publicación. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div 
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center cursor-pointer hover:border-brand-purple transition"
        onClick={onAuthAction}
      >
        <p className="text-brand-text-secondary font-medium">Inicia sesión para publicar y comentar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-start space-x-4">
        <img 
          src={user.user_metadata.avatar_url} 
          alt={user.user_metadata.full_name} 
          className="w-12 h-12 rounded-full object-cover"
        />
        <form onSubmit={handlePost} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition"
            rows={3}
            placeholder={`¿Qué estás pensando, ${user.user_metadata.full_name}?`}
          ></textarea>
          
          {previewUrl && (
            <div className="mt-3 relative">
              <img src={previewUrl} alt="Preview" className="rounded-lg max-h-80 w-full object-cover" />
              <button 
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                aria-label="Remove image"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="flex items-center justify-between mt-4">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-full transition-colors ${previewUrl ? 'bg-purple-100 text-brand-purple' : 'text-gray-500 hover:bg-gray-100'}`}
              aria-label="Add image"
            >
              <ImageIcon size={22} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/gif, image/webp"
            />
            <button type="submit" className="px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed" disabled={(!content.trim() && !imageFile) || isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
