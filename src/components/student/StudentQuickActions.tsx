
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Trophy, Target } from 'lucide-react';

export const StudentQuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Acesso Rápido
        </CardTitle>
        <CardDescription>
          Navegue rapidamente pelas principais funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/student/courses">
          <Button className="w-full h-20 flex flex-col items-center gap-2" variant="outline">
            <BookOpen className="h-6 w-6" />
            <span>Meus Cursos</span>
          </Button>
        </Link>
        <Button className="w-full h-20 flex flex-col items-center gap-2" variant="outline" disabled>
          <Calendar className="h-6 w-6" />
          <span>Agenda</span>
        </Button>
        <Button className="w-full h-20 flex flex-col items-center gap-2" variant="outline" disabled>
          <Trophy className="h-6 w-6" />
          <span>Conquistas</span>
        </Button>
        <Button className="w-full h-20 flex flex-col items-center gap-2" variant="outline" disabled>
          <Target className="h-6 w-6" />
          <span>Metas</span>
        </Button>
      </CardContent>
    </Card>
  );
};
