
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lesson } from "@/hooks/useLessons";
import { LessonForm } from "./lesson/LessonForm";

interface CreateLessonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  lesson?: Lesson | null;
}

export const CreateLessonDialog = ({ isOpen, onClose, moduleId, lesson }: CreateLessonDialogProps) => {
  console.log('🎭🎭🎭 CreateLessonDialog renderizado 🎭🎭🎭');
  console.log('isOpen:', isOpen);
  console.log('moduleId:', moduleId);
  console.log('lesson:', lesson);
  console.log('lesson?.id:', lesson?.id);
  console.log('lesson?.title:', lesson?.title);
  console.log('lesson?.duration_minutes:', lesson?.duration_minutes);
  console.log('lesson?.bunny_video_id:', lesson?.bunny_video_id);
  console.log('lesson?.module_id:', lesson?.module_id);
  console.log('🎭🎭🎭 FIM CreateLessonDialog 🎭🎭🎭');

  if (!moduleId) {
    console.error('❌ ERRO: moduleId é vazio ou undefined');
    // Fechar o dialog automaticamente se não houver moduleId
    onClose();
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark-theme-override bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {lesson ? "Editar Aula" : "Criar Nova Aula"}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {lesson 
              ? "Edite as informações da aula abaixo." 
              : "Preencha as informações para criar uma nova aula."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="dark-theme-override">
          <LessonForm moduleId={moduleId} lesson={lesson} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
