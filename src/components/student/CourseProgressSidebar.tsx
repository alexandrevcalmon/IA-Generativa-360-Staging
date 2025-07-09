
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StudentCourse } from '@/hooks/useStudentCourses';

interface CourseProgressSidebarProps {
  course: StudentCourse;
  allLessons: Array<{ completed: boolean }>;
}

export const CourseProgressSidebar = ({ course, allLessons }: CourseProgressSidebarProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Progresso do Curso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Aulas concluídas</span>
            <span>
              {allLessons.filter(l => l.completed).length}/{allLessons.length}
            </span>
          </div>
          <Progress 
            value={course?.progress_percentage || 0} 
            className="h-2" 
          />
          <p className="text-sm text-gray-600">
            {Math.round(course?.progress_percentage || 0)}% do curso concluído
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
