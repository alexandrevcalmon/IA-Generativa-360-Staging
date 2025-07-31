
-- Inserir o usuário admin-produtor@calmonacademy.com na tabela producers
INSERT INTO public.producers (auth_user_id, name, email) 
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'Admin Produtor'),
  au.email
FROM auth.users au 
WHERE au.email = 'admin-produtor@calmonacademy.com'
ON CONFLICT (auth_user_id) DO NOTHING;

-- Função para migrar produtores existentes da tabela profiles para a tabela producers
CREATE OR REPLACE FUNCTION public.migrate_existing_producers()
RETURNS TABLE(migrated_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    migration_count integer := 0;
BEGIN
    -- Inserir produtores da tabela profiles que não existem na tabela producers
    INSERT INTO public.producers (auth_user_id, name, email)
    SELECT 
        p.id,
        COALESCE(au.raw_user_meta_data->>'name', 'Producer'),
        au.email
    FROM public.profiles p
    JOIN auth.users au ON p.id = au.id
    WHERE p.role = 'producer'
    AND NOT EXISTS (
        SELECT 1 FROM public.producers pr 
        WHERE pr.auth_user_id = p.id
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    
    GET DIAGNOSTICS migration_count = ROW_COUNT;
    
    RETURN QUERY SELECT migration_count;
END;
$$;

-- Executar a migração
SELECT * FROM migrate_existing_producers();

-- Função melhorada para verificar se o usuário é produtor com fallback
CREATE OR REPLACE FUNCTION public.is_current_user_producer_enhanced()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
    -- Primeiro, verificar na tabela producers
    IF EXISTS (
        SELECT 1 FROM public.producers 
        WHERE auth_user_id = auth.uid() AND is_active = true
    ) THEN
        RETURN true;
    END IF;
    
    -- Fallback: verificar na tabela profiles
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'producer'
    ) THEN
        -- Se encontrado no profiles mas não no producers, migrar automaticamente
        INSERT INTO public.producers (auth_user_id, name, email)
        SELECT 
            auth.uid(),
            COALESCE(au.raw_user_meta_data->>'name', 'Producer'),
            au.email
        FROM auth.users au 
        WHERE au.id = auth.uid()
        ON CONFLICT (auth_user_id) DO NOTHING;
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$;
