-- Migration para corrigir o problema de cache da função sync_company_with_stripe_webhook
-- O erro indica que a função não foi encontrada no cache do schema

-- Primeiro, vamos dropar a função existente para garantir uma recriação limpa
DROP FUNCTION IF EXISTS public.sync_company_with_stripe_webhook(TEXT, TEXT, TEXT);

-- Recriar a função com parâmetros corretos
CREATE OR REPLACE FUNCTION public.sync_company_with_stripe_webhook(
  subscription_id TEXT,
  customer_id TEXT,
  status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  company_record RECORD;
  result JSON;
BEGIN
  -- Buscar a empresa pelo subscription_id
  SELECT 
    id,
    name,
    contact_email,
    stripe_customer_id,
    stripe_subscription_id,
    subscription_status,
    subscription_starts_at,
    subscription_ends_at
  INTO company_record
  FROM companies 
  WHERE stripe_subscription_id = subscription_id
  LIMIT 1;

  -- Se não encontrou a empresa, retornar erro
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Company not found',
      'details', format('No company found with subscription_id: %s', subscription_id)
    );
  END IF;

  -- Atualizar a empresa com os novos dados
  UPDATE companies 
  SET 
    subscription_status = status,
    stripe_customer_id = customer_id,
    updated_at = NOW()
  WHERE id = company_record.id;

  -- Retornar sucesso com dados da empresa
  RETURN json_build_object(
    'success', true,
    'company_id', company_record.id,
    'company_name', company_record.name,
    'subscription_id', subscription_id,
    'customer_id', customer_id,
    'status', status,
    'message', 'Company synchronized successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar detalhes do erro
    RETURN json_build_object(
      'success', false,
      'error', 'Database error',
      'details', SQLERRM
    );
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.sync_company_with_stripe_webhook IS 
'Função para sincronizar dados da empresa via webhook do Stripe. 
Chamada quando um invoice.payment_succeeded é recebido.';

-- Garantir que a função seja visível no cache do schema
SELECT pg_reload_conf();

-- Verificar se a função foi criada corretamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'sync_company_with_stripe_webhook' 
    AND routine_schema = 'public'
  ) THEN
    RAISE EXCEPTION 'Função sync_company_with_stripe_webhook não foi criada corretamente';
  END IF;
END $$; 