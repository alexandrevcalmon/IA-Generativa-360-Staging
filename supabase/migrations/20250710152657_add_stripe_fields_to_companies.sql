-- Adicionar campos Stripe na tabela companies
ALTER TABLE companies 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN stripe_plan_id TEXT,
ADD COLUMN max_collaborators INTEGER DEFAULT 0,
ADD COLUMN subscription_period TEXT,
ADD COLUMN subscription_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN created_via_stripe BOOLEAN DEFAULT FALSE;

-- Criar índices para melhor performance
CREATE INDEX idx_companies_stripe_customer_id ON companies(stripe_customer_id);
CREATE INDEX idx_companies_stripe_subscription_id ON companies(stripe_subscription_id);
CREATE INDEX idx_companies_subscription_status ON companies(subscription_status);

-- Comentários para documentação
COMMENT ON COLUMN companies.stripe_customer_id IS 'ID do cliente no Stripe';
COMMENT ON COLUMN companies.stripe_subscription_id IS 'ID da assinatura no Stripe';
COMMENT ON COLUMN companies.subscription_status IS 'Status da assinatura: active, canceled, past_due, etc';
COMMENT ON COLUMN companies.stripe_plan_id IS 'ID do produto/plano no Stripe';
COMMENT ON COLUMN companies.max_collaborators IS 'Limite máximo de colaboradores conforme plano';
COMMENT ON COLUMN companies.subscription_period IS 'Período da assinatura: semestral, anual';
COMMENT ON COLUMN companies.subscription_ends_at IS 'Data de término da assinatura';
COMMENT ON COLUMN companies.created_via_stripe IS 'Indica se a empresa foi criada via fluxo Stripe';
