
-- Update the Gemini provider to include Gemini 2.0 Flash model
UPDATE public.ai_providers 
SET supported_models = '["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro"]',
    default_model = 'gemini-2.0-flash-exp'
WHERE name = 'gemini';

-- Allow producers to create global AI configurations (company_id can be null)
ALTER TABLE public.ai_configurations 
DROP CONSTRAINT IF EXISTS ai_configurations_company_id_provider_id_key;

-- Add new unique constraint that allows null company_id for producers
CREATE UNIQUE INDEX ai_configurations_unique_global 
ON public.ai_configurations (provider_id) 
WHERE company_id IS NULL;

CREATE UNIQUE INDEX ai_configurations_unique_company 
ON public.ai_configurations (company_id, provider_id) 
WHERE company_id IS NOT NULL;

-- Update RLS policies to allow producers to create global configurations
CREATE POLICY "Producers can create global AI configurations" 
  ON public.ai_configurations FOR INSERT 
  TO authenticated 
  WITH CHECK (
    company_id IS NULL AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

CREATE POLICY "Producers can update global AI configurations" 
  ON public.ai_configurations FOR UPDATE 
  TO authenticated 
  USING (
    company_id IS NULL AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

CREATE POLICY "Producers can delete global AI configurations" 
  ON public.ai_configurations FOR DELETE 
  TO authenticated 
  USING (
    company_id IS NULL AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'producer'
    )
  );
