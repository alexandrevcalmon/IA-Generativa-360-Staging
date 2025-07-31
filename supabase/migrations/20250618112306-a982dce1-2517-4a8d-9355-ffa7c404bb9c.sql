
-- Fix RLS policies and add automatic initialization for gamification

-- 1. Clean up existing RLS policies for student_points
DROP POLICY IF EXISTS "Users can view their own points" ON public.student_points;
DROP POLICY IF EXISTS "Users can create their own points" ON public.student_points;
DROP POLICY IF EXISTS "Users can update their own points" ON public.student_points;

-- Create new RLS policies for student_points
CREATE POLICY "Users can view their own student points" ON public.student_points
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.auth_user_id = auth.uid() AND cu.id = student_id
  )
);

CREATE POLICY "Users can create their own student points" ON public.student_points
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.auth_user_id = auth.uid() AND cu.id = student_id
  )
);

CREATE POLICY "Users can update their own student points" ON public.student_points
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.auth_user_id = auth.uid() AND cu.id = student_id
  )
);

-- 2. Clean up existing RLS policies for points_history
DROP POLICY IF EXISTS "Users can view their own points history" ON public.points_history;
DROP POLICY IF EXISTS "Users can create their own points history" ON public.points_history;

-- Create new RLS policies for points_history
CREATE POLICY "Users can view their own points history" ON public.points_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.auth_user_id = auth.uid() AND cu.id = student_id
  )
);

CREATE POLICY "Users can create their own points history" ON public.points_history
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.auth_user_id = auth.uid() AND cu.id = student_id
  )
);

-- 3. Clean up existing RLS policies for student_achievements
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.student_achievements;
DROP POLICY IF EXISTS "Users can create their own achievements" ON public.student_achievements;

-- Create new RLS policies for student_achievements
CREATE POLICY "Users can view their own achievements" ON public.student_achievements
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.auth_user_id = auth.uid() AND cu.id = student_id
  )
);

CREATE POLICY "Users can create their own achievements" ON public.student_achievements
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.auth_user_id = auth.uid() AND cu.id = student_id
  )
);

-- 4. Function to initialize student gamification data
CREATE OR REPLACE FUNCTION public.initialize_student_gamification(user_auth_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    student_record_id UUID;
BEGIN
    -- Get the student ID from company_users
    SELECT id INTO student_record_id 
    FROM public.company_users 
    WHERE auth_user_id = user_auth_id;
    
    IF student_record_id IS NULL THEN
        RAISE EXCEPTION 'Student not found for auth user %', user_auth_id;
    END IF;
    
    -- Create student_points record if it doesn't exist
    INSERT INTO public.student_points (
        student_id,
        points,
        total_points,
        level,
        streak_days,
        last_activity_date
    )
    VALUES (
        student_record_id,
        0,
        0,
        1,
        0,
        CURRENT_DATE
    )
    ON CONFLICT (student_id) DO NOTHING;
    
    RAISE LOG 'Initialized gamification data for student %', student_record_id;
END;
$$;

-- 5. Trigger to auto-initialize gamification data when a company user is created
CREATE OR REPLACE FUNCTION public.handle_new_company_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Initialize gamification data for the new company user
    PERFORM public.initialize_student_gamification(NEW.auth_user_id);
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to initialize gamification data for user %: %', NEW.auth_user_id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_company_user_created ON public.company_users;
CREATE TRIGGER on_company_user_created
    AFTER INSERT ON public.company_users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_company_user();

-- 6. Initialize missing gamification data for existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT cu.id, cu.auth_user_id 
        FROM public.company_users cu
        LEFT JOIN public.student_points sp ON cu.id = sp.student_id
        WHERE sp.student_id IS NULL
    LOOP
        INSERT INTO public.student_points (
            student_id,
            points,
            total_points,
            level,
            streak_days,
            last_activity_date
        )
        VALUES (
            user_record.id,
            0,
            0,
            1,
            0,
            CURRENT_DATE
        );
        
        RAISE LOG 'Initialized missing gamification data for student %', user_record.id;
    END LOOP;
END;
$$;
