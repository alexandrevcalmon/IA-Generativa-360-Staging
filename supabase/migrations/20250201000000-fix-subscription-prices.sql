-- Corrigir os preços dos planos de assinatura com base nos valores reais do Stripe

-- Atualizar Starter 5 - Semestral (6 meses)
UPDATE subscription_plans 
SET price = 94.37, semester_price = 94.37, updated_at = NOW()
WHERE stripe_price_id = 'price_1RpvcJG3mvaBriwAQt5eIhjf';

-- Atualizar Starter 5 - Anual (12 meses)
UPDATE subscription_plans 
SET price = 80.65, annual_price = 80.65, updated_at = NOW()
WHERE stripe_price_id = 'price_1RjLNCG3mvaBriwAwt0Tr4Pu';

-- Atualizar Starter 10 - Semestral (6 meses)
UPDATE subscription_plans 
SET price = 188.72, semester_price = 188.72, updated_at = NOW()
WHERE stripe_price_id = 'price_1RjLNHG3mvaBriwAfbOvy4XD';

-- Atualizar Starter 10 - Anual (12 meses)
UPDATE subscription_plans 
SET price = 161.30, annual_price = 161.30, updated_at = NOW()
WHERE stripe_price_id = 'price_1RjLNUG3mvaBriwAn78cshYc';

-- Atualizar Starter 25 - Semestral (6 meses)
UPDATE subscription_plans 
SET price = 471.80, semester_price = 471.80, updated_at = NOW()
WHERE stripe_price_id = 'price_1RjLNbG3mvaBriwAosM1k7IB';

-- Atualizar Starter 25 - Anual (12 meses)
UPDATE subscription_plans 
SET price = 403.25, annual_price = 403.25, updated_at = NOW()
WHERE stripe_price_id = 'price_1RjLNeG3mvaBriwASQHMVYnj';

-- Atualizar Starter 50 - Semestral (6 meses)
UPDATE subscription_plans 
SET price = 943.60, semester_price = 943.60, updated_at = NOW()
WHERE stripe_price_id = 'price_1RjLNjG3mvaBriwAfLSVMkjg';

-- Atualizar Starter 50 - Anual (12 meses)
UPDATE subscription_plans 
SET price = 806.50, annual_price = 806.50, updated_at = NOW()
WHERE stripe_price_id = 'price_1RjLNmG3mvaBriwAh4CDDaVA';

-- Atualizar Starter 100 - Semestral (6 meses)
UPDATE subscription_plans 
SET price = 1887.21, semester_price = 1887.21, updated_at = NOW()
WHERE stripe_price_id = 'price_1RjLNqG3mvaBriwAF1jnjSpI';

-- Atualizar Starter 100 - Anual (12 meses)
UPDATE subscription_plans 
SET price = 1613.00, annual_price = 1613.00, updated_at = NOW()
WHERE stripe_price_id = 'price_1RjLNtG3mvaBriwA15U62gXm';