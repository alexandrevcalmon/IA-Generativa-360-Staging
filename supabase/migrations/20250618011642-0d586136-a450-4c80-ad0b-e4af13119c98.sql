
-- Criar tabela para tópicos da comunidade
CREATE TABLE public.community_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title CHARACTER VARYING NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  author_name CHARACTER VARYING NOT NULL,
  author_email CHARACTER VARYING NOT NULL,
  company_name CHARACTER VARYING,
  category CHARACTER VARYING DEFAULT 'general',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para respostas dos tópicos
CREATE TABLE public.community_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.community_topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  author_name CHARACTER VARYING NOT NULL,
  author_email CHARACTER VARYING NOT NULL,
  company_name CHARACTER VARYING,
  likes_count INTEGER NOT NULL DEFAULT 0,
  is_solution BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para curtidas dos tópicos
CREATE TABLE public.community_topic_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.community_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(topic_id, user_id)
);

-- Criar tabela para curtidas das respostas
CREATE TABLE public.community_reply_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID NOT NULL REFERENCES public.community_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reply_id, user_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.community_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_topic_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reply_likes ENABLE ROW LEVEL SECURITY;

-- Políticas para tópicos - todos podem visualizar
CREATE POLICY "Everyone can view community topics"
  ON public.community_topics
  FOR SELECT
  USING (true);

-- Políticas para tópicos - usuários autenticados podem criar
CREATE POLICY "Authenticated users can create topics"
  ON public.community_topics
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Políticas para tópicos - autores e produtores podem editar
CREATE POLICY "Authors and producers can update topics"
  ON public.community_topics
  FOR UPDATE
  USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- Políticas para tópicos - autores e produtores podem deletar
CREATE POLICY "Authors and producers can delete topics"
  ON public.community_topics
  FOR DELETE
  USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- Políticas para respostas - todos podem visualizar
CREATE POLICY "Everyone can view community replies"
  ON public.community_replies
  FOR SELECT
  USING (true);

-- Políticas para respostas - usuários autenticados podem criar
CREATE POLICY "Authenticated users can create replies"
  ON public.community_replies
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Políticas para respostas - autores e produtores podem editar
CREATE POLICY "Authors and producers can update replies"
  ON public.community_replies
  FOR UPDATE
  USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- Políticas para respostas - autores e produtores podem deletar
CREATE POLICY "Authors and producers can delete replies"
  ON public.community_replies
  FOR DELETE
  USING (
    auth.uid() = author_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- Políticas para curtidas de tópicos
CREATE POLICY "Users can manage their topic likes"
  ON public.community_topic_likes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para curtidas de respostas
CREATE POLICY "Users can manage their reply likes"
  ON public.community_reply_likes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Função para atualizar contadores de curtidas automaticamente
CREATE OR REPLACE FUNCTION update_topic_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_topics 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_topics 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_reply_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_replies 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.reply_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_replies 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.reply_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_topic_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_topics 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_topics 
    SET replies_count = replies_count - 1 
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
CREATE TRIGGER topic_likes_count_trigger
  AFTER INSERT OR DELETE ON public.community_topic_likes
  FOR EACH ROW EXECUTE FUNCTION update_topic_likes_count();

CREATE TRIGGER reply_likes_count_trigger
  AFTER INSERT OR DELETE ON public.community_reply_likes
  FOR EACH ROW EXECUTE FUNCTION update_reply_likes_count();

CREATE TRIGGER topic_replies_count_trigger
  AFTER INSERT OR DELETE ON public.community_replies
  FOR EACH ROW EXECUTE FUNCTION update_topic_replies_count();
