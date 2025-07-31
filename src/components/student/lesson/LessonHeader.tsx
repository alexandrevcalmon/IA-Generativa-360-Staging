
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
      <div className="lg:hidden bg-slate-900/50 text-white border-b border-slate-700/50">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <SidebarTrigger className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 text-slate-300 hover:bg-slate-800/50" />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/student/courses/${courseId}`)}
              className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 p-0 text-slate-300 hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base font-semibold truncate leading-tight text-white">
                {currentLesson.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 truncate mt-0.5">
                {course.title}
              </p>
            </div>
          </div>
          {currentLesson.completed && (
            <Badge className="bg-emerald-500/20 text-emerald-300 flex-shrink-0 text-xs px-2 py-1 h-6 sm:h-7 border border-emerald-500/30">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Concluída</span>
              <span className="sm:hidden">OK</span>
            </Badge>
          )}
        </div>
        {/* Module info on separate line for mobile when present */}
        {currentModule && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <p className="text-xs sm:text-sm text-slate-400 truncate">
              Módulo: {currentModule.title}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-slate-900/50 text-white border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/student/courses/${courseId}`)}
                className="h-10 text-slate-300 hover:bg-slate-800/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Curso
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">{currentLesson.title}</h1>
                <div className="flex items-center gap-2 text-base text-slate-300 mt-1">
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
                <Badge className="bg-emerald-500/20 text-emerald-300 h-8 border border-emerald-500/30">
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
