
-- Create AI providers table
CREATE TABLE public.ai_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  api_endpoint VARCHAR(255) NOT NULL,
  requires_api_key BOOLEAN NOT NULL DEFAULT true,
  supported_models JSONB NOT NULL DEFAULT '[]',
  default_model VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI configurations table for companies
CREATE TABLE public.ai_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  model_name VARCHAR(100) NOT NULL,
  api_key_encrypted TEXT,
  system_prompt TEXT NOT NULL DEFAULT 'Você é um assistente especializado em responder perguntas sobre o conteúdo das lições. Use apenas as informações fornecidas no contexto para responder.',
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER NOT NULL DEFAULT 1000 CHECK (max_tokens > 0 AND max_tokens <= 8000),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, provider_id)
);

-- Create lesson materials table for context
CREATE TABLE public.lesson_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  extracted_content TEXT,
  file_size_bytes INTEGER,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default AI providers
INSERT INTO public.ai_providers (name, display_name, api_endpoint, supported_models, default_model) VALUES
('openai', 'OpenAI', 'https://api.openai.com/v1', 
 '["gpt-4o", "gpt-4o-mini", "gpt-4", "gpt-3.5-turbo"]', 'gpt-4o-mini'),
('gemini', 'Google Gemini', 'https://generativelanguage.googleapis.com/v1beta',
 '["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"]', 'gemini-1.5-flash'),
('deepseek', 'DeepSeek', 'https://api.deepseek.com/v1',
 '["deepseek-chat", "deepseek-coder"]', 'deepseek-chat');

-- Enable RLS
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_providers (read-only for all authenticated users)
CREATE POLICY "AI providers are viewable by authenticated users" 
  ON public.ai_providers FOR SELECT 
  TO authenticated 
  USING (true);

-- RLS policies for ai_configurations
CREATE POLICY "Companies can view their own AI configurations" 
  ON public.ai_configurations FOR SELECT 
  TO authenticated 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can insert their own AI configurations" 
  ON public.ai_configurations FOR INSERT 
  TO authenticated 
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update their own AI configurations" 
  ON public.ai_configurations FOR UPDATE 
  TO authenticated 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can delete their own AI configurations" 
  ON public.ai_configurations FOR DELETE 
  TO authenticated 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

-- RLS policies for lesson_materials
CREATE POLICY "Companies can view their own lesson materials" 
  ON public.lesson_materials FOR SELECT 
  TO authenticated 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can insert their own lesson materials" 
  ON public.lesson_materials FOR INSERT 
  TO authenticated 
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update their own lesson materials" 
  ON public.lesson_materials FOR UPDATE 
  TO authenticated 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can delete their own lesson materials" 
  ON public.lesson_materials FOR DELETE 
  TO authenticated 
  USING (
    company_id IN (
      SELECT id FROM public.companies 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Producers can view all configurations for analytics
CREATE POLICY "Producers can view all AI configurations" 
  ON public.ai_configurations FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

CREATE POLICY "Producers can view all lesson materials" 
  ON public.lesson_materials FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );
