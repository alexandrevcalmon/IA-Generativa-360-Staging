-- Adicionar campos do Stripe à tabela subscription_plans
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Inserir os planos com os IDs do Stripe de produção
INSERT INTO subscription_plans (
  id,
  name,
  max_collaborators,
  subscription_period_days,
  stripe_product_id,
  stripe_price_id,
  created_at,
  updated_at
) VALUES
-- Starter 5 - Semestral (6 meses)
(
  'starter_5_semestral',
  'Starter 5',
  5,
  180,
  'prod_SlSXMZzwJie1z0',
  'price_1RpvcJG3mvaBriwAQt5eIhjf',
  NOW(),
  NOW()
),
-- Starter 5 - Anual (12 meses)
(
  'starter_5_anual',
  'Starter 5',
  5,
  365,
  'prod_SeegAgglteTV3Y',
  'price_1RjLNCG3mvaBriwAwt0Tr4Pu',
  NOW(),
  NOW()
),
-- Starter 10 - Semestral (6 meses)
(
  'starter_10_semestral',
  'Starter 10',
  10,
  180,
  'prod_SeegxTbksUGavj',
  'price_1RjLNHG3mvaBriwAfbOvy4XD',
  NOW(),
  NOW()
),
-- Starter 10 - Anual (12 meses)
(
  'starter_10_anual',
  'Starter 10',
  10,
  365,
  'prod_SeegmF465rIMxT',
  'price_1RjLNUG3mvaBriwAn78cshYc',
  NOW(),
  NOW()
),
-- Starter 25 - Semestral (6 meses)
(
  'starter_25_semestral',
  'Starter 25',
  25,
  180,
  'prod_SeegmDnsywdYwm',
  'price_1RjLNbG3mvaBriwAosM1k7IB',
  NOW(),
  NOW()
),
-- Starter 25 - Anual (12 meses)
(
  'starter_25_anual',
  'Starter 25',
  25,
  365,
  'prod_SeehITtgNnhCZ5',
  'price_1RjLNeG3mvaBriwASQHMVYnj',
  NOW(),
  NOW()
),
-- Starter 50 - Semestral (6 meses)
(
  'starter_50_semestral',
  'Starter 50',
  50,
  180,
  'prod_SeehHLfbATlxqV',
  'price_1RjLNjG3mvaBriwAfLSVMkjg',
  NOW(),
  NOW()
),
-- Starter 50 - Anual (12 meses)
(
  'starter_50_anual',
  'Starter 50',
  50,
  365,
  'prod_Seehy5v0DyXnlO',
  'price_1RjLNmG3mvaBriwAh4CDDaVA',
  NOW(),
  NOW()
),
-- Starter 100 - Semestral (6 meses)
(
  'starter_100_semestral',
  'Starter 100',
  100,
  180,
  'prod_SeehKE0a5mWimp',
  'price_1RjLNqG3mvaBriwAF1jnjSpI',
  NOW(),
  NOW()
),
-- Starter 100 - Anual (12 meses)
(
  'starter_100_anual',
  'Starter 100',
  100,
  365,
  'prod_SeehCdIDn2a7ok',
  'price_1RjLNtG3mvaBriwA15U62gXm',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  stripe_product_id = EXCLUDED.stripe_product_id,
  stripe_price_id = EXCLUDED.stripe_price_id,
  updated_at = NOW();