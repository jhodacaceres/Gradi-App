import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Heart, MessageCircle, Send, Image as ImageIcon, Paperclip, FileText, X, File as FileIcon, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Group } from '../types';
import FileSizeWarningModal from './FileSizeWarningModal';

interface PostWithProfile {
  id: string;
  content: string;
  image_url: string | null;
  file_url?: string | null;
  file_name?: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface GroupFeedProps {
  user: User | null;
  group: Group;
  onBack: () => void;
}

// --- SUB-COMPONENTE: Tarjeta de Post ---
const GroupPostCard = ({ post, user }: { post: PostWithProfile, user: User | null }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  
  // Estados para nuevo comentario
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMeta();
  }, [post.id]);

  const fetchMeta = async () => {
    // Cargar Likes
    const { count: likes } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
    setLikeCount(likes || 0);
    
    // Cargar Comentarios Count
    const { count: comms } = await supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
    setCommentCount(comms || 0);

    // Verificar si di like
    if (user) {
      const { data } = await supabase.from('post_likes').select('user_id').eq('post_id', post.id).eq('user_id', user.id);
      setIsLiked(data && data.length > 0);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) return;
    const oldLiked = isLiked;
    setIsLiked(!oldLiked);
    setLikeCount(oldLiked ? likeCount - 1 : likeCount + 1);

    if (oldLiked) {
      await supabase.from('post_likes').delete().match({ post_id: post.id, user_id: user.id });
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('post_comments')
      .select(`id, content, created_at, profiles:user_id (id, full_name, avatar_url)`)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    setComments(data || []);
  };

  const toggleComments = () => {
    if (!showComments) fetchComments();
    setShowComments(!showComments);
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: post.id, user_id: user.id, content: newComment })
      .select(`id, content, created_at, profiles:user_id (id, full_name, avatar_url)`)
      .single();

    if (!error && data) {
      setComments([...comments, data]);
      setCommentCount(commentCount + 1);
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      {/* Header del Post */}
      <div className="flex items-center mb-4">
        <img 
          src={post.profiles.avatar_url || `https://ui-avatars.com/api/?name=${post.profiles.full_name}&background=random`} 
          alt={post.profiles.full_name} 
          className="w-12 h-12 rounded-full object-cover mr-4" 
        />
        <div>
          <h4 className="font-bold text-gray-900">{post.profiles.full_name}</h4>
          <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
        </div>
      </div>

      {/* Contenido Texto */}
      <p className="text-gray-800 mb-4 whitespace-pre-wrap break-words">{post.content}</p>

      {/* Contenido Imagen */}
      {post.image_url && (
        <img src={post.image_url} alt="Post content" className="rounded-lg w-full object-cover max-h-96 mb-4" />
      )}

      {/* Contenido Archivo */}
      {post.file_url && (
        <a 
          href={post.file_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors mb-4 group"
        >
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-brand-purple border border-gray-100 shadow-sm">
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{post.file_name || 'Documento adjunto'}</p>
            <p className="text-xs text-gray-500">Clic para descargar / ver</p>
          </div>
        </a>
      )}

      {/* Botones de Acción - SIN COMPARTIR */}
      <div className="flex items-center gap-6 text-gray-500 border-t border-gray-100 pt-4">
        <button onClick={handleLikeToggle} className={`flex items-center space-x-2 hover:text-pink-500 transition-colors ${isLiked ? 'text-pink-500' : ''}`}>
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} /> <span>{likeCount}</span>
        </button>
        <button onClick={toggleComments} className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
          <MessageCircle size={20} />
          <span className="hidden sm:inline">{commentCount} Comentarios</span>
          <span className="sm:hidden">{commentCount}</span>
        </button>
      </div>

      {/* Sección Comentarios */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
            {comments.map((comment: any) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <img src={comment.profiles.avatar_url || `https://ui-avatars.com/api/?name=${comment.profiles.full_name}`} className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="bg-gray-50 rounded-xl p-3 flex-1">
                  <p className="font-semibold text-xs text-gray-900">{comment.profiles.full_name}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          {user && (
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
               <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full" />
               <input 
                 type="text" 
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 placeholder="Escribe un comentario..."
                 className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 focus:ring-2 focus:ring-brand-purple focus:bg-white transition-all"
               />
               <button type="submit" disabled={isSubmitting || !newComment.trim()} className="text-brand-purple disabled:opacity-50">
                 <Send size={20} />
               </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function GroupFeed({ user, group, onBack }: GroupFeedProps) {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para crear Post
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSizeWarning, setShowSizeWarning] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [group.id]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (id, full_name, avatar_url)
      `)
      .eq('group_id', group.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data as any);
    }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setShowSizeWarning(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !selectedFile) || !user) return;
    setIsUploading(true);

    try {
      let imageUrl = null;
      let fileUrl = null;
      let fileName = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${group.id}/${Math.random()}.${fileExt}`;
        const isImage = selectedFile.type.startsWith('image/');
        const bucket = isImage ? 'images' : 'task_files';

        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, selectedFile);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        
        if (isImage) {
          imageUrl = publicUrlData.publicUrl;
        } else {
          fileUrl = publicUrlData.publicUrl;
          fileName = selectedFile.name;
        }
      }

      const { data: newPost, error } = await supabase.from('posts').insert({
        user_id: user.id,
        group_id: group.id,
        content: content,
        image_url: imageUrl,
        file_url: fileUrl,
        file_name: fileName
      }).select(`*, profiles:user_id (id, full_name, avatar_url)`).single();

      if (error) throw error;

      if (newPost) {
        setPosts([newPost as any, ...posts]);
        setContent('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error creating post', error);
      alert('Error al publicar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header de Navegación */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
          <p className="text-sm text-gray-500">Muro del Grupo</p>
        </div>
      </div>

      {/* Input de Nuevo Post */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleCreatePost}>
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center shrink-0 overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-brand-purple">Yo</span>
                )}
             </div>
             
             <div className="flex-1">
               <textarea
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 placeholder={`Comparte algo en ${group.name}...`}
                 className="w-full border-0 bg-transparent focus:ring-0 resize-none text-gray-700 placeholder-gray-400 text-lg min-h-[60px]"
               />
               
               {selectedFile && (
                 <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg mb-4 border border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {selectedFile.type.startsWith('image/') ? <ImageIcon size={16} /> : <Paperclip size={16} />}
                      <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                    </div>
                    <button type="button" onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                 </div>
               )}

               <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                 <div className="flex gap-2">
                   <button 
                     type="button" 
                     onClick={() => fileInputRef.current?.click()}
                     className="p-2 text-gray-400 hover:bg-purple-50 hover:text-brand-purple rounded-full transition-colors"
                     title="Adjuntar archivo o imagen"
                   >
                     {selectedFile ? <FileIcon size={20} className="text-brand-purple" /> : <Paperclip size={20} />}
                   </button>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileSelect} 
                     className="hidden" 
                     accept="image/*,.pdf,.doc,.docx,.xls,.txt"
                   />
                 </div>
                 <button 
                   type="submit" 
                   disabled={isUploading || (!content.trim() && !selectedFile)}
                   className="px-6 py-2 bg-brand-purple text-white rounded-full font-medium hover:bg-brand-indigo transition-colors disabled:opacity-50 flex items-center gap-2"
                 >
                   {isUploading ? 'Publicando...' : <><Send size={18} /> Publicar</>}
                 </button>
               </div>
             </div>
          </div>
        </form>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple mx-auto"></div></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500">No hay publicaciones aún.</p>
            <p className="text-sm text-gray-400">¡Sé el primero en escribir algo!</p>
          </div>
        ) : (
          posts.map(post => <GroupPostCard key={post.id} post={post} user={user} />)
        )}
      </div>
      
      {/* Modal de Advertencia 5MB */}
      <FileSizeWarningModal isOpen={showSizeWarning} onClose={() => setShowSizeWarning(false)} />
    </div>
  );
}