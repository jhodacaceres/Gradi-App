<boltAction type="file" filePath="src/components/LoginModal.tsx" operation="delete" />
<boltAction type="supabase" operation="migration" filePath="/supabase/migrations/01_create_initial_schema.sql">/*
  # Initial Schema Setup
  This migration sets up the core tables for the Gradi application.

  1.  **Enums**: `task_type` and `task_status` for the tasks table.
  2.  **Tables**:
      - `profiles`: Stores user data, linked to `auth.users`.
      - `posts`: For the main social feed.
      - `tasks`: For the task marketplace.
      - `groups`: For student groups.
  3.  **RLS**: Enables Row Level Security on all tables.
  4.  **Policies**: Sets up basic security policies for SELECT, INSERT, UPDATE, DELETE.
  5.  **Function & Trigger**: `handle_new_user` function to automatically create a profile when a new user signs up.
*/

-- Create custom types (enums)
CREATE TYPE public.task_type AS ENUM ('request', 'offer');
CREATE TYPE public.task_status AS ENUM ('open', 'in_progress', 'completed');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name text,
    avatar_url text
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    content text NOT NULL,
    image_url text,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable by authenticated users." ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own posts." ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts." ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts." ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    subject text NOT NULL,
    type public.task_type NOT NULL,
    price numeric(10, 2) NOT NULL DEFAULT 0,
    due_date date,
    status public.task_status NOT NULL DEFAULT 'open',
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tasks are viewable by authenticated users." ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own tasks." ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks." ON public.tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks." ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    image_url text
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groups are viewable by authenticated users." ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create groups." ON public.groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update groups." ON public.groups FOR UPDATE TO authenticated USING (true); -- Simplified for now
