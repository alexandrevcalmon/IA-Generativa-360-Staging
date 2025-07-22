
import { Clock, FileText, Edit, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/utils/timeUtils";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface LessonItemProps {
  lesson: {
    id: string;
    title: string;
    duration_minutes?: number;
    is_free: boolean;
    video_url?: string;
    video_file_url?: string;
    material_url?: string;
  };
  onEdit: (lesson: any) => void;
  onDelete: (id: string) => void;
}

export const LessonItem = ({ lesson, onEdit, onDelete }: LessonItemProps) => {
  const hasVideo = lesson.video_url || lesson.video_file_url;
  const hasMaterial = lesson.material_url;

  const handleDelete = () => {
    onDelete(lesson.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow bg-gray-800/50 border-gray-600">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-sm text-white">{lesson.title}</h4>
              {lesson.is_free && (
                <Badge variant="secondary" className="text-xs bg-green-900/20 text-green-400 border-green-800">
                  Gratuita
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {lesson.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(lesson.duration_minutes)}
                </div>
              )}
              
              {hasVideo && (
                <div className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Vídeo
                </div>
              )}
              
              {hasMaterial && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Material
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(lesson)}
              className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
              title="Editar aula"
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  title="Excluir aula"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 border-gray-600">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Excluir Aula</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    Tem certeza que deseja excluir a aula "{lesson.title}"? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
