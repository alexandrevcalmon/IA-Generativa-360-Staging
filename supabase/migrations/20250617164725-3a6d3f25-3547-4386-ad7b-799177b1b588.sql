
-- Verificar e corrigir as políticas RLS para company_users
-- Primeiro, vamos verificar se o usuário contato@grupocalmon.com deve ser um produtor
UPDATE public.profiles 
SET role = 'producer' 
WHERE id = 'bc555aa5-4278-40f3-8b1c-5ac45b22e18e';

-- Garantir que as políticas RLS estão corretas para produtores gerenciarem company_users
DROP POLICY IF EXISTS "Producers can view all company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can insert company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can update company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can delete company users" ON public.company_users;

-- Recriar as políticas RLS para company_users
CREATE POLICY "Producers can view all company users" 
  ON public.company_users 
  FOR SELECT 
  USING (public.is_producer(auth.uid()));

CREATE POLICY "Producers can insert company users" 
  ON public.company_users 
  FOR INSERT 
  WITH CHECK (public.is_producer(auth.uid()));

CREATE POLICY "Producers can update company users" 
  ON public.company_users 
  FOR UPDATE 
  USING (public.is_producer(auth.uid()));

CREATE POLICY "Producers can delete company users" 
  ON public.company_users 
  FOR DELETE 
  USING (public.is_producer(auth.uid()));

-- Adicionar políticas para que company_users possam ver seus próprios dados
CREATE POLICY "Company users can view their own data" 
  ON public.company_users 
  FOR SELECT 
  USING (auth_user_id = auth.uid());

CREATE POLICY "Company users can update their own data" 
  ON public.company_users 
  FOR UPDATE 
  USING (auth_user_id = auth.uid());
