-- Migração para corrigir warnings de "Function Search Path Mutable"
-- Data: 2025-01-22
-- Descrição: Adiciona SET search_path = public a funções que não o possuem

-- 1. Corrigir função award_points_to_student
CREATE OR REPLACE FUNCTION public.award_points_to_student(
  target_student_id UUID,
  points INTEGER,
  action_type TEXT,
  description TEXT,
  reference_id TEXT,
  meta JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só pontua se ainda não existe registro igual no histórico
  IF NOT EXISTS (
    SELECT 1 FROM public.points_history
    WHERE student_id = target_student_id
      AND action_type = action_type
      AND reference_id = reference_id
  ) THEN
    -- Atualiza ou insere pontos
    INSERT INTO public.student_points (student_id, points, total_points, level, streak_days, updated_at)
    VALUES (
      target_student_id,
      points,
      points,
      1,
      1,
      now()
    )
    ON CONFLICT (student_id) DO UPDATE
      SET points = student_points.points + EXCLUDED.points,
          total_points = student_points.total_points + EXCLUDED.points,
          updated_at = now();

    -- Insere no histórico
    INSERT INTO public.points_history (student_id, points, action_type, description, reference_id, meta, earned_at)
    VALUES (
      target_student_id,
      points,
      action_type,
      description,
      reference_id,
      meta,
      now()
    );
  END IF;
END;
$$;

-- 2. Corrigir função check_and_unlock_achievements
CREATE OR REPLACE FUNCTION public.check_and_unlock_achievements()
RETURNS TRIGGER AS $$
DECLARE
  achievement_record RECORD;
  points_required INTEGER;
  achievement_type TEXT;
  achievement_count INTEGER;
BEGIN
  -- Verificar conquistas baseadas em pontos totais
  FOR achievement_record IN 
    SELECT * FROM achievements 
    WHERE is_active = true 
    AND type = 'points'
  LOOP
    points_required := achievement_record.points_required;
    
    -- Verificar se o usuário já tem pontos suficientes
    IF NEW.total_points >= points_required THEN
      -- Verificar se a conquista já foi desbloqueada
      IF NOT EXISTS (
        SELECT 1 FROM student_achievements 
        WHERE student_id = NEW.student_id 
        AND achievement_id = achievement_record.id
      ) THEN
        -- Desbloquear a conquista
        INSERT INTO student_achievements (
          student_id, 
          achievement_id, 
          unlocked_at
        ) VALUES (
          NEW.student_id, 
          achievement_record.id, 
          now()
        );
        
        -- Adicionar pontos de bônus por desbloquear conquista
        INSERT INTO points_history (
          student_id,
          points,
          action_type,
          description,
          reference_id,
          earned_at
        ) VALUES (
          NEW.student_id,
          20, -- Pontos por desbloquear conquista
          'achievement_unlocked',
          'Conquista desbloqueada: ' || achievement_record.name,
          achievement_record.id,
          now()
        );
        
        -- Atualizar pontos do estudante
        UPDATE student_points
        SET 
          points = points + 20,
          total_points = total_points + 20
        WHERE student_id = NEW.student_id;
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Corrigir função update_topic_replies_count
CREATE OR REPLACE FUNCTION public.update_topic_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_topics 
    SET replies_count = replies_count + 1 
    WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_topics 
    SET replies_count = replies_count - 1 
    WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 4. Criar função get_global_collaborator_ranking_period (que estava faltando)
CREATE OR REPLACE FUNCTION public.get_global_collaborator_ranking_period()
RETURNS TABLE (
  collaborator_id UUID,
  collaborator_name TEXT,
  collaborator_email TEXT,
  company_name TEXT,
  total_points INTEGER,
  level INTEGER,
  points_today INTEGER,
  points_week INTEGER,
  points_month INTEGER,
  points_semester INTEGER,
  points_year INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cu.id as collaborator_id,
    cu.name as collaborator_name,
    cu.email as collaborator_email,
    c.name as company_name,
    sp.total_points,
    sp.level,
    -- Adicionar colunas para diferentes períodos
    (SELECT COALESCE(SUM(points), 0) FROM points_history 
     WHERE student_id = cu.id AND DATE(earned_at) = CURRENT_DATE) as points_today,
    (SELECT COALESCE(SUM(points), 0) FROM points_history 
     WHERE student_id = cu.id AND earned_at >= (CURRENT_DATE - INTERVAL '7 days')) as points_week,
    (SELECT COALESCE(SUM(points), 0) FROM points_history 
     WHERE student_id = cu.id AND earned_at >= (CURRENT_DATE - INTERVAL '30 days')) as points_month,
    (SELECT COALESCE(SUM(points), 0) FROM points_history 
     WHERE student_id = cu.id AND earned_at >= (CURRENT_DATE - INTERVAL '180 days')) as points_semester,
    (SELECT COALESCE(SUM(points), 0) FROM points_history 
     WHERE student_id = cu.id AND earned_at >= (CURRENT_DATE - INTERVAL '365 days')) as points_year
  FROM 
    company_users cu
    JOIN companies c ON cu.company_id = c.id
    JOIN student_points sp ON cu.id = sp.student_id
  WHERE 
    cu.is_active = true
    AND (
      -- Permitir acesso para produtores
      public.is_current_user_producer_enhanced()
      OR
      -- Permitir acesso para estudantes (apenas seus próprios dados)
      EXISTS (
        SELECT 1 FROM public.company_users cu2 
        WHERE cu2.auth_user_id = auth.uid() 
        AND cu2.email = cu.email
      )
    );
$$;

-- Comentários sobre as correções
COMMENT ON FUNCTION public.award_points_to_student(UUID, INTEGER, TEXT, TEXT, TEXT, JSONB) IS 'Função para conceder pontos a estudantes com search_path fixo para segurança';
COMMENT ON FUNCTION public.check_and_unlock_achievements() IS 'Função para verificar e desbloquear conquistas automaticamente com search_path fixo';
COMMENT ON FUNCTION public.update_topic_replies_count() IS 'Função trigger para atualizar contador de respostas com search_path fixo';
COMMENT ON FUNCTION public.get_global_collaborator_ranking_period() IS 'Função para obter ranking de colaboradores por período com controle de acesso e search_path fixo'; 