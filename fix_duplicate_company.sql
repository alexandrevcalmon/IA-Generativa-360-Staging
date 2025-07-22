-- Script para verificar e corrigir empresas duplicadas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar empresas com o mesmo email de contato
SELECT 
    id,
    name,
    contact_email,
    contact_name,
    auth_user_id,
    subscription_status,
    stripe_customer_id,
    stripe_subscription_id,
    created_at,
    updated_at
FROM companies 
WHERE contact_email IN (
    SELECT contact_email 
    FROM companies 
    GROUP BY contact_email 
    HAVING COUNT(*) > 1
)
ORDER BY contact_email, created_at;

-- 2. Verificar empresas criadas recentemente (últimas 24 horas)
SELECT 
    id,
    name,
    contact_email,
    contact_name,
    auth_user_id,
    subscription_status,
    stripe_customer_id,
    stripe_subscription_id,
    created_at,
    updated_at
FROM companies 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 3. Verificar empresas sem auth_user_id
SELECT 
    id,
    name,
    contact_email,
    contact_name,
    auth_user_id,
    subscription_status,
    created_at
FROM companies 
WHERE auth_user_id IS NULL
ORDER BY created_at DESC;

-- 4. Verificar empresas com assinatura ativa mas sem auth_user_id
SELECT 
    id,
    name,
    contact_email,
    contact_name,
    auth_user_id,
    subscription_status,
    stripe_customer_id,
    stripe_subscription_id,
    created_at
FROM companies 
WHERE subscription_status = 'active' 
AND auth_user_id IS NULL
ORDER BY created_at DESC;

-- 5. Verificar usuários auth sem empresa vinculada
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    p.role as profile_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN companies c ON u.id = c.auth_user_id
WHERE c.id IS NULL
AND u.email LIKE '%@%'
ORDER BY u.created_at DESC;

-- 6. Verificar se existe empresa com email específico (substitua pelo email real)
-- SELECT 
--     id,
--     name,
--     contact_email,
--     contact_name,
--     auth_user_id,
--     subscription_status,
--     stripe_customer_id,
--     stripe_subscription_id,
--     created_at,
--     updated_at
-- FROM companies 
-- WHERE contact_email = 'email_da_empresa@exemplo.com';

-- 7. Script para limpar empresas duplicadas (execute com cuidado)
-- Primeiro, identifique as empresas duplicadas:
-- WITH duplicates AS (
--     SELECT 
--         contact_email,
--         COUNT(*) as count,
--         MIN(created_at) as oldest_created,
--         MAX(created_at) as newest_created
--     FROM companies 
--     GROUP BY contact_email 
--     HAVING COUNT(*) > 1
-- )
-- SELECT 
--     c.*,
--     d.count as duplicate_count
-- FROM companies c
-- JOIN duplicates d ON c.contact_email = d.contact_email
-- ORDER BY c.contact_email, c.created_at;

-- 8. Para remover empresas duplicadas (manter apenas a mais antiga):
-- DELETE FROM companies 
-- WHERE id IN (
--     SELECT id FROM (
--         SELECT id,
--                ROW_NUMBER() OVER (PARTITION BY contact_email ORDER BY created_at) as rn
--         FROM companies
--         WHERE contact_email IN (
--             SELECT contact_email 
--             FROM companies 
--             GROUP BY contact_email 
--             HAVING COUNT(*) > 1
--         )
--     ) t
--     WHERE rn > 1
-- );

-- 9. Verificar status final após correções
SELECT 
    'Empresas' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN auth_user_id IS NOT NULL THEN 1 END) as com_auth_user,
    COUNT(CASE WHEN auth_user_id IS NULL THEN 1 END) as sem_auth_user,
    COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as ativas
FROM companies

UNION ALL

SELECT 
    'Usuários Auth' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmados,
    COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as pendentes,
    NULL as ativas
FROM auth.users

UNION ALL

SELECT 
    'Perfis' as tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN role = 'company' THEN 1 END) as empresas,
    COUNT(CASE WHEN role != 'company' THEN 1 END) as outros,
    NULL as ativas
FROM profiles; 