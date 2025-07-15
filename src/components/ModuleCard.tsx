
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash2, Plus, MoreVertical, Play, BookOpen, Eye, EyeOff } from "lucide-react";
import { CourseModule, useDeleteModule } from "@/hooks/useCourseModules";
import { Lesson } from "@/hooks/useLessons";
import { CreateLessonDialog } from "@/components/CreateLessonDialog";
import { DraggableLessonsList } from "@/components/DraggableLessonsList";
import { GenerateQuizDialog } from '@/components/producer/GenerateQuizDialog';
import { useCreateQuiz } from '@/hooks/useQuizzes';

interface ModuleCardProps {
  module: CourseModule;
  index: number;
  onEdit: (module: CourseModule) => void;
}

export const ModuleCard = ({ module, index, onEdit }: ModuleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  
  const deleteModule = useDeleteModule();
  const createQuizMutation = useCreateQuiz();

  const handleDeleteModule = async () => {
    if (window.confirm("Tem certeza que deseja excluir este módulo?")) {
      await deleteModule.mutateAsync({ moduleId: module.id, courseId: module.course_id });
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setCreateLessonDialogOpen(true);
  };

  const handleCreateLesson = () => {
    setCreateLessonDialogOpen(true);
  };

  const handleQuizApproved = (questions: any[]) => {
    createQuizMutation.mutate({
      moduleId: module.id,
      title: `Quiz do módulo: ${module.title}`,
      description: module.description?.slice(0, 100) || '',
      questions,
    });
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold">
                    {index + 1}. {module.title}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setQuizDialogOpen(true)}
                    className="ml-2"
                  >
                    Gerar Quiz com IA
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 w-8 p-0 ml-2"
                    title={isExpanded ? "Ocultar aulas" : "Mostrar aulas"}
                  >
                    {isExpanded ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {module.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {module.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={module.is_published ? "default" : "outline"}>
                {module.is_published ? "Publicado" : "Rascunho"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCreateLesson}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Aula
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(module)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDeleteModule}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              <span>{module.lessons?.length || 0} aulas</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Módulo {index + 1}</span>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4">
              {!module.lessons || module.lessons.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                  <Play className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Nenhuma aula neste módulo
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCreateLesson}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Aula
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      💡 Arraste para reordenar
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCreateLesson}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Nova Aula
                    </Button>
                  </div>
                  <DraggableLessonsList
                    module={module}
                    onEditLesson={handleEditLesson}
                    onCreateLesson={handleCreateLesson}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateLessonDialog 
        isOpen={createLessonDialogOpen} 
        onClose={() => {
          setCreateLessonDialogOpen(false);
          setEditingLesson(null);
        }}
        moduleId={module.id}
        lesson={editingLesson}
      />
      <GenerateQuizDialog
        open={quizDialogOpen}
        onOpenChange={setQuizDialogOpen}
        content={`${module.title}\n${module.description || ''}`}
        moduleId={module.id}
        onQuizApproved={handleQuizApproved}
      />
    </>
  );
};
