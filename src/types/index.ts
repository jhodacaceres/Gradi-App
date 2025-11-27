import { Database } from './supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type Post = Database['public']['Tables']['posts']['Row'] & {
  profiles: Profile;
};

export type PostLike = Database['public']['Tables']['post_likes']['Row'];

export type PostComment = Database['public']['Tables']['post_comments']['Row'] & {
  profiles: Profile;
};

export type Task = Database['public']['Tables']['tasks']['Row'] & {
  profiles: Profile;
};

export type Group = Database['public']['Tables']['groups']['Row'];

export type TaskType = 'request' | 'offer';
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'closed';


// Keep original User type for components that might still use it before full refactor
// or for parts of the app that don't rely on DB profiles.
export interface User {
  name: string;
  avatarUrl: string;
}
