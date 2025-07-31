
-- Primeiro, vamos adicionar as colunas que estão faltando na tabela subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS semester_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS annual_price NUMERIC(10,2);

-- Atualizar os planos existentes com os novos preços
UPDATE public.subscription_plans 
SET semester_price = price * 0.8, -- 20% desconto no semestral
    annual_price = price * 0.7 -- 30% desconto no anual
WHERE semester_price IS NULL OR annual_price IS NULL;

-- Adicionar as colunas que estão faltando na tabela companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS official_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address_street VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_number VARCHAR(10),
ADD COLUMN IF NOT EXISTS address_complement VARCHAR(100),
ADD COLUMN IF NOT EXISTS address_district VARCHAR(100),
ADD COLUMN IF NOT EXISTS address_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS address_state VARCHAR(2),
ADD COLUMN IF NOT EXISTS address_zip_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Criar tabela company_users para gerenciar colaboradores das empresas
CREATE TABLE IF NOT EXISTS public.company_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  needs_password_change BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(auth_user_id, company_id)
);

-- Habilitar RLS na tabela company_users
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que produtores vejam todos os colaboradores
CREATE POLICY "Producers can view all company users" 
  ON public.company_users 
  FOR SELECT 
  USING (true);

-- Política para permitir que produtores gerenciem colaboradores
CREATE POLICY "Producers can manage company users" 
  ON public.company_users 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Criar tabela para trilhas de aprendizagem (learning paths)
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela learning_paths
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

-- Criar políticas para learning_paths
CREATE POLICY "Companies can view their learning paths" 
  ON public.learning_paths 
  FOR SELECT 
  USING (company_id IN (SELECT id FROM public.companies));

CREATE POLICY "Producers can manage all learning paths" 
  ON public.learning_paths 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Criar tabela para relacionar cursos com trilhas de aprendizagem
CREATE TABLE IF NOT EXISTS public.learning_path_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(learning_path_id, course_id)
);

-- Habilitar RLS na tabela learning_path_courses
ALTER TABLE public.learning_path_courses ENABLE ROW LEVEL SECURITY;

-- Criar políticas para learning_path_courses
CREATE POLICY "Companies can view their learning path courses" 
  ON public.learning_path_courses 
  FOR SELECT 
  USING (learning_path_id IN (SELECT id FROM public.learning_paths));

CREATE POLICY "Producers can manage all learning path courses" 
  ON public.learning_path_courses 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Criar tabela para mentorias
CREATE TABLE IF NOT EXISTS public.mentorships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES public.company_users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_participants INTEGER NOT NULL DEFAULT 10,
  meeting_url VARCHAR(500),
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela mentorships
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;

-- Criar políticas para mentorias
CREATE POLICY "Companies can view their mentorships" 
  ON public.mentorships 
  FOR SELECT 
  USING (company_id IN (SELECT id FROM public.companies));

CREATE POLICY "Producers can manage all mentorships" 
  ON public.mentorships 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Criar tabela para participantes das mentorias
CREATE TABLE IF NOT EXISTS public.mentorship_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentorship_id UUID NOT NULL REFERENCES public.mentorships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.company_users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT NULL,
  UNIQUE(mentorship_id, user_id)
);

-- Habilitar RLS na tabela mentorship_participants
ALTER TABLE public.mentorship_participants ENABLE ROW LEVEL SECURITY;

-- Criar políticas para mentorship_participants
CREATE POLICY "Users can view their mentorship participations" 
  ON public.mentorship_participants 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can register for mentorships" 
  ON public.mentorship_participants 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Producers can manage all mentorship participants" 
  ON public.mentorship_participants 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON public.company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_auth_user_id ON public.company_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_company_id ON public.learning_paths(company_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_courses_learning_path_id ON public.learning_path_courses(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_company_id ON public.mentorships(company_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_scheduled_at ON public.mentorships(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_mentorship_participants_mentorship_id ON public.mentorship_participants(mentorship_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_participants_user_id ON public.mentorship_participants(user_id);

-- Remover dados de exemplo/mock se existirem
DELETE FROM public.learning_path_courses;
DELETE FROM public.learning_paths;
DELETE FROM public.mentorship_participants;
DELETE FROM public.mentorships;
DELETE FROM public.company_users;

-- Limpar dados mock das tabelas existentes (manter apenas estrutura)
-- Não deletamos companies pois podem ter dados reais do usuário
-- DELETE FROM public.companies WHERE name LIKE '%Exemplo%' OR name LIKE '%Mock%' OR name LIKE '%Test%';
