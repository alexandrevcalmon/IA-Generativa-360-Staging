
-- Create RLS policies for students to view published courses
CREATE POLICY "Students can view published courses" ON public.courses
FOR SELECT USING (
  is_published = true AND
  EXISTS (
    SELECT 1 FROM public.company_users 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

-- Create policy for company users (students) to view published courses
CREATE POLICY "Company users can view published courses" ON public.courses
FOR SELECT USING (
  is_published = true AND
  EXISTS (
    SELECT 1 FROM public.company_users 
    WHERE auth_user_id = auth.uid()
  )
);
