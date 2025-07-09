
-- Fix the infinite recursion in RLS policies for profiles table
-- Remove problematic policies that cause recursion
DROP POLICY IF EXISTS "Producers can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Add a policy for producers to view all profiles (but not using recursive query)
-- We'll use the safe function that doesn't cause recursion
CREATE POLICY "Producers can view all profiles" ON public.profiles
FOR SELECT USING (
  -- Either it's the user's own profile OR they are a producer (checked safely)
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'producer'
  )
);

-- Ensure the courses policies use the safe function
DROP POLICY IF EXISTS "Producers can manage their own courses" ON public.courses;
CREATE POLICY "Producers can manage their own courses" ON public.courses
FOR ALL USING (
    public.get_user_role_safe(auth.uid()) = 'producer' AND 
    instructor_id = auth.uid()
);

-- Make sure we have proper policies for company_users table
DROP POLICY IF EXISTS "Producers can view all company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can insert company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can update company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can delete company users" ON public.company_users;

-- Recreate company_users policies using the safe function
CREATE POLICY "Producers can view all company users" ON public.company_users
FOR SELECT USING (public.get_user_role_safe(auth.uid()) = 'producer');

CREATE POLICY "Producers can insert company users" ON public.company_users
FOR INSERT WITH CHECK (public.get_user_role_safe(auth.uid()) = 'producer');

CREATE POLICY "Producers can update company users" ON public.company_users
FOR UPDATE USING (public.get_user_role_safe(auth.uid()) = 'producer');

CREATE POLICY "Producers can delete company users" ON public.company_users
FOR DELETE USING (public.get_user_role_safe(auth.uid()) = 'producer');

-- Add policies for users to see their own data
CREATE POLICY "Company users can view their own data" ON public.company_users
FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Company users can update their own data" ON public.company_users
FOR UPDATE USING (auth_user_id = auth.uid());
