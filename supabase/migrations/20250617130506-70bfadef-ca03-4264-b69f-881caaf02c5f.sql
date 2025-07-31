
-- Drop the existing constraint that may be too restrictive
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Create a new constraint that allows all three roles: student, producer, company
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'producer', 'company'));

-- Now update the profiles with the correct roles
UPDATE public.profiles 
SET role = 'producer' 
WHERE id = '01f4817b-3b73-4dda-8052-a2f1ef6db3d3';

UPDATE public.profiles 
SET role = 'company' 
WHERE id = 'bac073b3-2587-4b75-8f97-4bbfef261383';

UPDATE public.profiles 
SET role = 'student' 
WHERE id = '83e26e04-cb3b-42b2-a078-f59a03eccbf3';
