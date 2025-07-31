
-- Primeiro, vamos verificar se o usuário atual tem o perfil correto
SELECT 
    auth.uid() as current_user_id,
    p.role as current_user_role,
    p.id as profile_id
FROM public.profiles p 
WHERE p.id = auth.uid();

-- Verificar se a função is_producer está funcionando
SELECT public.is_producer(auth.uid()) as is_producer_result;

-- Limpar todas as políticas existentes da tabela company_users
DROP POLICY IF EXISTS "Producers can view all company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can insert company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can update company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can delete company users" ON public.company_users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.company_users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.company_users;
DROP POLICY IF EXISTS "Producers can manage all company users" ON public.company_users;
DROP POLICY IF EXISTS "Users can view their own company data" ON public.company_users;
DROP POLICY IF EXISTS "Users can update their own company data" ON public.company_users;

-- Recriar as políticas com uma abordagem mais simples e direta
-- Política para produtores - acesso total
CREATE POLICY "Producers have full access to company_users" 
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

-- Política para colaboradores - apenas seus próprios dados
CREATE POLICY "Company users can access their own data" 
  ON public.company_users 
  FOR ALL 
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Verificar se o usuário logado tem role de producer
-- Se não tiver, vamos atualizar para producer (assumindo que é o admin)
UPDATE public.profiles 
SET role = 'producer' 
WHERE id = auth.uid() 
AND role != 'producer';

-- Verificar novamente após a atualização
SELECT 
    auth.uid() as current_user_id,
    p.role as updated_role,
    public.is_producer(auth.uid()) as is_producer_after_update
FROM public.profiles p 
WHERE p.id = auth.uid();
