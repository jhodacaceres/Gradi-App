export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
}

export interface Post {
  id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  user_id: string;
  profiles: Profile;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  profiles: Profile;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  due_date?: string | null;
  type: 'request' | 'offer';
  created_at: string;
  user_id: string;
  profiles: Profile;
}

export interface Group {
  id: string;
  created_at: string;
  name: string;
  description: string;
  image_url?: string | null;
  created_by: string;
}
