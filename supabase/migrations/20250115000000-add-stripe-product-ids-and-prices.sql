local-- Adicionar campos do Stripe à tabela subscription_plans
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Inserir os planos com os IDs do Stripe fornecidos
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
  'prod_SedYxAWeBjaMM0',
  'price_1RjKHe4gaE84sNi0O6fUvTgq',
  NOW(),
  NOW()
),
-- Starter 5 - Anual (12 meses)
(
  'starter_5_anual',
  'Starter 5',
  5,
  365,
  'prod_SeddHsdOwwbtyI',
  'price_1RjKMM4gaE84sNi0zAzsXkAk',
  NOW(),
  NOW()
),
-- Starter 10 - Semestral (6 meses)
(
  'starter_10_semestral',
  'Starter 10',
  10,
  180,
  'prod_SedjWSI3Hrmmb9',
  'price_1RjKRd4gaE84sNi0TCQ4mWkK',
  NOW(),
  NOW()
),
-- Starter 10 - Anual (12 meses)
(
  'starter_10_anual',
  'Starter 10',
  10,
  365,
  'prod_SedlCkXK4ZQjHl',
  'price_1RjKTx4gaE84sNi0VhePmv8M',
  NOW(),
  NOW()
),
-- Starter 25 - Semestral (6 meses)
(
  'starter_25_semestral',
  'Starter 25',
  25,
  180,
  'prod_Sedo2OcgsH2hj1',
  'price_1RjKWn4gaE84sNi0yjqw2fMQ',
  NOW(),
  NOW()
),
-- Starter 25 - Anual (12 meses)
(
  'starter_25_anual',
  'Starter 25',
  25,
  365,
  'prod_SedqKdKa09qAb9',
  'price_1RjKYv4gaE84sNi0qdDSgHZX',
  NOW(),
  NOW()
),
-- Starter 50 - Semestral (6 meses)
(
  'starter_50_semestral',
  'Starter 50',
  50,
  180,
  'prod_SedtiC1kEgAcMd',
  'price_1RjKbN4gaE84sNi0V5j1Yurq',
  NOW(),
  NOW()
),
-- Starter 50 - Anual (12 meses)
(
  'starter_50_anual',
  'Starter 50',
  50,
  365,
  'prod_SedveLSteTQwQW',
  'price_1RjKdQ4gaE84sNi0qC1LKMZJ',
  NOW(),
  NOW()
),
-- Starter 100 - Semestral (6 meses)
(
  'starter_100_semestral',
  'Starter 100',
  100,
  180,
  'prod_Sedx0hLJDjrbdo',
  'price_1RjKfV4gaE84sNi0tqJWMmwV',
  NOW(),
  NOW()
),
-- Starter 100 - Anual (12 meses)
(
  'starter_100_anual',
  'Starter 100',
  100,
  365,
  'prod_SedzGgwgO66Xj7',
  'price_1RjKhu4gaE84sNi05XaH5wij',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  stripe_product_id = EXCLUDED.stripe_product_id,
  stripe_price_id = EXCLUDED.stripe_price_id,
  updated_at = NOW(); 