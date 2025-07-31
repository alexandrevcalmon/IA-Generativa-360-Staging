
-- Modificar a tabela companies para incluir a referência ao usuário de autenticação
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS needs_password_change BOOLEAN NOT NULL DEFAULT true;

-- Função para criar conta de autenticação para empresa
CREATE OR REPLACE FUNCTION public.create_company_auth_user(
  company_email TEXT,
  company_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_user_id UUID;
BEGIN
  -- Verificar se já existe um usuário auth para esta empresa
  SELECT auth_user_id INTO auth_user_id 
  FROM public.companies 
  WHERE id = company_id AND auth_user_id IS NOT NULL;
  
  IF auth_user_id IS NOT NULL THEN
    RETURN auth_user_id;
  END IF;
  
  -- Se não existe, retorna NULL para que seja criado via edge function
  RETURN NULL;
END;
$$;

-- Função para verificar se um usuário é uma empresa
CREATE OR REPLACE FUNCTION public.is_company_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.companies 
        WHERE auth_user_id = user_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Atualizar a função get_user_role para incluir verificação de empresa
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS character varying
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
    user_role character varying;
BEGIN
    -- First check profiles table
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = user_id;
    
    IF user_role IS NOT NULL THEN
        RETURN user_role;
    END IF;
    
    -- Check if it's a company user
    IF EXISTS (SELECT 1 FROM public.companies WHERE auth_user_id = user_id) THEN
        RETURN 'company';
    END IF;
    
    -- If not found in profiles, check company_users
    IF EXISTS (SELECT 1 FROM public.company_users WHERE auth_user_id = user_id) THEN
        RETURN 'student';
    END IF;
    
    -- Default fallback
    RETURN 'student';
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error getting user role for %: %', user_id, SQLERRM;
        RETURN 'student';
END;
$$;
