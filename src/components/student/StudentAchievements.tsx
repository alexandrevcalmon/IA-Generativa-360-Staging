
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, BookOpen, CheckCircle, Star } from 'lucide-react';

interface StudentAchievementsProps {
  coursesInProgress: number;
  completedCourses: number;
  totalPoints: number;
}

export const StudentAchievements = ({ 
  coursesInProgress, 
  completedCourses, 
  totalPoints 
}: StudentAchievementsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Conquistas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-yellow-50 rounded-lg text-center">
            <Trophy className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-xs font-medium">Primeira Semana</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-medium">{coursesInProgress} Cursos</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-xs font-medium">{completedCourses} Concluídos</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <Star className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <p className="text-xs font-medium">{totalPoints} Pontos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
