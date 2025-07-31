
-- Drop the function with CASCADE to remove all dependent policies
DROP FUNCTION IF EXISTS public.is_producer(uuid) CASCADE;

-- Recreate the is_producer function with better error handling
CREATE OR REPLACE FUNCTION public.is_producer(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se o usuário tem o role de producer na tabela profiles
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'producer'
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, retornar false como padrão seguro
        RAISE WARNING 'Erro ao verificar role de producer para usuário %: %', user_id, SQLERRM;
        RETURN false;
END;
$$;

-- Enable RLS on company_users if not already enabled
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for company_users table
-- Política para produtores poderem ver todos os colaboradores
CREATE POLICY "Producers can view all company users" 
  ON public.company_users 
  FOR SELECT 
  USING (public.is_producer(auth.uid()));

-- Política para produtores poderem inserir novos colaboradores
CREATE POLICY "Producers can insert company users" 
  ON public.company_users 
  FOR INSERT 
  WITH CHECK (public.is_producer(auth.uid()));

-- Política para produtores poderem atualizar colaboradores
CREATE POLICY "Producers can update company users" 
  ON public.company_users 
  FOR UPDATE 
  USING (public.is_producer(auth.uid()))
  WITH CHECK (public.is_producer(auth.uid()));

-- Política para produtores poderem deletar colaboradores
CREATE POLICY "Producers can delete company users" 
  ON public.company_users 
  FOR DELETE 
  USING (public.is_producer(auth.uid()));

-- Política para colaboradores poderem ver seus próprios dados
CREATE POLICY "Users can view their own data" 
  ON public.company_users 
  FOR SELECT 
  USING (auth_user_id = auth.uid());

-- Política para colaboradores poderem atualizar seus próprios dados
CREATE POLICY "Users can update their own data" 
  ON public.company_users 
  FOR UPDATE 
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Ensure companies table also has proper policies for producers
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create policy for producers to manage companies
CREATE POLICY "Producers can manage all companies" 
  ON public.companies 
  FOR ALL 
  USING (public.is_producer(auth.uid()));

-- Test the function to make sure it works
SELECT 
    auth.uid() as current_user_id,
    p.role as current_user_role,
    public.is_producer(auth.uid()) as is_producer_check
FROM public.profiles p 
WHERE p.id = auth.uid();
