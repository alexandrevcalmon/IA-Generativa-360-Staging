
-- Criar bucket para imagens de módulos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'module-images',
  'module-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Criar bucket para imagens de aulas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-images',
  'lesson-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Criar bucket para vídeos de aulas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-videos',
  'lesson-videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
);

-- Criar bucket para materiais de aulas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-materials',
  'lesson-materials',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv']
);

-- Políticas RLS para module-images
CREATE POLICY "Anyone can view module images" ON storage.objects
FOR SELECT USING (bucket_id = 'module-images');

CREATE POLICY "Producers can upload module images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'module-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Producers can update module images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'module-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Producers can delete module images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'module-images' AND
  auth.uid() IS NOT NULL
);

-- Políticas RLS para lesson-images
CREATE POLICY "Anyone can view lesson images" ON storage.objects
FOR SELECT USING (bucket_id = 'lesson-images');

CREATE POLICY "Producers can upload lesson images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lesson-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Producers can update lesson images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'lesson-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Producers can delete lesson images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'lesson-images' AND
  auth.uid() IS NOT NULL
);

-- Políticas RLS para lesson-videos
CREATE POLICY "Anyone can view lesson videos" ON storage.objects
FOR SELECT USING (bucket_id = 'lesson-videos');

CREATE POLICY "Producers can upload lesson videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lesson-videos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Producers can update lesson videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'lesson-videos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Producers can delete lesson videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'lesson-videos' AND
  auth.uid() IS NOT NULL
);

-- Políticas RLS para lesson-materials
CREATE POLICY "Anyone can view lesson materials" ON storage.objects
FOR SELECT USING (bucket_id = 'lesson-materials');

CREATE POLICY "Producers can upload lesson materials" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lesson-materials' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Producers can update lesson materials" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'lesson-materials' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Producers can delete lesson materials" ON storage.objects
FOR DELETE USING (
  bucket_id = 'lesson-materials' AND
  auth.uid() IS NOT NULL
);

-- Adicionar colunas para armazenar URLs dos arquivos
ALTER TABLE course_modules ADD COLUMN image_url TEXT;
ALTER TABLE lessons ADD COLUMN image_url TEXT;
ALTER TABLE lessons ADD COLUMN video_file_url TEXT;
ALTER TABLE lessons ADD COLUMN material_url TEXT;
