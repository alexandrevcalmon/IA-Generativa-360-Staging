
-- Remove o constraint existente que só permite 'student', 'producer', 'company'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Cria um novo constraint que inclui 'collaborator'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'producer', 'company', 'collaborator'));
