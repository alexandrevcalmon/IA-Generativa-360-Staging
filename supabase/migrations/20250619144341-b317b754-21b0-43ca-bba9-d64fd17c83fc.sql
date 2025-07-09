
-- First, let's modify the table structure (this should work)
ALTER TABLE public.ai_configurations ALTER COLUMN company_id DROP NOT NULL;

-- Remove the unique constraint (this should work)
ALTER TABLE public.ai_configurations DROP CONSTRAINT IF EXISTS ai_configurations_company_id_provider_id_key;

-- Check existing policies and only create missing ones
DO $$
BEGIN
    -- Check and create SELECT policy for producers if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_configurations' 
        AND policyname = 'Producers can view all AI configurations'
    ) THEN
        CREATE POLICY "Producers can view all AI configurations" 
          ON public.ai_configurations FOR SELECT 
          TO authenticated 
          USING (
            EXISTS (
              SELECT 1 FROM public.producers 
              WHERE auth_user_id = auth.uid() AND is_active = true
            )
          );
    END IF;

    -- Check and create INSERT policy for producers if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_configurations' 
        AND policyname = 'Producers can insert AI configurations'
    ) THEN
        CREATE POLICY "Producers can insert AI configurations" 
          ON public.ai_configurations FOR INSERT 
          TO authenticated 
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.producers 
              WHERE auth_user_id = auth.uid() AND is_active = true
            )
          );
    END IF;

    -- Check and create UPDATE policy for producers if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_configurations' 
        AND policyname = 'Producers can update AI configurations'
    ) THEN
        CREATE POLICY "Producers can update AI configurations" 
          ON public.ai_configurations FOR UPDATE 
          TO authenticated 
          USING (
            EXISTS (
              SELECT 1 FROM public.producers 
              WHERE auth_user_id = auth.uid() AND is_active = true
            )
          );
    END IF;

    -- Check and create DELETE policy for producers if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_configurations' 
        AND policyname = 'Producers can delete AI configurations'
    ) THEN
        CREATE POLICY "Producers can delete AI configurations" 
          ON public.ai_configurations FOR DELETE 
          TO authenticated 
          USING (
            EXISTS (
              SELECT 1 FROM public.producers 
              WHERE auth_user_id = auth.uid() AND is_active = true
            )
          );
    END IF;
END $$;
