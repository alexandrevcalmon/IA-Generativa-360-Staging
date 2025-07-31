
-- Adicionar a coluna billing_period na tabela companies
ALTER TABLE public.companies 
ADD COLUMN billing_period character varying CHECK (billing_period IN ('semester', 'annual'));
