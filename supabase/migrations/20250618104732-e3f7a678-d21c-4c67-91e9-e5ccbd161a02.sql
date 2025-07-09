
-- First, let's ensure RLS policies are working correctly for community features
-- Drop and recreate the community RLS policies with better error handling

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view topics" ON public.community_topics;
DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.community_topics;
DROP POLICY IF EXISTS "Authors can update their own topics" ON public.community_topics;
DROP POLICY IF EXISTS "Authors and producers can delete topics" ON public.community_topics;

DROP POLICY IF EXISTS "Users can view topic likes" ON public.community_topic_likes;
DROP POLICY IF EXISTS "Users can like topics" ON public.community_topic_likes;
DROP POLICY IF EXISTS "Users can remove their own topic likes" ON public.community_topic_likes;

DROP POLICY IF EXISTS "Authenticated users can view replies" ON public.community_replies;
DROP POLICY IF EXISTS "Authenticated users can create replies" ON public.community_replies;
DROP POLICY IF EXISTS "Authors can update their own replies" ON public.community_replies;
DROP POLICY IF EXISTS "Authors and producers can delete replies" ON public.community_replies;

-- Recreate policies for community_topics
CREATE POLICY "Anyone can view published topics" ON public.community_topics
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create topics" ON public.community_topics
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "Authors can update their own topics" ON public.community_topics
FOR UPDATE USING (auth.uid() = author_id OR public.is_producer(auth.uid()));

CREATE POLICY "Authors and producers can delete topics" ON public.community_topics
FOR DELETE USING (auth.uid() = author_id OR public.is_producer(auth.uid()));

-- Recreate policies for community_topic_likes
CREATE POLICY "Anyone can view topic likes" ON public.community_topic_likes
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like topics" ON public.community_topic_likes
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can remove their own topic likes" ON public.community_topic_likes
FOR DELETE USING (auth.uid() = user_id);

-- Recreate policies for community_replies
CREATE POLICY "Anyone can view replies" ON public.community_replies
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON public.community_replies
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

CREATE POLICY "Authors can update their own replies" ON public.community_replies
FOR UPDATE USING (auth.uid() = author_id OR public.is_producer(auth.uid()));

CREATE POLICY "Authors and producers can delete replies" ON public.community_replies
FOR DELETE USING (auth.uid() = author_id OR public.is_producer(auth.uid()));

-- Ensure RLS policies for lesson progress and enrollments work for students
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can update their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can create their own lesson progress" ON public.lesson_progress;

DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can create their own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON public.enrollments;

-- Enable RLS on tables if not already enabled
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies for lesson_progress
CREATE POLICY "Users can view their own lesson progress" ON public.lesson_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lesson progress" ON public.lesson_progress
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" ON public.lesson_progress
FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for enrollments
CREATE POLICY "Users can view their own enrollments" ON public.enrollments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" ON public.enrollments
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" ON public.enrollments
FOR UPDATE USING (auth.uid() = user_id);

-- Make sure courses, modules, and lessons are viewable by all authenticated users
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for courses/modules/lessons if any
DROP POLICY IF EXISTS "Published courses are viewable by all" ON public.courses;
DROP POLICY IF EXISTS "Published modules are viewable by all" ON public.course_modules;
DROP POLICY IF EXISTS "Lessons are viewable by all" ON public.lessons;

-- Create policies to allow viewing published content
CREATE POLICY "Published courses are viewable by all" ON public.courses
FOR SELECT USING (is_published = true);

CREATE POLICY "Published modules are viewable by all" ON public.course_modules
FOR SELECT USING (is_published = true);

CREATE POLICY "Lessons are viewable by all" ON public.lessons
FOR SELECT USING (true);

-- Add policies for producers to manage content
CREATE POLICY "Producers can manage courses" ON public.courses
FOR ALL USING (public.is_producer(auth.uid()));

CREATE POLICY "Producers can manage modules" ON public.course_modules
FOR ALL USING (public.is_producer(auth.uid()));

CREATE POLICY "Producers can manage lessons" ON public.lessons
FOR ALL USING (public.is_producer(auth.uid()));
