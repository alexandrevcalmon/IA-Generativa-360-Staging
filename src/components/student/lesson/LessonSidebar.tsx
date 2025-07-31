
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
    <div className="space-y-3 sm:space-y-4 w-full">
      {/* Progress Card */}
      <Card className="w-full border-slate-700/50 bg-slate-900/20 shadow-lg">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6 bg-slate-900/20 text-white rounded-t-lg border-b border-slate-700/50">
          <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold">Progresso</CardTitle>
        </CardHeader>
        <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
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
