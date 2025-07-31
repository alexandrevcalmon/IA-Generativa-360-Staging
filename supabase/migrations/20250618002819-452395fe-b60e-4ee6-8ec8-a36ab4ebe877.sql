
-- Criar tabela para armazenar estatísticas de atividade dos colaboradores
CREATE TABLE public.collaborator_activity_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collaborator_id uuid REFERENCES public.company_users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  last_login_at timestamp with time zone,
  total_login_count integer DEFAULT 0,
  total_watch_time_minutes integer DEFAULT 0,
  lessons_completed integer DEFAULT 0,
  lessons_started integer DEFAULT 0,
  courses_enrolled integer DEFAULT 0,
  courses_completed integer DEFAULT 0,
  quiz_attempts integer DEFAULT 0,
  quiz_passed integer DEFAULT 0,
  average_quiz_score numeric(5,2) DEFAULT 0,
  streak_days integer DEFAULT 0,
  total_points integer DEFAULT 0,
  current_level integer DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela para log de atividades dos colaboradores
CREATE TABLE public.collaborator_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collaborator_id uuid REFERENCES public.company_users(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  activity_type character varying NOT NULL, -- 'login', 'logout', 'lesson_start', 'lesson_complete', 'quiz_attempt', 'course_enroll'
  activity_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_collaborator_activity_stats_company ON public.collaborator_activity_stats(company_id);
CREATE INDEX idx_collaborator_activity_stats_collaborator ON public.collaborator_activity_stats(collaborator_id);
CREATE INDEX idx_collaborator_activity_logs_company ON public.collaborator_activity_logs(company_id);
CREATE INDEX idx_collaborator_activity_logs_collaborator ON public.collaborator_activity_logs(collaborator_id);
CREATE INDEX idx_collaborator_activity_logs_created_at ON public.collaborator_activity_logs(created_at);

-- Habilitar RLS
ALTER TABLE public.collaborator_activity_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborator_activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para produtores poderem ver todas as estatísticas
CREATE POLICY "Producers can view all collaborator stats" 
  ON public.collaborator_activity_stats 
  FOR SELECT 
  USING (public.is_producer(auth.uid()));

CREATE POLICY "Producers can insert collaborator stats" 
  ON public.collaborator_activity_stats 
  FOR INSERT 
  WITH CHECK (public.is_producer(auth.uid()));

CREATE POLICY "Producers can update collaborator stats" 
  ON public.collaborator_activity_stats 
  FOR UPDATE 
  USING (public.is_producer(auth.uid()));

CREATE POLICY "Producers can view all activity logs" 
  ON public.collaborator_activity_logs 
  FOR SELECT 
  USING (public.is_producer(auth.uid()));

CREATE POLICY "Producers can insert activity logs" 
  ON public.collaborator_activity_logs 
  FOR INSERT 
  WITH CHECK (public.is_producer(auth.uid()));

-- Função para atualizar estatísticas dos colaboradores
CREATE OR REPLACE FUNCTION public.update_collaborator_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar estatísticas baseadas nos dados existentes
  INSERT INTO public.collaborator_activity_stats (
    collaborator_id,
    company_id,
    lessons_completed,
    courses_enrolled,
    total_watch_time_minutes
  )
  SELECT 
    cu.id as collaborator_id,
    cu.company_id,
    COALESCE(lesson_stats.completed_lessons, 0) as lessons_completed,
    COALESCE(enrollment_stats.enrolled_courses, 0) as courses_enrolled,
    COALESCE(lesson_stats.total_watch_time, 0) as total_watch_time_minutes
  FROM public.company_users cu
  LEFT JOIN (
    SELECT 
      lp.user_id,
      COUNT(CASE WHEN lp.completed = true THEN 1 END) as completed_lessons,
      SUM(lp.watch_time_seconds) / 60 as total_watch_time
    FROM public.lesson_progress lp
    GROUP BY lp.user_id
  ) lesson_stats ON cu.auth_user_id = lesson_stats.user_id
  LEFT JOIN (
    SELECT 
      e.user_id,
      COUNT(*) as enrolled_courses
    FROM public.enrollments e
    GROUP BY e.user_id
  ) enrollment_stats ON cu.auth_user_id = enrollment_stats.user_id
  ON CONFLICT (collaborator_id) DO UPDATE SET
    lessons_completed = EXCLUDED.lessons_completed,
    courses_enrolled = EXCLUDED.courses_enrolled,
    total_watch_time_minutes = EXCLUDED.total_watch_time_minutes,
    updated_at = now();
END;
$$;

-- Executar a função para popular dados iniciais
SELECT public.update_collaborator_stats();
