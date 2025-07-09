
-- First, let's enable RLS on courses table if not already enabled
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for students to view published courses
-- Only create if they don't exist
DO $$ 
BEGIN
    -- Policy for students to view published courses (basic version)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'courses' 
        AND policyname = 'Students can view published courses'
    ) THEN
        CREATE POLICY "Students can view published courses" ON public.courses
        FOR SELECT USING (
          is_published = true AND
          EXISTS (
            SELECT 1 FROM public.company_users 
            WHERE auth_user_id = auth.uid() AND is_active = true
          )
        );
    END IF;

    -- Policy for company users (students) to view published courses (alternative version)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'courses' 
        AND policyname = 'Company users can view published courses'
    ) THEN
        CREATE POLICY "Company users can view published courses" ON public.courses
        FOR SELECT USING (
          is_published = true AND
          EXISTS (
            SELECT 1 FROM public.company_users 
            WHERE auth_user_id = auth.uid()
          )
        );
    END IF;

    -- Enable RLS on course_modules table and add policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'course_modules' 
        AND policyname = 'Students can view published course modules'
    ) THEN
        ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Students can view published course modules" ON public.course_modules
        FOR SELECT USING (
          is_published = true AND
          EXISTS (
            SELECT 1 FROM public.company_users 
            WHERE auth_user_id = auth.uid() AND is_active = true
          )
        );
    END IF;

    -- Enable RLS on lessons table and add policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lessons' 
        AND policyname = 'Students can view lessons from published modules'
    ) THEN
        ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Students can view lessons from published modules" ON public.lessons
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.course_modules cm
            WHERE cm.id = module_id 
            AND cm.is_published = true
          ) AND
          EXISTS (
            SELECT 1 FROM public.company_users 
            WHERE auth_user_id = auth.uid() AND is_active = true
          )
        );
    END IF;

END $$;
