import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash2, Eye, MoreVertical, Users, Clock, BookOpen } from "lucide-react";
import { Course } from "@/hooks/useCourses";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onView: (courseId: string) => void;
}

export const CourseCard = ({ course, onEdit, onDelete, onView }: CourseCardProps) => {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return 'Não definido';
    }
  };

  const handleManageContent = () => {
    navigate(`/producer/courses/${course.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      {course.thumbnail_url && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={course.thumbnail_url} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">{course.title}</CardTitle>
            {course.category && (
              <CardDescription className="mt-1">{course.category}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleManageContent}>
                <BookOpen className="mr-2 h-4 w-4" />
                Gerenciar Conteúdo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView(course.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(course)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(course.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="secondary" 
            className={getDifficultyColor(course.difficulty_level)}
          >
            {getDifficultyLabel(course.difficulty_level)}
          </Badge>
          
          {course.is_published ? (
            <Badge variant="default" className="bg-green-600">Publicado</Badge>
          ) : (
            <Badge variant="outline">Rascunho</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {course.estimated_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{course.estimated_hours}h</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>0 alunos</span>
          </div>
        </div>

        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleManageContent}
            className="flex-1 bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Gerenciar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(course)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
