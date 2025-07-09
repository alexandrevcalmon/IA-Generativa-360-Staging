
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreVertical, Play, Clock, Gift } from "lucide-react";
import { Lesson, useDeleteLesson } from "@/hooks/useLessons";

interface LessonItemProps {
  lesson: Lesson;
  index: number;
  onEdit: (lesson: Lesson) => void;
}

export const LessonItem = ({ lesson, index, onEdit }: LessonItemProps) => {
  const deleteLesson = useDeleteLesson();

  const handleDeleteLesson = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta aula?")) {
      await deleteLesson.mutateAsync({ lessonId: lesson.id, moduleId: lesson.module_id });
    }
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
              {index + 1}
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-sm">{lesson.title}</h4>
              {lesson.content && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {lesson.content}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                {lesson.video_url && (
                  <Badge variant="outline" className="text-xs">
                    <Play className="w-3 h-3 mr-1" />
                    Vídeo
                  </Badge>
                )}
                
                {lesson.duration_minutes && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {lesson.duration_minutes}min
                  </Badge>
                )}
                
                {lesson.is_free && (
                  <Badge variant="secondary" className="text-xs">
                    <Gift className="w-3 h-3 mr-1" />
                    Gratuita
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(lesson)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDeleteLesson}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
