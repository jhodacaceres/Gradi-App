import { PostgrestError } from "@supabase/supabase-js"

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  updated_at: string | null
  username: string | null
  website: string | null
}

export interface Post {
  id: number
  content: string
  image_url: string | null
  created_at: string
  user_id: string
  profiles: Profile
}

export interface PostComment {
  id: number
  content: string
  image_url?: string | null
  created_at: string
  post_id: number
  user_id: string
  profiles: Profile
}

export interface Group {
  id: number
  name: string
  description: string
  image_url: string | null
  created_by: string
  created_at: string
}

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
export type DbResultErr = PostgrestError
