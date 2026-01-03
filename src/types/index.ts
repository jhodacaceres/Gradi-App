import { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from './supabase'; // Asegúrate que apunte a tu archivo supabase.ts

// 1. Atajos para no escribir tanto
type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

// 2. Definición del Usuario (Directo de Supabase Auth)
export type User = SupabaseUser;

// 3. TABLAS (Aquí está la magia: Usamos '=' para que sea un espejo exacto)
// Al hacer esto, Profile tendrá 'bio' y 'has_password' automáticamente.
export type Profile = Tables['profiles']['Row'];
export type ProfileUpdate = Tables['profiles']['Update'];
export type Group = Tables['groups']['Row'];
export type GroupMember = Tables['group_members']['Row'];
export type PostLike = Tables['post_likes']['Row'];

// 4. Tablas con Relaciones (Joins)
export type Post = Tables['posts']['Row'] & {
  profiles: Profile | null;
};

export type PostComment = Tables['post_comments']['Row'] & {
  profiles: Profile | null;
};

export type Task = Tables['tasks']['Row'] & {
  profiles: Profile | null;
  contact_info?: string | null;
};

// 5. Enums
export type TaskType = Enums['task_type'];
export type TaskStatus = Enums['task_status'];

