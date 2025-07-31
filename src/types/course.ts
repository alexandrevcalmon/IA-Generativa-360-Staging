import { Database } from '@/integrations/supabase/types';

export type Course = Database['public']['Tables']['courses']['Row'];

export type CourseModule = Database['public']['Tables']['course_modules']['Row'];

export type Lesson = Database['public']['Tables']['lessons']['Row'];

export type LessonProgress = Database['public']['Tables']['lesson_progress']['Row'];

export type Enrollment = Database['public']['Tables']['enrollments']['Row'];

export type CourseWithModules = Course & {
  is_sequential: boolean;
  course_modules: (CourseModule & {
    lessons: Lesson[];
  })[];
};

export type LessonWithProgress = Lesson & {
  completed: boolean;
  bookmark: number;
  watch_time_seconds: number;
};

export type EnrollmentWithProgress = Enrollment & {
  progress: LessonProgress[];
};
