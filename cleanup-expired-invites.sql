-- Script para limpar convites expirados
-- Execute este script para remover usuários que não confirmaram email há mais de 7 dias

-- Verificar usuários expirados antes da limpeza
SELECT 
    'Usuários expirados encontrados' as status,
    COUNT(*) as total_expired_users
FROM auth.users 
WHERE email_confirmed_at IS NULL 
AND created_at < NOW() - INTERVAL '7 days';

-- Mostrar detalhes dos usuários expirados
SELECT 
    id,
    email,
    created_at,
    user_metadata,
    CASE 
        WHEN user_metadata->>'role' = 'company' THEN 'Empresa'
        WHEN user_metadata->>'role' = 'collaborator' THEN 'Colaborador'
        ELSE 'Outro'
    END as tipo_usuario,
    EXTRACT(EPOCH FROM (NOW() - created_at))/86400 as dias_expirado
FROM auth.users 
WHERE email_confirmed_at IS NULL 
AND created_at < NOW() - INTERVAL '7 days'
ORDER BY created_at ASC;

-- ATENÇÃO: O script abaixo irá DELETAR permanentemente os usuários expirados
-- Execute apenas se tiver certeza de que deseja remover esses usuários

-- Descomente as linhas abaixo para executar a limpeza:

/*
-- 1. Deletar registros da tabela company_users
DELETE FROM company_users 
WHERE auth_user_id IN (
    SELECT id FROM auth.users 
    WHERE email_confirmed_at IS NULL 
    AND created_at < NOW() - INTERVAL '7 days'
);

-- 2. Deletar registros da tabela profiles
DELETE FROM profiles 
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email_confirmed_at IS NULL 
    AND created_at < NOW() - INTERVAL '7 days'
);

-- 3. Deletar empresas órfãs (que não têm auth_user_id válido)
DELETE FROM companies 
WHERE auth_user_id IN (
    SELECT id FROM auth.users 
    WHERE email_confirmed_at IS NULL 
    AND created_at < NOW() - INTERVAL '7 days'
);

-- 4. Deletar usuários do Supabase Auth (requer privilégios de admin)
-- NOTA: Esta operação deve ser feita via Edge Function ou Dashboard do Supabase
-- pois requer acesso admin ao auth.users

-- Verificar resultado da limpeza
SELECT 
    'Limpeza concluída' as status,
    COUNT(*) as usuarios_restantes_nao_confirmados
FROM auth.users 
WHERE email_confirmed_at IS NULL;
*/ 