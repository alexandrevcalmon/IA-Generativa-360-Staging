
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  category?: string;
  is_published: boolean;
}

interface ProducerCoursesSectionProps {
  courses: Course[];
  isLoading: boolean;
}

export const ProducerCoursesSection = ({ courses, isLoading }: ProducerCoursesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-calmon-600" />
            Meus Cursos
          </div>
          <Link to="/producer/courses">
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </Link>
        </CardTitle>
        <CardDescription>
          Gerencie e acompanhe o desempenho dos seus cursos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando cursos...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Você ainda não criou nenhum curso.</p>
            <Link to="/producer/courses">
              <Button className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Curso
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.slice(0, 3).map((course) => (
              <div key={course.id} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-20 h-12 bg-gradient-to-r from-calmon-500 to-calmon-700 rounded flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {course.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{course.category || 'Sem categoria'}</span>
                    <Badge 
                      variant={course.is_published ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {course.is_published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-calmon-600">
                    R$ 0,00
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Link to={`/producer/courses/${course.id}`}>
                      <Button size="sm" variant="outline">
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
