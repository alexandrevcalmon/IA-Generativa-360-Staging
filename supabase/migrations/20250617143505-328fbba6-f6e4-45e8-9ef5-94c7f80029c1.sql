
-- Enable RLS on course_modules table (if not already enabled)
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_modules table
-- Policy to allow producers to view all course modules
CREATE POLICY "Producers can view all course modules" ON public.course_modules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);

-- Policy to allow producers to create course modules
CREATE POLICY "Producers can create course modules" ON public.course_modules
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);

-- Policy to allow producers to update course modules
CREATE POLICY "Producers can update course modules" ON public.course_modules
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);

-- Policy to allow producers to delete course modules
CREATE POLICY "Producers can delete course modules" ON public.course_modules
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);

-- Also add RLS policies for lessons table while we're at it
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policy to allow producers to view all lessons
CREATE POLICY "Producers can view all lessons" ON public.lessons
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);

-- Policy to allow producers to create lessons
CREATE POLICY "Producers can create lessons" ON public.lessons
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);

-- Policy to allow producers to update lessons
CREATE POLICY "Producers can update lessons" ON public.lessons
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);

-- Policy to allow producers to delete lessons
CREATE POLICY "Producers can delete lessons" ON public.lessons
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'producer'
  )
);
