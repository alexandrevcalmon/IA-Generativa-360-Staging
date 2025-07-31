
-- Corrigir dados inconsistentes na tabela companies
-- Garantir que o current_students reflita os colaboradores ativos
UPDATE companies 
SET current_students = (
  SELECT COUNT(*) 
  FROM company_users 
  WHERE company_users.company_id = companies.id 
  AND company_users.is_active = true
);

-- Garantir que max_students está alinhado com os planos de subscrição
UPDATE companies 
SET max_students = CASE 
  WHEN subscription_plan = 'basic' THEN 50
  WHEN subscription_plan = 'premium' THEN 200
  WHEN subscription_plan = 'enterprise' THEN 1000
  ELSE 50
END
WHERE subscription_plan_id IS NULL;

-- Criar alguns dados de exemplo mais realistas para as sessões de mentoria
UPDATE mentorship_sessions 
SET max_participants = CASE 
  WHEN company_id IN (
    SELECT id FROM companies WHERE subscription_plan = 'basic'
  ) THEN 10
  WHEN company_id IN (
    SELECT id FROM companies WHERE subscription_plan = 'premium'
  ) THEN 25
  WHEN company_id IN (
    SELECT id FROM companies WHERE subscription_plan = 'enterprise'
  ) THEN 50
  ELSE 10
END;

-- Atualizar estatísticas de cursos para refletir dados mais realistas
UPDATE courses 
SET 
  estimated_hours = CASE 
    WHEN estimated_hours IS NULL OR estimated_hours = 0 
    THEN (random() * 20 + 5)::integer 
    ELSE estimated_hours 
  END;
