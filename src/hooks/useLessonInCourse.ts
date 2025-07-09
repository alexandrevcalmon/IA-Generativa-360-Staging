
import { useMemo } from 'react';
import { useStudentCourse } from '@/hooks/useStudentCourses';

export const useLessonInCourse = (courseId: string, lessonId: string) => {
  const { data: course, isLoading: courseLoading, error: courseError } = useStudentCourse(courseId);

  const lessonData = useMemo(() => {
    if (!course || !lessonId) {
      return {
        lesson: null,
        module: null,
        allLessons: [],
        currentIndex: -1,
        prevLesson: null,
        nextLesson: null
      };
    }

    let foundLesson = null;
    let foundModule = null;
    let allLessons: any[] = [];
    let currentIndex = -1;

    // Build a flat list of all lessons and find the current one
    course.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        allLessons.push({
          ...lesson,
          moduleTitle: module.title,
          moduleId: module.id
        });
        
        if (lesson.id === lessonId) {
          foundLesson = lesson;
          foundModule = module;
          currentIndex = allLessons.length - 1;
        }
      });
    });

    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    return {
      lesson: foundLesson,
      module: foundModule,
      allLessons,
      currentIndex,
      prevLesson,
      nextLesson
    };
  }, [course, lessonId]);

  return {
    ...lessonData,
    course,
    isLoading: courseLoading,
    error: courseError
  };
};
