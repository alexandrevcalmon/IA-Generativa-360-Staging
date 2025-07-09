
-- Complete fix for infinite recursion in profiles table RLS policies
-- This migration will completely clean up all policies and create safe ones

-- First, disable RLS temporarily to clean up
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles table to start fresh
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies for profiles table
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        -- Drop each policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create completely safe, non-recursive policies
-- These policies only use auth.uid() directly, no subqueries to profiles table

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Allow users to create their own profile
CREATE POLICY "Users can create own profile" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Create a simple function that checks producer status without recursion
CREATE OR REPLACE FUNCTION public.is_current_user_producer()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    -- Check if current user has producer role without RLS interference
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'producer'
    );
$$;

-- Update courses table policies to be completely safe
DROP POLICY IF EXISTS "Producers can manage their own courses" ON public.courses;
CREATE POLICY "Producers can manage courses" ON public.courses
FOR ALL USING (instructor_id = auth.uid());

-- Create policy for published courses access
DROP POLICY IF EXISTS "Users can view published courses" ON public.courses;
CREATE POLICY "Users can view published courses" ON public.courses
FOR SELECT USING (is_published = true);

-- Ensure company_users policies are simple and safe  
DROP POLICY IF EXISTS "Producers can view all company users" ON public.company_users;
DROP POLICY IF EXISTS "Users can view own company data" ON public.company_users;

-- Create safe company_users policies
CREATE POLICY "Users can view own company data" ON public.company_users
FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own company data" ON public.company_users
FOR UPDATE USING (auth_user_id = auth.uid());
