
-- First, let's check and fix the foreign key constraint issue
-- The courses table seems to have a foreign key to a 'users' table instead of referencing auth.users
-- Let's update the foreign key to reference the profiles table instead

-- Remove the existing foreign key constraint if it exists
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_instructor_id_fkey;

-- Add the correct foreign key constraint to profiles table
ALTER TABLE public.courses 
ADD CONSTRAINT courses_instructor_id_fkey 
FOREIGN KEY (instructor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Now create the function to automatically set instructor_id for producers
CREATE OR REPLACE FUNCTION public.set_course_instructor_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If instructor_id is null and the user is a producer, set it to the current user
    IF NEW.instructor_id IS NULL THEN
        -- Check if the current user is a producer
        IF EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'producer'
        ) THEN
            NEW.instructor_id = auth.uid();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set instructor_id on course creation
DROP TRIGGER IF EXISTS set_course_instructor_trigger ON public.courses;
CREATE TRIGGER set_course_instructor_trigger
    BEFORE INSERT ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.set_course_instructor_id();

-- Update existing courses without instructor_id to associate them with the producer who's currently logged in
-- We'll find producer profiles and assign courses to them
UPDATE public.courses 
SET instructor_id = (
    SELECT id FROM public.profiles 
    WHERE role = 'producer' 
    ORDER BY created_at ASC 
    LIMIT 1
)
WHERE instructor_id IS NULL
AND EXISTS (SELECT 1 FROM public.profiles WHERE role = 'producer');

-- Enable RLS on courses table if not already enabled
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for producers to manage their own courses
DROP POLICY IF EXISTS "Producers can manage their own courses" ON public.courses;
CREATE POLICY "Producers can manage their own courses" ON public.courses
FOR ALL USING (
    public.get_user_role_safe(auth.uid()) = 'producer' AND 
    instructor_id = auth.uid()
);

-- Update the existing RLS policy for published courses to be more specific
DROP POLICY IF EXISTS "Collaborators and students can view published courses" ON public.courses;
CREATE POLICY "Collaborators and students can view published courses" ON public.courses
FOR SELECT USING (
    is_published = true AND
    (
        public.get_user_role_safe(auth.uid()) IN ('student', 'collaborator') OR
        EXISTS (
            SELECT 1 FROM public.company_users 
            WHERE auth_user_id = auth.uid() AND is_active = true
        )
    )
);
