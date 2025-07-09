
-- Primeiro, vamos identificar usuários que existem em auth.users mas não têm registro em company_users
SELECT 
    au.id,
    au.email,
    au.created_at,
    cu.id as company_user_id,
    p.id as profile_id,
    p.role
FROM auth.users au
LEFT JOIN public.company_users cu ON au.id = cu.auth_user_id
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'calmon100@gmail.com';

-- Se o usuário existe mas não tem company_user, podemos limpá-lo
-- CUIDADO: Isso vai remover o usuário completamente do sistema
-- DELETE FROM auth.users WHERE email = 'calmon100@gmail.com' AND id NOT IN (
--     SELECT DISTINCT auth_user_id FROM public.company_users WHERE auth_user_id IS NOT NULL
-- );

-- Alternativa mais segura: Apenas remover da tabela profiles se existir
DELETE FROM public.profiles 
WHERE id IN (
    SELECT au.id 
    FROM auth.users au 
    LEFT JOIN public.company_users cu ON au.id = cu.auth_user_id 
    WHERE au.email = 'calmon100@gmail.com' AND cu.id IS NULL
);
