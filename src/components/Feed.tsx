import React, { useState, useEffect, FormEvent } from 'react';
import { Heart, MessageCircle, Send, Image as ImageIcon, Share2, User as UserIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Post, PostComment } from '../types';
import { User } from '@supabase/supabase-js';

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
        <p className="text-sm text-brand-text-secondary break-words">{comment.content}</p>
      </div>
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
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    const fetchPostMeta = async () => {
      // Fetch likes
      const { count: likes } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      setLikeCount(likes ?? 0);

      // Fetch comments count
      const { count: commentsCount } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      setCommentCount(commentsCount ?? 0);

      if (user) {
        const { data: userLike } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single();
        setIsLiked(!!userLike);
      } else {
        setIsLiked(false);
      }
    };
    fetchPostMeta();
  }, [post.id, user]);

  const handleLikeToggle = async () => {
    if (!user) {
      onAuthAction();
      return;
    }

    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;

    // Optimistic UI update
    setIsLiked(!originalIsLiked);
    setLikeCount(originalIsLiked ? originalLikeCount - 1 : originalLikeCount + 1);

    try {
      if (originalIsLiked) {
        const { error } = await supabase.from('post_likes').delete().match({ post_id: post.id, user_id: user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error updating like status:", error);
      // Revert UI on error
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
    }
  };

  const handleToggleComments = async () => {
    const shouldShow = !showComments;
    setShowComments(shouldShow);
    if (shouldShow && comments.length === 0 && commentCount > 0) {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*, profiles(*)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      if (error) console.error('Error fetching comments:', error);
      else setComments(data as PostComment[]);
    }
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setIsSubmittingComment(true);
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: post.id, user_id: user.id, content: newComment })
      .select('*, profiles(*)')
      .single();
    
    if (error) {
      console.error('Error posting comment:', error);
    } else if (data) {
      setComments(prev => [...prev, data as PostComment]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
    }
    setIsSubmittingComment(false);
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: `Publicación de ${post.profiles.full_name}`,
      text: post.content.substring(0, 100) + '...',
      url: postUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error al compartir:', error);
      }
    } else {
      navigator.clipboard.writeText(postUrl);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center mb-4">
        <img 
          src={post.profiles.avatar_url || `https://ui-avatars.com/api/?name=${post.profiles.full_name}&background=random`} 
          alt={post.profiles.full_name || 'User'} 
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <p className="font-bold text-brand-text-primary">{post.profiles.full_name}</p>
          <p className="text-sm text-brand-text-secondary">{new Date(post.created_at).toLocaleString()}</p>
        </div>
      </div>
      <p className="text-brand-text-secondary mb-4 whitespace-pre-wrap break-words">{post.content}</p>
      {post.image_url && (
        <img src={post.image_url} alt="Post content" className="rounded-lg w-full object-cover max-h-96 mb-4" />
      )}
      <div className="flex items-center justify-between text-brand-text-secondary border-t border-gray-100 pt-4">
        <button onClick={handleLikeToggle} className={`flex items-center space-x-2 hover:text-pink-500 transition-colors ${isLiked ? 'text-pink-500' : ''}`}>
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
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
          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
            {comments.map(comment => <Comment key={comment.id} comment={comment} />)}
          </div>
          {user ? (
            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3">
              <img src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} className="w-9 h-9 rounded-full object-cover" />
              <div className="flex-1 relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="w-full p-2 pr-20 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none transition resize-none"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
                <button type="submit" disabled={isSubmittingComment || !newComment.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-semibold text-white bg-brand-purple rounded-md hover:bg-brand-indigo transition-colors disabled:opacity-50">
                  {isSubmittingComment ? '...' : 'Enviar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-start space-x-3 cursor-pointer" onClick={onAuthAction}>
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon size={18} className="text-gray-400" />
              </div>
              <div className="flex-1 p-2 border border-gray-200 rounded-lg text-gray-400 hover:border-brand-purple transition">
                Escribe un comentario...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CreatePost = ({ user, onPostCreated, onAuthAction }: { user: User | null, onPostCreated: (post: Post) => void, onAuthAction: () => void }) => {
  const [content, setContent] = useState('');

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    const { data, error } = await supabase
      .from('posts')
      .insert({ content, user_id: user.id })
      .select(`*, profiles (*)`)
      .single();

    if (error) {
      console.error('Error creating post:', error);
    } else if (data) {
      setContent('');
      onPostCreated(data as Post);
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
          <div className="flex items-center justify-between mt-4">
            <button type="button" className="text-gray-500 hover:text-brand-purple transition-colors">
              <ImageIcon size={22} />
            </button>
            <button type="submit" className="px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-lg shadow-sm hover:shadow-md transition-shadow">
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Feed({ user, onAuthAction }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        setError('No se pudieron cargar las publicaciones.');
      } else {
        setPosts(data as any);
      }
      setLoading(false);
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
