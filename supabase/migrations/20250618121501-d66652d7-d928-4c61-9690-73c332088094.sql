
-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
    -- Drop existing policies for collaborator_activity_stats
    DROP POLICY IF EXISTS "Companies can view their collaborators stats" ON public.collaborator_activity_stats;
    DROP POLICY IF EXISTS "Producers can view all collaborator stats" ON public.collaborator_activity_stats;
    
    -- Drop existing policies for mentorship_sessions
    DROP POLICY IF EXISTS "Companies can view their mentorship sessions" ON public.mentorship_sessions;
    DROP POLICY IF EXISTS "Producers can view all mentorship sessions" ON public.mentorship_sessions;
    
    -- Drop existing policies for mentorship_attendees
    DROP POLICY IF EXISTS "Companies can view their session attendees" ON public.mentorship_attendees;
    DROP POLICY IF EXISTS "Producers can view all session attendees" ON public.mentorship_attendees;
    
    -- Drop existing policies for courses
    DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
    DROP POLICY IF EXISTS "Producers can view all courses" ON public.courses;
END $$;

-- Enable RLS on tables
ALTER TABLE public.collaborator_activity_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies for collaborator_activity_stats
CREATE POLICY "Companies can view their collaborators stats" 
  ON public.collaborator_activity_stats 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Producers can view all collaborator stats" 
  ON public.collaborator_activity_stats 
  FOR SELECT 
  USING (public.is_producer(auth.uid()));

-- Create policies for mentorship_sessions
CREATE POLICY "Companies can view their mentorship sessions" 
  ON public.mentorship_sessions 
  FOR SELECT 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Producers can view all mentorship sessions" 
  ON public.mentorship_sessions 
  FOR SELECT 
  USING (public.is_producer(auth.uid()));

-- Create policies for mentorship_attendees
CREATE POLICY "Companies can view their session attendees" 
  ON public.mentorship_attendees 
  FOR SELECT 
  USING (
    mentorship_session_id IN (
      SELECT id FROM public.mentorship_sessions 
      WHERE company_id IN (
        SELECT id FROM public.companies 
        WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Producers can view all session attendees" 
  ON public.mentorship_attendees 
  FOR SELECT 
  USING (public.is_producer(auth.uid()));

-- Create policies for courses
CREATE POLICY "Anyone can view published courses" 
  ON public.courses 
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Producers can view all courses" 
  ON public.courses 
  FOR SELECT 
  USING (public.is_producer(auth.uid()));

-- Create or replace function to populate test data
CREATE OR REPLACE FUNCTION public.populate_test_collaborator_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert test statistics for existing collaborators
  INSERT INTO public.collaborator_activity_stats (
    collaborator_id,
    company_id,
    last_login_at,
    total_login_count,
    total_watch_time_minutes,
    lessons_completed,
    lessons_started,
    courses_enrolled,
    courses_completed,
    quiz_attempts,
    quiz_passed,
    average_quiz_score,
    streak_days,
    total_points,
    current_level
  )
  SELECT 
    cu.id,
    cu.company_id,
    now() - interval '1 day' * (random() * 30),
    floor(random() * 50 + 1)::integer,
    floor(random() * 500 + 10)::integer,
    floor(random() * 20 + 1)::integer,
    floor(random() * 25 + 5)::integer,
    floor(random() * 5 + 1)::integer,
    floor(random() * 3)::integer,
    floor(random() * 10 + 1)::integer,
    floor(random() * 8 + 1)::integer,
    floor(random() * 40 + 60)::numeric,
    floor(random() * 10)::integer,
    floor(random() * 1000 + 100)::integer,
    floor(random() * 5 + 1)::integer
  FROM public.company_users cu
  WHERE NOT EXISTS (
    SELECT 1 FROM public.collaborator_activity_stats cas 
    WHERE cas.collaborator_id = cu.id
  )
  LIMIT 50; -- Limit to avoid too much test data
END;
$$;

-- Execute the function to populate test data
SELECT public.populate_test_collaborator_stats();

-- Create some test mentorship sessions for companies
INSERT INTO public.mentorship_sessions (
  company_id,
  title,
  description,
  scheduled_at,
  duration_minutes,
  max_participants,
  status
)
SELECT 
  c.id,
  'Sessão de Mentoria - ' || c.name,
  'Sessão de mentoria para desenvolvimento profissional dos colaboradores da ' || c.name,
  now() + interval '1 week' + interval '1 day' * (random() * 30),
  60,
  20,
  'scheduled'
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.mentorship_sessions ms 
  WHERE ms.company_id = c.id
)
LIMIT 10;
