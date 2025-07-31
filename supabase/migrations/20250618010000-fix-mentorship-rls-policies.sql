
-- Allow students to view active mentorship sessions
CREATE POLICY "Students can view active mentorship sessions"
  ON public.producer_mentorship_sessions
  FOR SELECT
  USING (
    is_active = true 
    AND status IN ('scheduled', 'live')
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'student'
    )
  );

-- Allow students to register for mentorship sessions
CREATE POLICY "Students can register for mentorship sessions"
  ON public.producer_mentorship_participants
  FOR INSERT
  WITH CHECK (
    participant_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'student'
    )
  );

-- Allow students to view their own mentorship registrations
CREATE POLICY "Students can view their own mentorship registrations"
  ON public.producer_mentorship_participants
  FOR SELECT
  USING (
    participant_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'student'
    )
  );
