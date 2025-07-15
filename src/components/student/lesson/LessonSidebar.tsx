
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LessonProgress } from '@/components/student/LessonProgress';
import { LessonNavigation } from '@/components/student/LessonNavigation';
import { StudentLesson } from '@/hooks/useStudentCourses';

interface LessonSidebarProps {
  currentLesson: StudentLesson;
  courseId: string;
  watchTime: number;
  duration: number;
  prevLesson?: { id: string; title: string };
  nextLesson?: { id: string; title: string };
  nextLessonBlocked?: boolean;
  nextLessonBlockedReason?: string;
  nextLessonBlockedAction?: React.ReactNode;
  quizzesByLesson?: Record<string, any[]>;
  allAttempts?: any[];
}

export const LessonSidebar = ({ 
  currentLesson, 
  courseId, 
  watchTime, 
  duration, 
  prevLesson, 
  nextLesson,
  nextLessonBlocked,
  nextLessonBlockedReason,
  nextLessonBlockedAction,
  quizzesByLesson,
  allAttempts
}: LessonSidebarProps) => {
  return (
    <div className="space-y-4 w-full">
      {/* Progress Card */}
      <Card className="w-full border-gray-200 bg-white shadow-lg">
        <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6 bg-white text-gray-900 rounded-t-lg border-b border-gray-200">
          <CardTitle className="text-base sm:text-lg font-semibold">Progresso</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 px-4 sm:px-6 pb-4 sm:pb-6">
          <LessonProgress 
            currentLesson={currentLesson}
            watchTime={watchTime}
            duration={duration}
          />
        </CardContent>
      </Card>

      {/* Navigation Card */}
      <div className="w-full">
        <LessonNavigation
          courseId={courseId}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          nextLessonBlocked={nextLessonBlocked}
          nextLessonBlockedReason={nextLessonBlockedReason}
          nextLessonBlockedAction={nextLessonBlockedAction}
          currentLessonId={currentLesson.id}
          quizzesByLesson={quizzesByLesson}
          allAttempts={allAttempts}
        />
      </div>
    </div>
  );
};
