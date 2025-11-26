/*
  # Añadir Comentarios a las Publicaciones

  1.  **Nueva Tabla**: `post_comments` para almacenar los comentarios de cada publicación.
      -   `id`: Identificador único para cada comentario.
      -   `post_id`: Referencia a la publicación comentada.
      -   `user_id`: Referencia al autor del comentario.
      -   `content`: El texto del comentario.
  2.  **Seguridad**: Habilitar RLS y añadir políticas para que los usuarios autenticados puedan leer, crear y eliminar sus propios comentarios.
*/

CREATE TABLE IF NOT EXISTS public.post_comments (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES public.posts ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los comentarios son visibles para usuarios autenticados."
ON public.post_comments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Los usuarios pueden crear comentarios."
ON public.post_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios comentarios."
ON public.post_comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);