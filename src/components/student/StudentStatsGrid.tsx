
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Award, Clock, Star } from 'lucide-react';

interface StudentStatsGridProps {
  coursesInProgress: number;
  completedCourses: number;
  hoursStudied: number;
  totalPoints: number;
}

export const StudentStatsGrid = ({ 
  coursesInProgress, 
  completedCourses, 
  hoursStudied, 
  totalPoints 
}: StudentStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cursos em Andamento</p>
              <p className="text-2xl font-bold text-gray-900">{coursesInProgress}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cursos Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">{completedCourses}</p>
            </div>
            <Award className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Horas Estudadas</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(hoursStudied)}h</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Pontos</p>
              <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
