
-- Atualizar o bucket lesson-videos com um limite menor mais compatível
UPDATE storage.buckets 
SET file_size_limit = 536870912  -- 512MB (mais realista para o Supabase)
WHERE id = 'lesson-videos';

-- Verificar os limites atuais dos buckets
SELECT id, name, file_size_limit, file_size_limit / (1024*1024) as size_mb 
FROM storage.buckets 
WHERE id IN ('lesson-videos', 'lesson-images', 'lesson-materials', 'module-images');
