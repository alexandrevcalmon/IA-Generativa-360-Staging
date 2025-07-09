
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, TrendingUp } from "lucide-react";
import { Course } from "@/hooks/useCourses";
import { CourseModule } from "@/hooks/useCourseModules";

interface CourseInfoCardProps {
  course: Course;
  modules: CourseModule[];
}

export const CourseInfoCard = ({ course, modules }: CourseInfoCardProps) => {
  const totalLessons = modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription className="mt-1">
              {course.description || 'Sem descrição'}
            </CardDescription>
          </div>
          <Badge variant={course.is_published ? 'default' : 'outline'}>
            {course.is_published ? 'Publicado' : 'Rascunho'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{modules.length}</p>
              <p className="text-xs text-muted-foreground">Módulos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{totalLessons}</p>
              <p className="text-xs text-muted-foreground">Aulas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{course.estimated_hours || 0}h</p>
              <p className="text-xs text-muted-foreground">Duração</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">0</p>
              <p className="text-xs text-muted-foreground">Alunos</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
