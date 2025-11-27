import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Heart, MessageCircle, Send, Image as ImageIcon, Share2, User as UserIcon, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Post, PostComment } from '../types';
import { User } from '@supabase/supabase-js';
import CreatePost from './CreatePost';

interface FeedProps {
  user: User | null;
  onAuthAction: () => void;
}

const Comment = ({ comment }: { comment: PostComment }) => (
  <div className="flex items-start space-x-3">
    <img 
      src={comment.profiles.avatar_url || `https://ui-avatars.com/api/?name=${comment.profiles.full_name}&background=random`} 
      alt={comment.profiles.full_name || 'User'} 
      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
    />
    <div className="flex-1">
      <div className="bg-gray-100 rounded-xl p-3">
        <p className="font-semibold text-sm text-brand-text-primary break-words">{comment.profiles.full_name}</p>
        {comment.content && <p className="text-sm text-brand-text-secondary break-words whitespace-pre-wrap">{comment.content}</p>}
      </div>
      {comment.image_url && (
        <img src={comment.image_url} alt="Comment attachment" className="mt-2 rounded-lg w-full max-w-xs object-cover" />
      )}
      <p className="text-xs text-gray-400 mt-1 ml-2">{new Date(comment.created_at).toLocaleString()}</p>
    </div>
  </div>
);

