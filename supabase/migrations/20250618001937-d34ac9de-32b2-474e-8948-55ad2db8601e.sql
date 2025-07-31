
-- Criar tabela para sessões de mentoria
CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  meet_url VARCHAR,
  meet_id VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  max_participants INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para participantes das mentorias
CREATE TABLE IF NOT EXISTS public.mentorship_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentorship_session_id UUID NOT NULL REFERENCES public.mentorship_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.company_users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT NULL,
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(mentorship_session_id, student_id)
);

-- Criar tabela para sistema de gamificação
CREATE TABLE IF NOT EXISTS public.student_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.company_users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Criar tabela para histórico de pontos
CREATE TABLE IF NOT EXISTS public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.company_users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  action_type VARCHAR NOT NULL CHECK (action_type IN ('lesson_completed', 'quiz_passed', 'course_completed', 'mentorship_attended', 'daily_login', 'achievement_unlocked')),
  description TEXT,
  reference_id UUID, -- pode referenciar lesson_id, course_id, mentorship_session_id, etc
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para conquistas/achievements
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  icon VARCHAR,
  points_required INTEGER,
  badge_color VARCHAR DEFAULT '#3B82F6',
  type VARCHAR NOT NULL CHECK (type IN ('course', 'lesson', 'mentorship', 'streak', 'points', 'special')),
  criteria JSONB, -- critérios específicos para desbloquear a conquista
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para conquistas dos estudantes
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.company_users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, achievement_id)
);

-- Criar tabela para eventos do calendário
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  event_type VARCHAR NOT NULL CHECK (event_type IN ('mentorship', 'course_deadline', 'company_meeting', 'holiday', 'training')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN NOT NULL DEFAULT false,
  location VARCHAR,
  meet_url VARCHAR,
  reference_id UUID, -- pode referenciar mentorship_session_id, course_id, etc
  color VARCHAR DEFAULT '#3B82F6',
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule JSONB, -- regras de recorrência (ex: semanal, mensal)
  created_by UUID REFERENCES public.company_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_company_scheduled ON public.mentorship_sessions(company_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_status ON public.mentorship_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mentorship_attendees_session ON public.mentorship_attendees(mentorship_session_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_attendees_student ON public.mentorship_attendees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_points_student ON public.student_points(student_id);
CREATE INDEX IF NOT EXISTS idx_points_history_student ON public.points_history(student_id);
CREATE INDEX IF NOT EXISTS idx_points_history_earned_at ON public.points_history(earned_at);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student ON public.student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_company_date ON public.calendar_events(company_id, start_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON public.calendar_events(event_type);

-- Inserir algumas conquistas básicas
INSERT INTO public.achievements (name, description, icon, points_required, type, criteria) VALUES
('Primeiro Passo', 'Complete sua primeira lição', 'trophy', 10, 'lesson', '{"lessons_completed": 1}'),
('Dedicado', 'Complete 5 lições', 'award', 50, 'lesson', '{"lessons_completed": 5}'),
('Estudioso', 'Complete seu primeiro curso', 'graduation-cap', 100, 'course', '{"courses_completed": 1}'),
('Persistente', 'Mantenha uma sequência de 7 dias', 'calendar-check', 70, 'streak', '{"streak_days": 7}'),
('Participativo', 'Participe de uma mentoria', 'users', 25, 'mentorship', '{"mentorships_attended": 1}'),
('Mentor Assíduo', 'Participe de 5 mentorias', 'star', 125, 'mentorship', '{"mentorships_attended": 5}'),
('100 Pontos', 'Alcance 100 pontos', 'zap', 0, 'points', '{"total_points": 100}'),
('500 Pontos', 'Alcance 500 pontos', 'flame', 0, 'points', '{"total_points": 500}')
ON CONFLICT DO NOTHING;

-- Adicionar RLS (Row Level Security) para as novas tabelas
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mentorship_sessions
CREATE POLICY "Students can view company mentorship sessions" ON public.mentorship_sessions
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.company_users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Políticas RLS para mentorship_attendees
CREATE POLICY "Students can view their mentorship attendance" ON public.mentorship_attendees
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.company_users 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can register for mentorships" ON public.mentorship_attendees
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM public.company_users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Políticas RLS para student_points
CREATE POLICY "Students can view their own points" ON public.student_points
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.company_users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Políticas RLS para points_history
CREATE POLICY "Students can view their points history" ON public.points_history
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.company_users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Políticas RLS para achievements
CREATE POLICY "Everyone can view achievements" ON public.achievements
  FOR SELECT USING (is_active = true);

-- Políticas RLS para student_achievements
CREATE POLICY "Students can view their achievements" ON public.student_achievements
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.company_users 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Políticas RLS para calendar_events
CREATE POLICY "Students can view company calendar events" ON public.calendar_events
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.company_users 
      WHERE auth_user_id = auth.uid()
    )
  );
