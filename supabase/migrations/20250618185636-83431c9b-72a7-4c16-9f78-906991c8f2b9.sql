
-- Corrigir as políticas RLS para permitir que colaboradores vejam dados da sua empresa
-- Primeiro, remover políticas existentes problemáticas
DROP POLICY IF EXISTS "Producers have full access to company_users" ON public.company_users;
DROP POLICY IF EXISTS "Company users can access their own data" ON public.company_users;
DROP POLICY IF EXISTS "Producers can manage all company_users" ON public.company_users;
DROP POLICY IF EXISTS "Users can view their own company data" ON public.company_users;
DROP POLICY IF EXISTS "Users can update their own company data" ON public.company_users;

-- Recriar políticas mais específicas e funcionais para company_users
-- Política para produtores terem acesso total
CREATE POLICY "Producers can manage all company_users" 
  ON public.company_users 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- Política para colaboradores verem seus próprios dados
CREATE POLICY "Users can view their own company data" 
  ON public.company_users 
  FOR SELECT 
  USING (auth_user_id = auth.uid());

-- Política para colaboradores atualizarem seus próprios dados
CREATE POLICY "Users can update their own company data" 
  ON public.company_users 
  FOR UPDATE 
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Corrigir políticas da tabela companies para colaboradores verem dados da empresa
DROP POLICY IF EXISTS "Producers can manage all companies" ON public.companies;
DROP POLICY IF EXISTS "Companies can view their own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can update their own data" ON public.companies;
DROP POLICY IF EXISTS "Collaborators can view their company data" ON public.companies;

-- Política para produtores gerenciarem todas as empresas
CREATE POLICY "Producers can manage all companies" 
  ON public.companies 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- Política para empresas verem seus próprios dados
CREATE POLICY "Companies can view their own data" 
  ON public.companies 
  FOR SELECT 
  USING (auth_user_id = auth.uid());

-- Política para empresas atualizarem seus próprios dados
CREATE POLICY "Companies can update their own data" 
  ON public.companies 
  FOR UPDATE 
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Nova política para colaboradores verem dados da empresa onde trabalham
CREATE POLICY "Collaborators can view their company data" 
  ON public.companies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users 
      WHERE auth_user_id = auth.uid() 
      AND company_id = companies.id
    )
  );

-- Atualizar perfis existentes para manter consistência
-- Colaboradores que estão na tabela company_users devem ter role 'collaborator'
UPDATE public.profiles 
SET role = 'collaborator' 
WHERE id IN (
  SELECT DISTINCT auth_user_id 
  FROM public.company_users
);

-- Empresas devem ter role 'company' na tabela profiles
UPDATE public.profiles 
SET role = 'company' 
WHERE id IN (
  SELECT DISTINCT auth_user_id 
  FROM public.companies 
  WHERE auth_user_id IS NOT NULL
);
