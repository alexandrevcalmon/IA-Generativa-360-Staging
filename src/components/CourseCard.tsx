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
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
    <Card className="hover:shadow-lg transition-shadow bg-gray-900/50 border-gray-700 shadow-xl">
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
            <CardTitle className="text-lg font-semibold line-clamp-2 text-white">{course.title}</CardTitle>
            {course.category && (
              <CardDescription className="mt-1 text-gray-300">{course.category}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-700">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={handleManageContent} className="text-gray-300 hover:text-white hover:bg-gray-700">
                <BookOpen className="mr-2 h-4 w-4" />
                Gerenciar Conteúdo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView(course.id)} className="text-gray-300 hover:text-white hover:bg-gray-700">
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(course)} className="text-gray-300 hover:text-white hover:bg-gray-700">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(course.id)}
                className="text-red-400 hover:text-red-300 hover:bg-gray-700"
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
          <p className="text-sm text-gray-300 line-clamp-2">
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
            <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">Publicado</Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-700 text-gray-300 border-gray-600">Rascunho</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {course.estimated_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300">{course.estimated_hours}h</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300">0 colaboradores</span>
          </div>
        </div>

        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
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
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg border-0"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Gerenciar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(course)}
            className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
