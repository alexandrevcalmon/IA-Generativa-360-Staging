
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { StudentLesson, StudentCourse } from '@/hooks/useStudentCourses';

interface StudentLessonHeaderProps {
  currentLesson: StudentLesson;
  course: StudentCourse;
  courseId: string;
}

export const StudentLessonHeader = ({ currentLesson, course, courseId }: StudentLessonHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(`/student/courses/${courseId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Curso
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
            <p className="text-gray-600">{course.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {currentLesson.completed && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              Concluída
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
