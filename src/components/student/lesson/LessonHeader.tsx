
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { StudentLesson, StudentCourse } from '@/hooks/useStudentCourses';

interface LessonHeaderProps {
  currentLesson: StudentLesson;
  course: StudentCourse;
  courseId: string;
  currentModule?: { title: string } | null;
}

export const LessonHeader = ({ currentLesson, course, courseId, currentModule }: LessonHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white text-gray-900 border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <SidebarTrigger className="flex-shrink-0 h-10 w-10 text-gray-600 hover:bg-gray-100" />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/student/courses/${courseId}`)}
              className="flex-shrink-0 h-10 w-10 p-0 text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold truncate leading-tight text-gray-900">
                {currentLesson.title}
              </h1>
              <p className="text-sm text-gray-600 truncate mt-0.5">
                {course.title}
              </p>
            </div>
          </div>
          {currentLesson.completed && (
            <Badge className="bg-green-100 text-green-800 flex-shrink-0 text-xs px-2 py-1 h-7 border border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Concluída</span>
              <span className="sm:hidden">OK</span>
            </Badge>
          )}
        </div>
        {/* Module info on separate line for mobile when present */}
        {currentModule && (
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-500 truncate">
              Módulo: {currentModule.title}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white text-gray-900 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/student/courses/${courseId}`)}
                className="h-10 text-gray-600 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Curso
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
                <div className="flex items-center gap-2 text-base text-gray-600 mt-1">
                  <span>{course.title}</span>
                  {currentModule && (
                    <>
                      <span>•</span>
                      <span>{currentModule.title}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {currentLesson.completed && (
                <Badge className="bg-green-100 text-green-800 h-8 border border-green-200">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Concluída
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
