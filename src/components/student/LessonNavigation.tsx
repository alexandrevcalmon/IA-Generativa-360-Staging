
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface LessonNavigationProps {
  courseId: string;
  prevLesson?: { id: string; title: string };
  nextLesson?: { id: string; title: string };
}

export const LessonNavigation = ({ courseId, prevLesson, nextLesson }: LessonNavigationProps) => {
  const navigate = useNavigate();

  const handlePrevClick = () => {
    console.log('Previous lesson clicked:', prevLesson?.id);
    if (prevLesson) {
      navigate(`/student/courses/${courseId}/lessons/${prevLesson.id}`);
    }
  };

  const handleNextClick = () => {
    console.log('Next lesson clicked:', nextLesson?.id);
    if (nextLesson) {
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
          <Button 
            className="w-full justify-start text-sm h-12 sm:h-14 touch-manipulation font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            onClick={handleNextClick}
          >
            <span className="truncate">Próxima Aula</span>
            <ArrowLeft className="h-4 w-4 ml-2 rotate-180 flex-shrink-0" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
