
-- Criar tabela para planos de assinatura
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  max_students INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que todos vejam planos ativos (para seleção)
CREATE POLICY "Anyone can view active plans" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (is_active = true);

-- Criar política para permitir CRUD completo para produtores (assumindo role 'producer')
CREATE POLICY "Producers can manage all plans" 
  ON public.subscription_plans 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Inserir planos padrão
INSERT INTO public.subscription_plans (name, description, price, max_students, features) VALUES
('Básico', 'Para pequenas empresas que estão começando', 99.00, 50, 
 '["Até 50 colaboradores", "Acesso a todos os cursos", "Relatórios básicos", "Suporte por email", "Certificados digitais"]'::jsonb),
('Business', 'Para empresas em crescimento', 199.00, 150, 
 '["Até 150 colaboradores", "Acesso a todos os cursos", "Relatórios avançados", "Suporte prioritário", "Certificados personalizados", "Analytics detalhados", "API de integração"]'::jsonb),
('Premium', 'Para grandes empresas com necessidades avançadas', 399.00, 200, 
 '["Até 200 colaboradores", "Acesso a todos os cursos", "Relatórios personalizados", "Suporte 24/7", "Certificados com marca própria", "Analytics em tempo real", "API completa", "Gerente de sucesso dedicado", "Cursos personalizados"]'::jsonb);

-- Atualizar tabela companies para referenciar subscription_plans
ALTER TABLE public.companies 
ADD COLUMN subscription_plan_id UUID REFERENCES public.subscription_plans(id);

-- Atualizar companies existentes para usar os novos planos
UPDATE public.companies SET subscription_plan_id = (
  SELECT id FROM public.subscription_plans WHERE name = 'Básico' LIMIT 1
) WHERE subscription_plan = 'basic';

UPDATE public.companies SET subscription_plan_id = (
  SELECT id FROM public.subscription_plans WHERE name = 'Business' LIMIT 1
) WHERE subscription_plan = 'business';

UPDATE public.companies SET subscription_plan_id = (
  SELECT id FROM public.subscription_plans WHERE name = 'Premium' LIMIT 1
) WHERE subscription_plan = 'premium';
