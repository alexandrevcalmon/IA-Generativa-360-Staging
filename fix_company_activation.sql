-- Script para corrigir problema de ativação da empresa
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a empresa existe e está corretamente vinculada
SELECT 
    c.id,
    c.name,
    c.contact_email,
    c.auth_user_id,
    c.subscription_status,
    c.subscription_ends_at,
    u.email as user_email,
    u.created_at as user_created_at,
    p.role as profile_role
FROM companies c
LEFT JOIN auth.users u ON c.auth_user_id = u.id
LEFT JOIN profiles p ON c.auth_user_id = p.id
WHERE c.contact_email = 'alecalmon@hotmail.com';

-- 2. Verificar se o usuário existe
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE id = '35abbe82-c4fd-4828-8b7b-cd8e6f4d3146';

-- 3. Verificar se o perfil existe
SELECT 
    id,
    role,
    created_at,
    updated_at
FROM profiles 
WHERE id = '35abbe82-c4fd-4828-8b7b-cd8e6f4d3146';

-- 4. Se necessário, atualizar o auth_user_id da empresa (já foi feito)
-- UPDATE companies 
-- SET auth_user_id = '35abbe82-c4fd-4828-8b7b-cd8e6f4d3146', 
--     updated_at = NOW() 
-- WHERE contact_email = 'alecalmon@hotmail.com' 
-- AND auth_user_id IS NULL;

-- 5. Verificar se existe registro na tabela company_users
SELECT 
    id,
    email,
    company_id,
    auth_user_id,
    name,
    is_active,
    created_at
FROM company_users 
WHERE auth_user_id = '35abbe82-c4fd-4828-8b7b-cd8e6f4d3146';

-- 6. Se não existir, criar registro na company_users
INSERT INTO company_users (
    id,
    email,
    company_id,
    auth_user_id,
    name,
    is_active,
    created_at,
    updated_at
) 
SELECT 
    gen_random_uuid(),
    c.contact_email,
    c.id,
    c.auth_user_id,
    COALESCE(c.contact_name, c.name),
    true,
    NOW(),
    NOW()
FROM companies c
WHERE c.auth_user_id = '35abbe82-c4fd-4828-8b7b-cd8e6f4d3146'
AND NOT EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.auth_user_id = c.auth_user_id
)
ON CONFLICT (auth_user_id) DO NOTHING;

-- 7. Verificar se as políticas RLS estão funcionando
-- Teste a consulta que estava falhando
SELECT 
    id,
    stripe_customer_id,
    stripe_subscription_id,
    subscription_status,
    stripe_plan_id,
    max_collaborators,
    subscription_ends_at
FROM companies 
WHERE auth_user_id = '35abbe82-c4fd-4828-8b7b-cd8e6f4d3146';

-- 8. Verificar status final
SELECT 
    'Empresa' as tipo,
    c.id,
    c.name,
    c.contact_email,
    c.auth_user_id,
    c.subscription_status,
    c.is_active
FROM companies c
WHERE c.auth_user_id = '35abbe82-c4fd-4828-8b7b-cd8e6f4d3146'

UNION ALL

SELECT 
    'Usuário Auth' as tipo,
    u.id,
    u.email as name,
    u.email as contact_email,
    u.id as auth_user_id,
    CASE WHEN u.email_confirmed_at IS NOT NULL THEN 'confirmed' ELSE 'pending' END as subscription_status,
    true as is_active
FROM auth.users u
WHERE u.id = '35abbe82-c4fd-4828-8b7b-cd8e6f4d3146'

UNION ALL

SELECT 
    'Perfil' as tipo,
    p.id,
    p.role as name,
    p.email as contact_email,
    p.id as auth_user_id,
    'active' as subscription_status,
    true as is_active
FROM profiles p
WHERE p.id = '35abbe82-c4fd-4828-8b7b-cd8e6f4d3146'

UNION ALL

SELECT 
    'Company User' as tipo,
    cu.id,
    cu.name,
    cu.email as contact_email,
    cu.auth_user_id,
    CASE WHEN cu.is_active THEN 'active' ELSE 'inactive' END as subscription_status,
    cu.is_active
FROM company_users cu
WHERE cu.auth_user_id = '35abbe82-c4fd-4828-8b7b-cd8e6f4d3146'; 