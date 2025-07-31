
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

interface LessonNavigationProps {
  courseId: string;
  prevLesson?: { id: string; title: string };
  nextLesson?: { id: string; title: string };
  nextLessonBlocked?: boolean;
  nextLessonBlockedReason?: string;
  nextLessonBlockedAction?: React.ReactNode;
  currentLessonId: string;
  quizzesByLesson?: Record<string, any[]>;
  allAttempts?: any[];
}

export const LessonNavigation = ({ courseId, prevLesson, nextLesson, nextLessonBlocked, nextLessonBlockedReason, nextLessonBlockedAction, currentLessonId, quizzesByLesson, allAttempts }: LessonNavigationProps) => {
  const navigate = useNavigate();

  // Log para debug
  console.log('[LessonNavigation] Props received:', {
    courseId,
    prevLesson,
    nextLesson,
    nextLessonBlocked,
    currentLessonId,
    hasQuizzes: !!quizzesByLesson,
    hasAttempts: !!allAttempts
  });

  const handlePrevClick = () => {
    console.log('Previous lesson clicked:', prevLesson?.id);
    if (prevLesson) {
      navigate(`/student/courses/${courseId}/lessons/${prevLesson.id}`);
    }
  };

  const handleNextClick = () => {
    console.log('Next lesson clicked:', nextLesson?.id);
    // Se houver quiz relacionado à aula atual e não aprovado, navegar para o quiz
    if (quizzesByLesson && allAttempts) {
      const quizzes = quizzesByLesson[currentLessonId] || [];
      for (const quiz of quizzes) {
        const attempt = allAttempts.find((a: any) => a.quiz_id === quiz.id);
        if (!attempt || !attempt.passed) {
          navigate(`/student/courses/${courseId}/quizzes/${quiz.id}?lessonId=${currentLessonId}`);
          return;
        }
      }
    }
    // Caso contrário, navega para a próxima aula normalmente
    if (nextLesson && !nextLessonBlocked) {
      navigate(`/student/courses/${courseId}/lessons/${nextLesson.id}`);
    }
  };

  return (
    <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 lg:pt-6 bg-slate-900/20 text-white rounded-t-lg border-b border-slate-700/50">
        <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold">Navegação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
        {console.log('[LessonNavigation] Rendering buttons:', { hasPrevLesson: !!prevLesson, hasNextLesson: !!nextLesson })}
        
        {prevLesson && (
          <Button 
            variant="outline" 
            className="w-full justify-start text-xs sm:text-sm h-10 sm:h-12 lg:h-14 touch-manipulation font-medium border-2 border-slate-600 hover:bg-slate-800/50 hover:border-slate-500 text-slate-300 bg-transparent"
            onClick={handlePrevClick}
          >
            <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Aula Anterior</span>
          </Button>
        )}
        
        {nextLesson && (
          <div className="relative w-full flex flex-col items-center gap-2">
            <Button 
              className="w-full justify-start text-xs sm:text-sm h-10 sm:h-12 lg:h-14 touch-manipulation font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg disabled:bg-slate-700/50 disabled:text-slate-500"
              onClick={handleNextClick}
              disabled={!!nextLessonBlocked}
              title={nextLessonBlocked ? (nextLessonBlockedReason || 'Você não pode avançar para a próxima aula ainda.') : undefined}
            >
              <span className="truncate">Próxima Aula</span>
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180 flex-shrink-0" />
            </Button>
            {nextLessonBlocked && nextLessonBlockedReason && (
              <div className="w-full animate-fade-in mt-2 flex flex-col items-center gap-2">
                {nextLessonBlockedAction && (
                  <div className="flex justify-center">{nextLessonBlockedAction}</div>
                )}
                <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-md px-2 sm:px-3 py-2 text-amber-300 text-xs sm:text-sm w-full justify-center">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-amber-400" />
                  <span className="text-center">Complete o quiz com pelo menos 75% de acerto para avançar.</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!prevLesson && !nextLesson && (
          <div className="text-center text-slate-400 text-xs sm:text-sm py-3 sm:py-4">
            Nenhuma navegação disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
};
