
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useAuth } from '@/hooks/auth/useAuth';

interface CourseProgressSidebarProps {
  courseId: string;
}

export const CourseProgressSidebar = ({ courseId }: CourseProgressSidebarProps) => {
  const { user } = useAuth();
  const { data: progressData, isLoading } = useCourseProgress(courseId, user?.id);
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
              {progressData.completedLessons}/{progressData.totalLessons}
            </span>
          </div>
          <Progress 
            value={progressData.progressPercentage} 
            className="h-2" 
          />
          <p className="text-sm text-gray-600">
            {Math.round(progressData.progressPercentage)}% do curso concluído
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
