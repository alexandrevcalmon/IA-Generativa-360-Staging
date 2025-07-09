
-- Habilitar RLS para as tabelas da comunidade se ainda não estiver habilitado
ALTER TABLE public.community_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_topic_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reply_likes ENABLE ROW LEVEL SECURITY;

-- Políticas para community_topics
-- Permitir que todos os usuários autenticados vejam tópicos
CREATE POLICY "Authenticated users can view topics" ON public.community_topics
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Permitir que usuários autenticados criem tópicos
CREATE POLICY "Authenticated users can create topics" ON public.community_topics
FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Permitir que autores atualizem seus próprios tópicos
CREATE POLICY "Authors can update their own topics" ON public.community_topics
FOR UPDATE USING (auth.uid() = author_id);

-- Permitir que produtores e autores deletem tópicos
CREATE POLICY "Authors and producers can delete topics" ON public.community_topics
FOR DELETE USING (
  auth.uid() = author_id OR 
  public.is_producer(auth.uid())
);

-- Políticas para community_replies
-- Permitir que todos os usuários autenticados vejam respostas
CREATE POLICY "Authenticated users can view replies" ON public.community_replies
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Permitir que usuários autenticados criem respostas
CREATE POLICY "Authenticated users can create replies" ON public.community_replies
FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Permitir que autores atualizem suas próprias respostas
CREATE POLICY "Authors can update their own replies" ON public.community_replies
FOR UPDATE USING (auth.uid() = author_id);

-- Permitir que autores e produtores deletem respostas
CREATE POLICY "Authors and producers can delete replies" ON public.community_replies
FOR DELETE USING (
  auth.uid() = author_id OR 
  public.is_producer(auth.uid())
);

-- Políticas para community_topic_likes
-- Permitir que usuários vejam curtidas
CREATE POLICY "Users can view topic likes" ON public.community_topic_likes
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Permitir que usuários curtam tópicos
CREATE POLICY "Users can like topics" ON public.community_topic_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários removam suas próprias curtidas
CREATE POLICY "Users can remove their own topic likes" ON public.community_topic_likes
FOR DELETE USING (auth.uid() = user_id);

-- Políticas para community_reply_likes
-- Permitir que usuários vejam curtidas em respostas
CREATE POLICY "Users can view reply likes" ON public.community_reply_likes
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Permitir que usuários curtam respostas
CREATE POLICY "Users can like replies" ON public.community_reply_likes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários removam suas próprias curtidas
CREATE POLICY "Users can remove their own reply likes" ON public.community_reply_likes
FOR DELETE USING (auth.uid() = user_id);
