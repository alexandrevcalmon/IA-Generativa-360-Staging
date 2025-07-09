
-- First, let's check if there are existing policies and drop them if they exist
DROP POLICY IF EXISTS "Students can view active mentorship sessions" ON public.producer_mentorship_sessions;
DROP POLICY IF EXISTS "Students can register for mentorship sessions" ON public.producer_mentorship_participants;
DROP POLICY IF EXISTS "Students can view their own mentorship registrations" ON public.producer_mentorship_participants;

-- Enable RLS on both tables if not already enabled
ALTER TABLE public.producer_mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_mentorship_participants ENABLE ROW LEVEL SECURITY;

-- Create a more permissive policy for students to view all active mentorship sessions
CREATE POLICY "Students can view active mentorship sessions"
  ON public.producer_mentorship_sessions
  FOR SELECT
  USING (
    is_active = true 
    AND status IN ('scheduled', 'live')
  );

-- Allow authenticated users to register for mentorship sessions
CREATE POLICY "Students can register for mentorship sessions"
  ON public.producer_mentorship_participants
  FOR INSERT
  WITH CHECK (
    participant_id = auth.uid()
  );

-- Allow users to view their own mentorship registrations
CREATE POLICY "Students can view their own mentorship registrations"
  ON public.producer_mentorship_participants
  FOR SELECT
  USING (
    participant_id = auth.uid()
  );

-- Allow producers to view all participants in their sessions
CREATE POLICY "Producers can view participants in their sessions"
  ON public.producer_mentorship_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.producer_mentorship_sessions pms
      WHERE pms.id = session_id 
      AND pms.producer_id = auth.uid()
    )
  );

-- Allow producers to manage their own mentorship sessions
CREATE POLICY "Producers can manage their own sessions"
  ON public.producer_mentorship_sessions
  FOR ALL
  USING (producer_id = auth.uid())
  WITH CHECK (producer_id = auth.uid());
