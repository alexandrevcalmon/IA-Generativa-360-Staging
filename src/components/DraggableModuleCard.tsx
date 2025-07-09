
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash2, Plus, MoreVertical, Play, BookOpen, Eye, EyeOff, GripVertical } from "lucide-react";
import { CourseModule, useDeleteModule } from "@/hooks/useCourseModules";
import { useLessons, Lesson, useUpdateLessonOrder } from "@/hooks/useLessons";
import { CreateLessonDialog } from "@/components/CreateLessonDialog";
import { DraggableLessonItem } from "@/components/DraggableLessonItem";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface DraggableModuleCardProps {
  module: CourseModule;
  index: number;
  onEdit: (module: CourseModule) => void;
}

export const DraggableModuleCard = ({ module, index, onEdit }: DraggableModuleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  const deleteModule = useDeleteModule();
  const { data: lessons = [], isLoading: lessonsLoading } = useLessons(module.id);
  const updateLessonOrder = useUpdateLessonOrder();

  const handleDeleteModule = async () => {
    if (window.confirm("Tem certeza que deseja excluir este módulo?")) {
      await deleteModule.mutateAsync({ moduleId: module.id, courseId: module.course_id });
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setCreateLessonDialogOpen(true);
  };

  const handleLessonDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const reorderedLessons = Array.from(lessons);
    const [removed] = reorderedLessons.splice(sourceIndex, 1);
    reorderedLessons.splice(destinationIndex, 0, removed);

    // Atualizar as ordens no banco
    const updates = reorderedLessons.map((lesson, index) => ({
      id: lesson.id,
      order_index: index,
    }));

    await updateLessonOrder.mutateAsync({ moduleId: module.id, lessons: updates });
  };

  return (
    <>
      <Draggable draggableId={module.id} index={index}>
        {(provided, snapshot) => (
          <Card 
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`hover:shadow-md transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    {...provided.dragHandleProps}
                    className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-semibold">
                        {index + 1}. {module.title}
                      </CardTitle>
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
                      <DropdownMenuItem onClick={() => setCreateLessonDialogOpen(true)}>
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
                  <span>{lessons.length} aulas</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Módulo {index + 1}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-2">
                  {lessonsLoading ? (
                    <div className="space-y-2">
                      {[1,2].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-200 h-12 rounded"></div>
                      ))}
                    </div>
                  ) : lessons.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                      <Play className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Nenhuma aula neste módulo
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCreateLessonDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeira Aula
                      </Button>
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleLessonDragEnd}>
                      <Droppable droppableId={`lessons-${module.id}`} type="lesson">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {lessons.map((lesson, lessonIndex) => (
                              <DraggableLessonItem
                                key={lesson.id}
                                lesson={lesson}
                                index={lessonIndex}
                                onEdit={handleEditLesson}
                              />
                            ))}
                            {provided.placeholder}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => setCreateLessonDialogOpen(true)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Nova Aula
                            </Button>
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </Draggable>

      <CreateLessonDialog 
        isOpen={createLessonDialogOpen} 
        onClose={() => {
          setCreateLessonDialogOpen(false);
          setEditingLesson(null);
        }}
        moduleId={module.id}
        lesson={editingLesson}
      />
    </>
  );
};
