import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  profiles: Profile;
}

export type TaskType = 'request' | 'offer';
export type TaskStatus = 'open' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  subject: string;
  type: TaskType;
  price: number;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
  profiles: Profile;
}

export interface Group {
  id: string;
  name: string;
  image_url: string | null;
}

export interface PostLike {
  post_id: string;
  user_id: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Profile;
}
