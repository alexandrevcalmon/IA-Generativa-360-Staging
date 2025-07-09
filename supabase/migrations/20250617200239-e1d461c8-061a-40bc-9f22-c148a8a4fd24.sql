
-- Fix the needs_password_change issue for the current user
UPDATE company_users 
SET needs_password_change = false 
WHERE email = 'daniela@gmail.com';

-- Also ensure the user has a proper profile entry
INSERT INTO profiles (id, role, created_at, updated_at)
SELECT 
    au.id,
    'student'::character varying,
    now(),
    now()
FROM auth.users au
WHERE au.email = 'daniela@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;
