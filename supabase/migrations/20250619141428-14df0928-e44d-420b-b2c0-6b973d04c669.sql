
-- Create producers table to track producer users
CREATE TABLE public.producers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(auth_user_id)
);

-- Enable RLS on producers table
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for producers table
CREATE POLICY "Producers can view their own data" 
  ON public.producers 
  FOR SELECT 
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Producers can update their own data" 
  ON public.producers 
  FOR UPDATE 
  USING (auth.uid() = auth_user_id);

-- Create function to check if current user is a producer
CREATE OR REPLACE FUNCTION public.is_current_user_producer_new()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.producers 
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
$$;

-- Create function to get user role with producer check
CREATE OR REPLACE FUNCTION public.get_user_role_enhanced(user_id uuid)
RETURNS character varying
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
    user_role character varying;
BEGIN
    -- First check if user is a producer
    IF EXISTS (SELECT 1 FROM public.producers WHERE auth_user_id = user_id AND is_active = true) THEN
        RETURN 'producer';
    END IF;
    
    -- Then check if user is a company owner
    IF EXISTS (SELECT 1 FROM public.companies WHERE auth_user_id = user_id) THEN
        RETURN 'company';
    END IF;
    
    -- Check profiles table for explicit role
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = user_id;
    
    IF user_role IS NOT NULL AND user_role != 'student' THEN
        RETURN user_role;
    END IF;
    
    -- Check if it's a company collaborator
    IF EXISTS (SELECT 1 FROM public.company_users WHERE auth_user_id = user_id) THEN
        RETURN 'collaborator';
    END IF;
    
    -- Default to student
    RETURN 'student';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'student';
END;
$$;

-- Insert a test producer user (you can remove this after testing)
-- This creates a producer entry for testing purposes
-- Replace 'your-test-email@example.com' with an actual email you can use for testing
INSERT INTO public.producers (auth_user_id, name, email) 
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'Producer Test'),
  au.email
FROM auth.users au 
WHERE au.email = 'producer@test.com' -- Change this to your test email
ON CONFLICT (auth_user_id) DO NOTHING;
