
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLessonInCourse } from '@/hooks/useLessonInCourse';
import { LessonViewLoading } from './LessonViewLoading';
import { LessonViewError } from './LessonViewError';
import { LessonViewContent } from './LessonViewContent';

export const LessonViewLayout = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    lesson: currentLesson, 
    module: currentModule, 
    course, 
    prevLesson, 
    nextLesson, 
    isLoading,
    error 
  } = useLessonInCourse(courseId!, lessonId!);

  useEffect(() => {
    if (!courseId || !lessonId) {
      navigate('/student/courses');
    }
  }, [courseId, lessonId, navigate]);

  if (isLoading) {
    return <LessonViewLoading />;
  }

  if (error) {
    return <LessonViewError error={error} course={course} />;
  }

  if (!course || !currentLesson) {
    return (
      <LessonViewError 
        error={new Error(!course ? 'Curso não encontrado' : 'Lição não encontrada')} 
        course={course}
      />
    );
  }

  // Get user's company_id from company_users table or provide fallback
  const companyId = user?.user_metadata?.company_id || '';

  return (
    <LessonViewContent
      currentLesson={currentLesson}
      course={course}
      courseId={courseId!}
      currentModule={currentModule}
      prevLesson={prevLesson ? { id: prevLesson.id, title: prevLesson.title } : undefined}
      nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : undefined}
      companyId={companyId}
    />
  );
};
