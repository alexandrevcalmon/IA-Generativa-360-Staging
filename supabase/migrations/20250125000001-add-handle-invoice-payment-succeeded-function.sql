-- Migration para adicionar função handle_invoice_payment_succeeded
-- Esta função é chamada pelo webhook do Stripe para processar eventos invoice.payment_succeeded

CREATE OR REPLACE FUNCTION public.handle_invoice_payment_succeeded(
  event_payload JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invoice_data JSONB;
  subscription_id TEXT;
  customer_id TEXT;
  company_record RECORD;
  result JSON;
  metadata_obj JSONB;
  plan_id TEXT;
  company_name TEXT;
BEGIN
  -- Extrair dados do invoice do payload do evento
  invoice_data := event_payload->'data'->'object';
  
  -- Extrair subscription_id e customer_id
  subscription_id := invoice_data->>'subscription';
  customer_id := invoice_data->>'customer';
  
  -- Log para debug
  RAISE NOTICE 'Processing invoice.payment_succeeded for subscription: %, customer: %', subscription_id, customer_id;
  
  -- Verificar se temos os dados necessários
  IF subscription_id IS NULL OR customer_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Missing required data',
      'details', format('subscription_id: %s, customer_id: %s', subscription_id, customer_id)
    );
  END IF;

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

  -- Se não encontrou a empresa, tentar buscar pelo customer_id
  IF NOT FOUND THEN
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
    WHERE stripe_customer_id = customer_id
    LIMIT 1;
  END IF;

  -- Se ainda não encontrou, verificar se há metadados no invoice para criar/atualizar empresa
  IF NOT FOUND THEN
    -- Tentar extrair metadados do invoice
    metadata_obj := invoice_data->'lines'->'data'->0->'metadata';
    
    IF metadata_obj IS NOT NULL THEN
      plan_id := metadata_obj->>'plan_id';
      company_name := metadata_obj->>'company_name';
      
      RAISE NOTICE 'Found metadata in invoice: plan_id=%, company_name=%', plan_id, company_name;
      
      -- Se temos metadados, a empresa pode ter sido criada recentemente
      -- Vamos tentar buscar novamente por customer_id ou subscription_id
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
      WHERE stripe_customer_id = customer_id OR stripe_subscription_id = subscription_id
      LIMIT 1;
    END IF;
  END IF;

  -- Se ainda não encontrou a empresa, retornar erro informativo
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Company not found',
      'details', format('No company found with subscription_id: %s or customer_id: %s', subscription_id, customer_id),
      'suggestion', 'This might be a new subscription. Check if checkout.session.completed was processed first.'
    );
  END IF;

  -- Atualizar a empresa com status ativo e dados do Stripe
  UPDATE companies 
  SET 
    subscription_status = 'active',
    stripe_customer_id = customer_id,
    stripe_subscription_id = subscription_id,
    updated_at = NOW()
  WHERE id = company_record.id;

  -- Verificar se a atualização foi bem-sucedida
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to update company',
      'details', format('Could not update company with id: %s', company_record.id)
    );
  END IF;

  -- Retornar sucesso com dados da empresa
  RETURN json_build_object(
    'success', true,
    'company_id', company_record.id,
    'company_name', company_record.name,
    'subscription_id', subscription_id,
    'customer_id', customer_id,
    'status', 'active',
    'message', 'Invoice payment processed successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar detalhes do erro
    RAISE NOTICE 'Error in handle_invoice_payment_succeeded: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', 'Database error',
      'details', SQLERRM,
      'sqlstate', SQLSTATE
    );
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION public.handle_invoice_payment_succeeded IS 
'Função para processar eventos invoice.payment_succeeded do webhook do Stripe. 
Atualiza o status da assinatura da empresa para ativo quando o pagamento é bem-sucedido.';