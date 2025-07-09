
-- Fix RLS policies for company_users table to allow producers to manage collaborators
-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Producers can insert company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can update company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can view all company users" ON public.company_users;
DROP POLICY IF EXISTS "Producers can delete company users" ON public.company_users;
DROP POLICY IF EXISTS "Company users can view their own data" ON public.company_users;
DROP POLICY IF EXISTS "Company users can update their own data" ON public.company_users;

-- Create comprehensive RLS policies for company_users
-- Allow producers to have full access to manage company users
CREATE POLICY "Producers can manage all company users" 
  ON public.company_users 
  FOR ALL 
  USING (public.is_producer(auth.uid()))
  WITH CHECK (public.is_producer(auth.uid()));

-- Allow company users to view and update their own data
CREATE POLICY "Users can view their own company data" 
  ON public.company_users 
  FOR SELECT 
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own company data" 
  ON public.company_users 
  FOR UPDATE 
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Ensure the is_producer function is working correctly by testing it
-- This will help us verify the producer role is being detected properly
SELECT 
  auth.uid() as current_user_id,
  public.is_producer(auth.uid()) as is_producer_result,
  (SELECT role FROM public.profiles WHERE id = auth.uid()) as user_role
WHERE auth.uid() IS NOT NULL;
