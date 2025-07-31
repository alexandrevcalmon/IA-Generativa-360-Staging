-- Adicionar campos para integração com Bunny.net
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS bunny_video_id uuid;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS bunny_library_id bigint;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS bunny_video_status varchar(50) DEFAULT 'pending';
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS bunny_embed_url text;

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_lessons_bunny_video_id ON public.lessons(bunny_video_id);
CREATE INDEX IF NOT EXISTS idx_lessons_bunny_status ON public.lessons(bunny_video_status);

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.lessons.bunny_video_id IS 'ID único do vídeo no Bunny.net Stream';
COMMENT ON COLUMN public.lessons.bunny_library_id IS 'ID da biblioteca de vídeos no Bunny.net';
COMMENT ON COLUMN public.lessons.bunny_video_status IS 'Status do processamento do vídeo: pending, processing, ready, error';
COMMENT ON COLUMN public.lessons.bunny_embed_url IS 'URL de embed do player do Bunny.net'; 