const PostCard = ({ post, user, onAuthAction }: { post: Post, user: User | null, onAuthAction: () => void }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  // Comment form state
  const [newComment, setNewComment] = useState('');
  const [commentImageFile, setCommentImageFile] = useState<File | null>(null);
  const [commentPreviewUrl, setCommentPreviewUrl] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  useEffect(() => {
    const fetchPostMeta = async () => {
      const { count: likes } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
      setLikeCount(likes ?? 0);

      const { count: commentsCount } = await supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
      setCommentCount(commentsCount ?? 0);

      if (user) {
        const { data: userLike } = await supabase.from('post_likes').select('post_id').eq('post_id', post.id).eq('user_id', user.id).single();
        setIsLiked(!!userLike);
      } else {
        setIsLiked(false);
      }
    };
    fetchPostMeta();
  }, [post.id, user]);

  const handleLikeToggle = async () => {
    if (!user) { onAuthAction(); return; }
    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;
    setIsLiked(!originalIsLiked);
    setLikeCount(originalIsLiked ? originalLikeCount - 1 : originalLikeCount + 1);
    try {
      if (originalIsLiked) {
        await supabase.from('post_likes').delete().match({ post_id: post.id, user_id: user.id });
      } else {
        await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
      }
    } catch (error) {
      console.error("Error updating like status:", error);
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
    }
  };

  const fetchComments = async () => {
    if (!post.id) return;
    const { data, error } = await supabase
      .from('post_comments')
      .select(`id, content, image_url, created_at, profiles!user_id (full_name, avatar_url)`)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching comments:", error);
        throw new Error(`Error fetching comments: ${error.message}`);
    }
    setComments(data as PostComment[] || []);
  };

  const handleToggleComments = async () => {
    const shouldShow = !showComments;
    setShowComments(shouldShow);
    if (shouldShow && comments.length === 0 && commentCount > 0) {
      await fetchComments();
    }
  };

  const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setCommentError('La imagen no debe superar los 5MB.');
      setCommentImageFile(null);
      setCommentPreviewUrl(null);
      if (commentFileInputRef.current) commentFileInputRef.current.value = '';
      return;
    }
    setCommentError(null);
    setCommentImageFile(file);
    setCommentPreviewUrl(URL.createObjectURL(file));
  };

  const removeCommentImage = () => {
    setCommentImageFile(null);
    setCommentPreviewUrl(null);
    if (commentFileInputRef.current) commentFileInputRef.current.value = '';
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const contentToInsert = newComment.trim();
    if ((!contentToInsert && !commentImageFile) || !user) return;
    
    setIsSubmittingComment(true);
    setCommentError(null);
    let imageUrl: string | null = null;

    try {
      if (commentImageFile) {
        const filePath = `${user.id}/comments/${Date.now()}_${commentImageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, commentImageFile);
        if (uploadError) throw new Error(`Error en Storage: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const commentPayload: {
        post_id: string;
        user_id: string;
        content?: string;
        image_url: string | null;
      } = {
        post_id: post.id,
        user_id: user.id,
        image_url: imageUrl,
      };

      if (contentToInsert) {
        commentPayload.content = contentToInsert;
      }

      const { data: newCommentData, error: insertError } = await supabase
        .from('post_comments')
        .insert(commentPayload)
        .select(`*, profiles!user_id (full_name, avatar_url)`)
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(`Error en DB Insert: ${insertError.message}`);
      }

      if (newCommentData) {
        setComments(prevComments => [...prevComments, newCommentData as PostComment]);
        setCommentCount(prevCount => prevCount + 1);
      }

      setNewComment('');
      removeCommentImage();
    } catch (err: any) {
      console.error('Error al enviar comentario:', err);
      setCommentError(`No se pudo enviar el comentario. Inténtalo de nuevo.`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      await navigator.share({ title: `Publicación de ${post.profiles.full_name}`, text: post.content.substring(0, 100) + '...', url: postUrl });
    } else {
      navigator.clipboard.writeText(postUrl);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center mb-4">
        <img src={post.profiles.avatar_url || `https://ui-avatars.com/api/?name=${post.profiles.full_name}&background=random`} alt={post.profiles.full_name || 'User'} className="w-12 h-12 rounded-full object-cover mr-4" />
        <div>
          <p className="font-bold text-brand-text-primary">{post.profiles.full_name}</p>
          <p className="text-sm text-brand-text-secondary">{new Date(post.created_at).toLocaleString()}</p>
        </div>
      </div>
      <p className="text-brand-text-secondary mb-4 whitespace-pre-wrap break-words">{post.content}</p>
      {post.image_url && <img src={post.image_url} alt="Post content" className="rounded-lg w-full object-cover max-h-96 mb-4" />}
      <div className="flex items-center justify-between text-brand-text-secondary border-t border-gray-100 pt-4">
        <button onClick={handleLikeToggle} className={`flex items-center space-x-2 hover:text-pink-500 transition-colors ${isLiked ? 'text-pink-500' : ''}`}>
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} /> <span>{likeCount}</span>
        </button>
        <button onClick={handleToggleComments} className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
          <MessageCircle size={20} />
          <span className="hidden sm:inline">{commentCount} Comentarios</span>
          <span className="sm:hidden">{commentCount}</span>
        </button>
        <button onClick={handleShare} className="flex items-center space-x-2 hover:text-brand-purple transition-colors">
          <Share2 size={20} />
          <span className="hidden sm:inline">{shareStatus === 'copied' ? '¡Copiado!' : 'Compartir'}</span>
        </button>
      </div>
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">{comments.map(comment => <Comment key={comment.id} comment={comment} />)}</div>
          {user ? (
            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3">
              <img src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} className="w-9 h-9 rounded-full object-cover" />
              <div className="flex-1">
                <div className="border border-gray-200 rounded-lg p-2 focus-within:ring-2 focus-within:ring-brand-purple">
                  <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribe un comentario..." className="w-full focus:outline-none resize-none bg-transparent" rows={1} onInput={(e) => { const target = e.target as HTMLTextAreaElement; target.style.height = 'auto'; target.style.height = `${target.scrollHeight}px`; }} />
                  {commentPreviewUrl && (
                    <div className="mt-2 relative w-24 h-24">
                      <img src={commentPreviewUrl} alt="Preview" className="rounded-md w-full h-full object-cover" />
                      <button type="button" onClick={removeCommentImage} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"><X size={14} /></button>
                    </div>
                  )}
                </div>
                {commentError && <p className="text-red-500 text-sm mt-1">{commentError}</p>}
                <div className="flex justify-between items-center mt-2">
                  <button type="button" onClick={() => commentFileInputRef.current?.click()} className={`p-2 rounded-full transition-colors ${commentPreviewUrl ? 'text-brand-purple bg-purple-100' : 'text-gray-500 hover:bg-gray-100'}`}><ImageIcon size={20} /></button>
                  <input type="file" ref={commentFileInputRef} onChange={handleCommentFileChange} className="hidden" accept="image/png, image/jpeg, image/gif, image/webp" />
                  <button type="submit" disabled={isSubmittingComment || (!newComment.trim() && !commentImageFile)} className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-purple rounded-md hover:bg-brand-indigo transition-colors disabled:opacity-50">{isSubmittingComment ? '...' : 'Enviar'}</button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex items-start space-x-3 cursor-pointer" onClick={onAuthAction}>
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center"><UserIcon size={18} className="text-gray-400" /></div>
              <div className="flex-1 p-2 border border-gray-200 rounded-lg text-gray-400 hover:border-brand-purple transition">Escribe un comentario...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function Feed({ user, onAuthAction }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // FIX: Explicitly define the foreign key relationship to resolve ambiguity
        const { data, error: fetchError } = await supabase
          .from('posts')
          .select(`id, content, image_url, created_at, profiles!posts_user_id_fkey (full_name, avatar_url)`)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setPosts(data as any);
      } catch (err: any) {
        setError('No se pudieron cargar las publicaciones.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-brand-text-primary">Inicio</h1>
      <CreatePost user={user} onPostCreated={handlePostCreated} onAuthAction={onAuthAction} />
      
      {loading && <p className="text-center py-10">Cargando publicaciones...</p>}
      {error && <p className="text-red-500 text-center py-10">{error}</p>}
      
      <div className="space-y-6">
        {posts.map(post => <PostCard key={post.id} post={post} user={user} onAuthAction={onAuthAction} />)}
      </div>
    </div>
  );
}

export default Feed;
