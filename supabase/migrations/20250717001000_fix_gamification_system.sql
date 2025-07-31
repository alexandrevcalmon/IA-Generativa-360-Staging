-- Script para corrigir e melhorar o sistema de gamificação

-- 1. Criar tabela de limites diários de gamificação
CREATE TABLE IF NOT EXISTS public.user_daily_gamification_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type VARCHAR NOT NULL,
  action_date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, action_type, action_date)
);

-- Adicionar comentários à tabela
COMMENT ON TABLE public.user_daily_gamification_limits IS 'Armazena os limites diários de ações de gamificação por usuário';
COMMENT ON COLUMN public.user_daily_gamification_limits.user_id IS 'ID do usuário na tabela auth.users';
COMMENT ON COLUMN public.user_daily_gamification_limits.action_type IS 'Tipo de ação (ex: community_topic_liked, community_reply_created)';
COMMENT ON COLUMN public.user_daily_gamification_limits.action_date IS 'Data da ação (sem hora)';
COMMENT ON COLUMN public.user_daily_gamification_limits.count IS 'Contador de quantas vezes a ação foi realizada no dia';

-- Adicionar políticas RLS para a tabela de limites diários
ALTER TABLE public.user_daily_gamification_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily limits" ON public.user_daily_gamification_limits
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily limits" ON public.user_daily_gamification_limits
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily limits" ON public.user_daily_gamification_limits
FOR UPDATE USING (auth.uid() = user_id);

-- 2. Remover views existentes se houver
DROP VIEW IF EXISTS public.global_collaborator_ranking_period;
DROP VIEW IF EXISTS public.global_collaborator_ranking;

-- 3. Criar view de ranking global
CREATE VIEW public.global_collaborator_ranking_new AS
SELECT 
  cu.id as collaborator_id,
  cu.name as collaborator_name,
  cu.email as collaborator_email,
  c.name as company_name,
  sp.total_points,
  sp.level,
  ROW_NUMBER() OVER (ORDER BY sp.total_points DESC) as position
FROM 
  company_users cu
  JOIN companies c ON cu.company_id = c.id
  JOIN student_points sp ON cu.id = sp.student_id
WHERE 
  cu.is_active = true;

-- 4. Criar view de ranking por período
CREATE VIEW public.global_collaborator_ranking_period_new AS
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
  cu.is_active = true;

-- 5. Criar função para verificar e desbloquear conquistas automaticamente
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar trigger para verificar conquistas quando os pontos são atualizados
DROP TRIGGER IF EXISTS check_achievements_on_points_update ON public.student_points;
CREATE TRIGGER check_achievements_on_points_update
AFTER UPDATE OF total_points ON public.student_points
FOR EACH ROW
WHEN (NEW.total_points > OLD.total_points)
EXECUTE FUNCTION public.check_and_unlock_achievements();

-- 7. Criar função para atualizar streak_days quando o usuário faz login
CREATE OR REPLACE FUNCTION public.update_streak_days()
RETURNS TRIGGER AS $$
DECLARE
  last_activity DATE;
  current_streak INTEGER;
  streak_bonus INTEGER;
BEGIN
  -- Obter a última data de atividade e o streak atual
  SELECT last_activity_date, streak_days INTO last_activity, current_streak
  FROM student_points
  WHERE student_id = NEW.student_id;
  
  -- Se não houver registro anterior, inicializar
  IF last_activity IS NULL THEN
    UPDATE student_points
    SET 
      last_activity_date = CURRENT_DATE,
      streak_days = 1
    WHERE student_id = NEW.student_id;
    RETURN NEW;
  END IF;
  
  -- Se o último login foi hoje, não fazer nada
  IF last_activity = CURRENT_DATE THEN
    RETURN NEW;
  END IF;
  
  -- Se o último login foi ontem, incrementar streak
  IF last_activity = (CURRENT_DATE - INTERVAL '1 day')::date THEN
    -- Incrementar streak
    UPDATE student_points
    SET 
      last_activity_date = CURRENT_DATE,
      streak_days = streak_days + 1
    WHERE student_id = NEW.student_id;
    
    -- Verificar se atingiu um marco de streak para dar bônus
    SELECT streak_days INTO current_streak
    FROM student_points
    WHERE student_id = NEW.student_id;
    
    -- Determinar o bônus baseado no streak
    IF current_streak = 3 THEN
      streak_bonus := 5;
    ELSIF current_streak = 7 THEN
      streak_bonus := 10;
    ELSIF current_streak = 30 THEN
      streak_bonus := 20;
    ELSIF current_streak % 30 = 0 AND current_streak > 30 THEN
      streak_bonus := 20; -- Bônus a cada 30 dias
    ELSE
      streak_bonus := 0;
    END IF;
    
    -- Se houver bônus, adicionar pontos
    IF streak_bonus > 0 THEN
      -- Registrar no histórico
      INSERT INTO points_history (
        student_id,
        points,
        action_type,
        description,
        earned_at
      ) VALUES (
        NEW.student_id,
        streak_bonus,
        'streak_bonus',
        'Bônus por ' || current_streak || ' dias consecutivos',
        now()
      );
      
      -- Atualizar pontos
      UPDATE student_points
      SET 
        points = points + streak_bonus,
        total_points = total_points + streak_bonus
      WHERE student_id = NEW.student_id;
    END IF;
  -- Se o último login foi há mais de um dia (não ontem), resetar streak
  ELSIF last_activity < (CURRENT_DATE - INTERVAL '1 day')::date THEN
    UPDATE student_points
    SET 
      last_activity_date = CURRENT_DATE,
      streak_days = 1
    WHERE student_id = NEW.student_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar trigger para atualizar streak quando há uma nova entrada no histórico de pontos
DROP TRIGGER IF EXISTS update_streak_on_points_history ON public.points_history;
CREATE TRIGGER update_streak_on_points_history
AFTER INSERT ON public.points_history
FOR EACH ROW
EXECUTE FUNCTION public.update_streak_days();

-- 9. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_points_history_student_id ON public.points_history(student_id);
CREATE INDEX IF NOT EXISTS idx_points_history_earned_at ON public.points_history(earned_at);
CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON public.student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_limits_user_action_date ON public.user_daily_gamification_limits(user_id, action_type, action_date);