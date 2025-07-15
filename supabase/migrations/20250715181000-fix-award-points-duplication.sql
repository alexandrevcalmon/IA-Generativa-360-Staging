-- Atualiza a função para evitar duplicidade de pontos
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