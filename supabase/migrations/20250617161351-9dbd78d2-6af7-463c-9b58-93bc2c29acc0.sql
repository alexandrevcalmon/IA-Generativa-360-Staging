
-- Corrigir as políticas RLS para permitir que produtores gerenciem company_users
-- Remover todas as políticas existentes primeiro
DROP POLICY IF EXISTS "Producers can manage company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can insert company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can update company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can view all company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can delete company users" ON public.company_users;

-- Criar políticas que permitem produtores gerenciar company_users
CREATE POLICY "Producers can insert company users" 
  ON public.company_users 
  FOR INSERT 
  WITH CHECK (public.is_producer(auth.uid()));

CREATE POLICY "Producers can update company users" 
  ON public.company_users 
  FOR UPDATE 
  USING (public.is_producer(auth.uid()));

CREATE POLICY "Producers can view all company users" 
  ON public.company_users 
  FOR SELECT 
  USING (public.is_producer(auth.uid()));

CREATE POLICY "Producers can delete company users" 
  ON public.company_users 
  FOR DELETE 
  USING (public.is_producer(auth.uid()));

-- Adicionar campo de telefone na tabela company_users
ALTER TABLE public.company_users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
