
-- Step 1: Fix RLS policies for profiles table
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create comprehensive RLS policies for profiles
-- Allow users to SELECT their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = auth.uid());

-- Allow users to INSERT their own profile (critical for new user creation)
CREATE POLICY "Users can create own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (id = auth.uid());

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow producers to manage all profiles (for admin functions)
CREATE POLICY "Producers can manage all profiles" 
  ON public.profiles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'producer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'producer'
    )
  );

-- Step 2: Create security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid)
RETURNS character varying
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role character varying;
BEGIN
    -- Direct query without RLS interference
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = user_id;
    
    -- Return the role or default to 'student'
    RETURN COALESCE(user_role, 'student');
EXCEPTION
    WHEN OTHERS THEN
        -- On any error, return safe default
        RETURN 'student';
END;
$$;

-- Step 3: Update company_users policies to use the safe function
DROP POLICY IF EXISTS "Producers can manage all company_users" ON public.company_users;
DROP POLICY IF EXISTS "Users can view their own company data" ON public.company_users;
DROP POLICY IF EXISTS "Users can update their own company data" ON public.company_users;

-- Recreate company_users policies with safe function
CREATE POLICY "Producers manage company_users" 
  ON public.company_users 
  FOR ALL 
  USING (public.get_user_role_safe(auth.uid()) = 'producer')
  WITH CHECK (public.get_user_role_safe(auth.uid()) = 'producer');

CREATE POLICY "Users view own company data" 
  ON public.company_users 
  FOR SELECT 
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users update own company data" 
  ON public.company_users 
  FOR UPDATE 
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Step 4: Create function to safely create user profiles
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id uuid, user_role character varying DEFAULT 'student')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert profile if it doesn't exist
    INSERT INTO public.profiles (id, role, created_at, updated_at)
    VALUES (
        user_id, 
        COALESCE(user_role, 'student'),
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        updated_at = now(),
        role = CASE 
            WHEN EXCLUDED.role != profiles.role THEN EXCLUDED.role 
            ELSE profiles.role 
        END;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail
        RAISE WARNING 'Failed to ensure profile for user %: %', user_id, SQLERRM;
END;
$$;

-- Step 5: Update companies policies to be consistent
DROP POLICY IF EXISTS "Producers can manage all companies" ON public.companies;
DROP POLICY IF EXISTS "Companies can view their own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can update their own data" ON public.companies;
DROP POLICY IF EXISTS "Collaborators can view their company data" ON public.companies;

-- Recreate companies policies
CREATE POLICY "Producers manage companies" 
  ON public.companies 
  FOR ALL 
  USING (public.get_user_role_safe(auth.uid()) = 'producer');

CREATE POLICY "Companies view own data" 
  ON public.companies 
  FOR SELECT 
  USING (auth_user_id = auth.uid());

CREATE POLICY "Companies update own data" 
  ON public.companies 
  FOR UPDATE 
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Collaborators view company data" 
  ON public.companies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_users 
      WHERE auth_user_id = auth.uid() 
      AND company_id = companies.id
    )
  );
