
-- Fix Database Records: Insert the missing producer record for admin-produtor@calmonacademy.com
-- First, let's check if the user exists and get their ID
DO $$
DECLARE
    producer_user_id uuid;
BEGIN
    -- Get the user ID for admin-produtor@calmonacademy.com
    SELECT id INTO producer_user_id 
    FROM auth.users 
    WHERE email = 'admin-produtor@calmonacademy.com';
    
    -- If user exists, ensure they have a producer profile
    IF producer_user_id IS NOT NULL THEN
        INSERT INTO public.profiles (id, role, created_at, updated_at)
        VALUES (producer_user_id, 'producer', now(), now())
        ON CONFLICT (id) DO UPDATE SET 
            role = 'producer',
            updated_at = now();
            
        RAISE NOTICE 'Producer profile created/updated for user: %', producer_user_id;
    ELSE
        RAISE NOTICE 'User admin-produtor@calmonacademy.com not found in auth.users';
    END IF;
END $$;

-- Create a function to ensure database consistency for all authenticated users
CREATE OR REPLACE FUNCTION public.ensure_user_profile_consistency()
RETURNS TABLE(user_id uuid, email text, action_taken text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH missing_profiles AS (
        INSERT INTO public.profiles (id, role, created_at, updated_at)
        SELECT 
            au.id,
            'student'::character varying,
            now(),
            now()
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
        ON CONFLICT (id) DO NOTHING
        RETURNING id
    )
    SELECT 
        au.id,
        au.email::text,  -- Cast to text to match expected return type
        CASE 
            WHEN mp.id IS NOT NULL THEN 'Created missing profile'::text
            ELSE 'Profile already exists'::text
        END as action_taken
    FROM auth.users au
    LEFT JOIN missing_profiles mp ON au.id = mp.id;
END;
$$;

-- Improve the existing is_producer function with better error handling
CREATE OR REPLACE FUNCTION public.is_producer(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id AND role = 'producer'
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return false as safe default
        RAISE WARNING 'Error checking producer role for user %: %', user_id, SQLERRM;
        RETURN false;
END;
$$;

-- Create a function to get user role safely
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS character varying
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
    user_role character varying;
BEGIN
    -- First check profiles table
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE id = user_id;
    
    IF user_role IS NOT NULL THEN
        RETURN user_role;
    END IF;
    
    -- If not found in profiles, check company_users
    IF EXISTS (SELECT 1 FROM public.company_users WHERE auth_user_id = user_id) THEN
        RETURN 'student';
    END IF;
    
    -- Default fallback
    RETURN 'student';
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error getting user role for %: %', user_id, SQLERRM;
        RETURN 'student';
END;
$$;

-- Run the consistency check
SELECT * FROM public.ensure_user_profile_consistency();
