
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
    <Card className="border-gray-200 bg-white shadow-lg">
      <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6 bg-white text-gray-900 rounded-t-lg border-b border-gray-200">
        <CardTitle className="text-base sm:text-lg font-semibold">Navegação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4 px-4 sm:px-6 pb-4 sm:pb-6">
        {prevLesson && (
          <Button 
            variant="outline" 
            className="w-full justify-start text-sm h-12 sm:h-14 touch-manipulation font-medium border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700"
            onClick={handlePrevClick}
          >
            <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Aula Anterior</span>
          </Button>
        )}
        
        {nextLesson && (
          <div className="relative w-full flex flex-col items-center gap-2">
            <Button 
              className="w-full justify-start text-sm h-12 sm:h-14 touch-manipulation font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:bg-gray-300 disabled:text-gray-500"
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
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-amber-800 text-xs sm:text-sm w-full justify-center">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
                  <span>Complete o quiz com pelo menos 75% de acerto para avançar.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
