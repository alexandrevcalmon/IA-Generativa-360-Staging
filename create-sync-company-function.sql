-- Script para criar a função sync_company_with_stripe_webhook
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, remover a função existente se ela existir
DROP FUNCTION IF EXISTS public.sync_company_with_stripe_webhook(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.sync_company_with_stripe_webhook(TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.sync_company_with_stripe_webhook(
  subscription_id TEXT,
  customer_id TEXT,
  status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Verificar se a função foi criada
SELECT 
  'Function created successfully' as status,
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'sync_company_with_stripe_webhook'; 