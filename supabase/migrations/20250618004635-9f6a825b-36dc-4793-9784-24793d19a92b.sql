
-- Create a producer_mentorship_sessions table for producer-managed sessions
CREATE TABLE public.producer_mentorship_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  max_participants integer DEFAULT 100,
  google_meet_url character varying,
  google_meet_id character varying,
  status character varying NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed', 'cancelled'
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for producer mentorship sessions
ALTER TABLE public.producer_mentorship_sessions ENABLE ROW LEVEL SECURITY;

-- Producers can view, create, update and delete their own sessions
CREATE POLICY "Producers can manage their own mentorship sessions"
  ON public.producer_mentorship_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'producer'
      AND producer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'producer'
      AND producer_id = auth.uid()
    )
  );

-- Create a producer_mentorship_participants table to track registrations
CREATE TABLE public.producer_mentorship_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.producer_mentorship_sessions(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL,
  participant_name character varying NOT NULL,
  participant_email character varying NOT NULL,
  company_name character varying,
  registered_at timestamp with time zone NOT NULL DEFAULT now(),
  attended boolean DEFAULT NULL,
  joined_at timestamp with time zone,
  left_at timestamp with time zone
);

-- Add RLS policies for participants
ALTER TABLE public.producer_mentorship_participants ENABLE ROW LEVEL SECURITY;

-- Producers can view participants for their sessions
CREATE POLICY "Producers can view participants for their sessions"
  ON public.producer_mentorship_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.producer_mentorship_sessions pms
      JOIN public.profiles p ON p.id = pms.producer_id
      WHERE pms.id = session_id 
      AND p.id = auth.uid() 
      AND p.role = 'producer'
    )
  );

-- Participants can view their own registrations
CREATE POLICY "Participants can view their own registrations"
  ON public.producer_mentorship_participants
  FOR SELECT
  USING (participant_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX idx_producer_mentorship_sessions_producer_id ON public.producer_mentorship_sessions(producer_id);
CREATE INDEX idx_producer_mentorship_sessions_scheduled_at ON public.producer_mentorship_sessions(scheduled_at);
CREATE INDEX idx_producer_mentorship_participants_session_id ON public.producer_mentorship_participants(session_id);
CREATE INDEX idx_producer_mentorship_participants_participant_id ON public.producer_mentorship_participants(participant_id);
