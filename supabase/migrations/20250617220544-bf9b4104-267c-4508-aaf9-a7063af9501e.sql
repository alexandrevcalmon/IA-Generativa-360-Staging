
-- Remove the enrollment requirement by updating RLS policies
-- Allow students to view their progress without enrollment requirement
DROP POLICY IF EXISTS "Students can view their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Students can manage their lesson progress" ON public.lesson_progress;

-- Create new policies that don't require enrollment
CREATE POLICY "Students can view lesson progress" ON public.lesson_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.company_users 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Students can create lesson progress" ON public.lesson_progress
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.company_users 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Students can update lesson progress" ON public.lesson_progress
FOR UPDATE USING (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.company_users 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);
