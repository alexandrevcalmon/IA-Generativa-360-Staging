
-- Fix the RLS policies by properly dropping existing ones first

-- Companies table policies
DROP POLICY IF EXISTS "Producers can manage all companies" ON public.companies;
DROP POLICY IF EXISTS "Companies can view their own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can update their own data" ON public.companies;
DROP POLICY IF EXISTS "Collaborators can view their company data" ON public.companies;
DROP POLICY IF EXISTS "Producers can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Producers can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Producers can update companies" ON public.companies;
DROP POLICY IF EXISTS "Producers can delete companies" ON public.companies;

-- Create comprehensive RLS policies for companies table
CREATE POLICY "Producers can view all companies" 
  ON public.companies 
  FOR SELECT 
  USING (public.is_current_user_producer_enhanced());

CREATE POLICY "Producers can insert companies" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (public.is_current_user_producer_enhanced());

CREATE POLICY "Producers can update companies" 
  ON public.companies 
  FOR UPDATE 
  USING (public.is_current_user_producer_enhanced());

CREATE POLICY "Producers can delete companies" 
  ON public.companies 
  FOR DELETE 
  USING (public.is_current_user_producer_enhanced());

-- Companies can view and update their own data
CREATE POLICY "Companies can view their own data" 
  ON public.companies 
  FOR SELECT 
  USING (auth_user_id = auth.uid());

CREATE POLICY "Companies can update their own data" 
  ON public.companies 
  FOR UPDATE 
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Collaborators can view their company data
CREATE POLICY "Collaborators can view their company data" 
  ON public.companies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users 
      WHERE auth_user_id = auth.uid() 
      AND company_id = companies.id
      AND is_active = true
    )
  );

-- Subscription plans table policies
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Producers can manage subscription plans" ON public.subscription_plans;

CREATE POLICY "Anyone can view active subscription plans" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Producers can manage subscription plans" 
  ON public.subscription_plans 
  FOR ALL 
  USING (public.is_current_user_producer_enhanced())
  WITH CHECK (public.is_current_user_producer_enhanced());

-- Producers table policies - drop all existing ones first
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Producers can view their own data" ON public.producers;
DROP POLICY IF EXISTS "Producers can update their own data" ON public.producers;
DROP POLICY IF EXISTS "Anyone can check producer status" ON public.producers;

CREATE POLICY "Producers can view their own data" 
  ON public.producers 
  FOR SELECT 
  USING (auth_user_id = auth.uid());

CREATE POLICY "Producers can update their own data" 
  ON public.producers 
  FOR UPDATE 
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Allow authenticated users to check if they are producers
CREATE POLICY "Anyone can check producer status" 
  ON public.producers 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Profiles table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can check roles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow authenticated users to check roles for authorization
CREATE POLICY "Authenticated users can check roles" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Update the enhanced functions for better performance and error handling
CREATE OR REPLACE FUNCTION public.is_current_user_producer_enhanced()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get current user ID safely
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- First check producers table
    IF EXISTS (
        SELECT 1 FROM public.producers 
        WHERE auth_user_id = current_user_id AND is_active = true
    ) THEN
        RETURN true;
    END IF;
    
    -- Fallback: check profiles table
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = current_user_id AND role = 'producer'
    ) THEN
        -- Auto-migrate to producers table
        BEGIN
            INSERT INTO public.producers (auth_user_id, name, email)
            SELECT 
                current_user_id,
                COALESCE(au.raw_user_meta_data->>'name', 'Producer'),
                au.email
            FROM auth.users au 
            WHERE au.id = current_user_id
            ON CONFLICT (auth_user_id) DO NOTHING;
        EXCEPTION
            WHEN OTHERS THEN
                -- Log error but don't fail
                NULL;
        END;
        
        RETURN true;
    END IF;
    
    RETURN false;
EXCEPTION
    WHEN OTHERS THEN
        -- On any error, return false safely
        RETURN false;
END;
$function$;

-- Update the enhanced role function
CREATE OR REPLACE FUNCTION public.get_user_role_enhanced(user_id uuid)
 RETURNS character varying
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
    user_role character varying;
BEGIN
    IF user_id IS NULL THEN
        RETURN 'student';
    END IF;
    
    -- Check if user is a producer first
    IF EXISTS (SELECT 1 FROM public.producers WHERE auth_user_id = user_id AND is_active = true) THEN
        RETURN 'producer';
    END IF;
    
    -- Check if user is a company owner
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
    IF EXISTS (SELECT 1 FROM public.company_users WHERE auth_user_id = user_id AND is_active = true) THEN
        RETURN 'collaborator';
    END IF;
    
    -- Default to student
    RETURN 'student';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'student';
END;
$function$;
