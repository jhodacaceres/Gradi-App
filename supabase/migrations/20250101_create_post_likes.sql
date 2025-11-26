```sql
/*
  # Añadir Likes a las Publicaciones

  1.  **Nueva Tabla**: `post_likes` para almacenar los "me gusta" de cada publicación.
      -   `post_id`: Referencia a la publicación.
      -   `user_id`: Referencia al usuario que dio "me gusta".
      -   Clave primaria compuesta para asegurar que un usuario solo pueda dar "me gusta" una vez por publicación.
  2.  **Seguridad**: Habilitar RLS y añadir políticas para permitir a los usuarios gestionar sus propios "me gusta".
*/

CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id uuid NOT NULL REFERENCES public.posts ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los likes son visibles para todos."
ON public.post_likes
FOR SELECT
USING (true);

CREATE POLICY "Los usuarios pueden dar me gusta a las publicaciones."
ON public.post_likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden quitar su propio me gusta."
ON public.post_likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```