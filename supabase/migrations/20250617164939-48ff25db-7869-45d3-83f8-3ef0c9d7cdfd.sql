
-- Verificar se o usuário existe na tabela auth.users
SELECT id, email, created_at, email_confirmed_at, last_sign_in_at 
FROM auth.users 
WHERE email = 'calmon100@gmail.com';

-- Se você quiser remover este usuário, descomente a linha abaixo:
-- DELETE FROM auth.users WHERE email = 'calmon100@gmail.com';

-- Verificar se existe algum registro relacionado nas tabelas públicas
SELECT 'profiles' as table_name, id, role FROM public.profiles WHERE id IN 
  (SELECT id FROM auth.users WHERE email = 'calmon100@gmail.com')
UNION ALL
SELECT 'company_users' as table_name, id, email FROM public.company_users WHERE email = 'calmon100@gmail.com'
UNION ALL  
SELECT 'companies' as table_name, id, email FROM public.companies WHERE email = 'calmon100@gmail.com';
