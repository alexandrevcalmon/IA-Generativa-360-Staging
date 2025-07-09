
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {lesson ? "Editar Aula" : "Criar Nova Aula"}
          </DialogTitle>
          <DialogDescription>
            {lesson 
              ? "Edite as informações da aula abaixo." 
              : "Preencha as informações para criar uma nova aula."
            }
          </DialogDescription>
        </DialogHeader>

        <LessonForm moduleId={moduleId} lesson={lesson} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
