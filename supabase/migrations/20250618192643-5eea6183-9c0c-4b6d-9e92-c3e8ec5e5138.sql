
-- Fix infinite recursion in RLS policies for courses
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Students can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Company users can view published courses" ON public.courses;

-- Create correct policy using the safe function
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

-- Fix course_modules policies to avoid recursion
DROP POLICY IF EXISTS "Students can view published course modules" ON public.course_modules;

CREATE POLICY "Collaborators and students can view published course modules" ON public.course_modules
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

-- Fix lessons policies to avoid recursion
DROP POLICY IF EXISTS "Students can view lessons from published modules" ON public.lessons;

CREATE POLICY "Collaborators and students can view lessons from published modules" ON public.lessons
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.course_modules cm
    WHERE cm.id = module_id 
    AND cm.is_published = true
  ) AND
  (
    public.get_user_role_safe(auth.uid()) IN ('student', 'collaborator') OR
    EXISTS (
      SELECT 1 FROM public.company_users 
      WHERE auth_user_id = auth.uid() AND is_active = true
    )
  )
);
