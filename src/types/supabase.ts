export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          has_password: boolean;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          has_password?: boolean;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          has_password?: boolean;
          updated_at?: string | null;
          username?: string | null;
        };
      };
      // ... (resto del archivo igual)

      groups: {
        Row: {
          id: string;
          name: string;
          image_url: string | null;
          description: string | null;
          created_by: string | null;
          created_at: string;
          is_private: boolean; // <--- NUEVO
        };
        Insert: {
          id?: string;
          name: string;
          image_url?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          is_private?: boolean; // <--- NUEVO
        };
        Update: {
          id?: string;
          name?: string;
          image_url?: string | null;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          is_private?: boolean; // <--- NUEVO
        };
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          role: string;
          joined_at: string;
          status: string; // <--- NUEVO
          join_message: string | null; // <--- NUEVO
        };
        Insert: {
          group_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
          status?: string; // <--- NUEVO
          join_message?: string | null; // <--- NUEVO
        };
        Update: {
          group_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
          status?: string; // <--- NUEVO
          join_message?: string | null; // <--- NUEVO
        };
      };

      // ... (resto del archivo igual)
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          subject: string;
          type: Database["public"]["Enums"]["task_type"];
          price: number;
          due_date: string | null;
          status: Database["public"]["Enums"]["task_status"];
          file_url: string | null;
          file_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          subject: string;
          type: Database["public"]["Enums"]["task_type"];
          price?: number;
          due_date?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          file_url?: string | null;
          file_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          subject?: string;
          type?: Database["public"]["Enums"]["task_type"];
          price?: number;
          due_date?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          file_url?: string | null;
          file_name?: string | null;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          image_url?: string | null;
          created_at?: string;
        };
      };
      post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      // AQUÍ AGREGAMOS 'closed' QUE FALTABA
      task_status: "open" | "in_progress" | "completed" | "closed";
      task_type: "request" | "offer";
    };
  };
}
