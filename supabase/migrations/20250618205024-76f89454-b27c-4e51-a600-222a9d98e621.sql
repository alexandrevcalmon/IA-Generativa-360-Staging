
-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.lesson_progress 
DROP CONSTRAINT IF EXISTS lesson_progress_user_id_fkey;

-- Step 2: Add new foreign key constraint to reference auth.users
ALTER TABLE public.lesson_progress 
ADD CONSTRAINT lesson_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Update RLS policies to work with auth.users
DROP POLICY IF EXISTS "Users can view lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can create lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update lesson progress" ON public.lesson_progress;

-- Create new RLS policies that reference auth.uid() directly
CREATE POLICY "Users can view their own lesson progress" ON public.lesson_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lesson progress" ON public.lesson_progress
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" ON public.lesson_progress
FOR UPDATE USING (auth.uid() = user_id);

-- Step 4: Do the same for enrollments table to maintain consistency
ALTER TABLE public.enrollments 
DROP CONSTRAINT IF EXISTS enrollments_user_id_fkey;

ALTER TABLE public.enrollments 
ADD CONSTRAINT enrollments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update enrollments RLS policies
DROP POLICY IF EXISTS "Users can view enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update enrollments" ON public.enrollments;

CREATE POLICY "Users can view their own enrollments" ON public.enrollments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" ON public.enrollments
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" ON public.enrollments
FOR UPDATE USING (auth.uid() = user_id);
