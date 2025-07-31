
-- Update RLS policies to allow company owners to manage lesson progress
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can create their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update their own lesson progress" ON public.lesson_progress;

-- Create new policies that allow both company users and company owners
CREATE POLICY "Users can view lesson progress" ON public.lesson_progress
FOR SELECT USING (
  auth.uid() = user_id OR
  -- Allow company owners to view progress of their company's users
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE auth_user_id = auth.uid() 
    AND id IN (
      SELECT company_id FROM public.company_users 
      WHERE auth_user_id = lesson_progress.user_id
    )
  )
);

CREATE POLICY "Users can create lesson progress" ON public.lesson_progress
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (
    auth.uid() = user_id OR
    -- Allow company owners to create progress records
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update lesson progress" ON public.lesson_progress
FOR UPDATE USING (
  auth.uid() = user_id OR
  -- Allow company owners to update progress
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE auth_user_id = auth.uid()
  ) OR
  -- Also allow if user is part of a company that the current user owns
  EXISTS (
    SELECT 1 FROM public.companies c
    JOIN public.company_users cu ON c.id = cu.company_id
    WHERE c.auth_user_id = auth.uid() 
    AND cu.auth_user_id = lesson_progress.user_id
  )
);

-- Also update enrollments policies to be consistent
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.enrollments;

CREATE POLICY "Users can view enrollments" ON public.enrollments
FOR SELECT USING (
  auth.uid() = user_id OR
  -- Allow company owners to view enrollments
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can create enrollments" ON public.enrollments
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (
    auth.uid() = user_id OR
    -- Allow company owners to create enrollments
    EXISTS (
      SELECT 1 FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update enrollments" ON public.enrollments
FOR UPDATE USING (
  auth.uid() = user_id OR
  -- Allow company owners to update enrollments
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE auth_user_id = auth.uid()
  )
);
