
-- Step 1: Create RLS policy for companies to view their own mentorship sessions
CREATE POLICY "Companies can view their own mentorship sessions"
  ON public.mentorship_sessions
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Step 2: Create RLS policy for companies to manage their own mentorship sessions
CREATE POLICY "Companies can manage their own mentorship sessions"
  ON public.mentorship_sessions
  FOR ALL
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Step 3: Add some test mentorship sessions for existing companies
INSERT INTO public.mentorship_sessions (
  company_id,
  title,
  description,
  scheduled_at,
  duration_minutes,
  max_participants,
  status,
  meet_url
)
SELECT 
  c.id,
  'Introdução à IA Generativa',
  'Sessão introdutória sobre os conceitos básicos de Inteligência Artificial Generativa e suas aplicações no ambiente corporativo.',
  NOW() + INTERVAL '7 days',
  90,
  50,
  'scheduled',
  'https://meet.google.com/abc-defg-hij'
FROM public.companies c
WHERE c.is_active = true
LIMIT 3;

INSERT INTO public.mentorship_sessions (
  company_id,
  title,
  description,
  scheduled_at,
  duration_minutes,
  max_participants,
  status,
  meet_url
)
SELECT 
  c.id,
  'Workshop: Prompts Efetivos',
  'Workshop prático sobre como criar prompts efetivos para diferentes cenários de trabalho.',
  NOW() + INTERVAL '14 days',
  120,
  30,
  'scheduled',
  'https://meet.google.com/xyz-uvwx-yz'
FROM public.companies c
WHERE c.is_active = true
LIMIT 2;

INSERT INTO public.mentorship_sessions (
  company_id,
  title,
  description,
  scheduled_at,
  duration_minutes,
  max_participants,
  status,
  meet_url
)
SELECT 
  c.id,
  'Saúde Mental no Trabalho',
  'Sessão sobre bem-estar mental e técnicas de gerenciamento de estresse no ambiente corporativo.',
  NOW() - INTERVAL '3 days',
  60,
  100,
  'completed',
  null
FROM public.companies c
WHERE c.is_active = true
LIMIT 1;
