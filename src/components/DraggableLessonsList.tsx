import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical, Plus } from "lucide-react";
import { CourseModule } from "@/hooks/useCourseModules";
import { useDeleteLesson, useUpdateLessonOrder, useLesson } from "@/hooks/useLessons";
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
import { useLessonQuizzes, useDeleteQuiz } from '@/hooks/useQuizzes';
import { GenerateQuizDialog } from '@/components/producer/GenerateQuizDialog';

interface SortableLessonItemProps {
  lesson: any;
  index: number;
  onEdit: (lesson: any) => void;
  onDelete: (id: string) => void;
}

const SortableLessonItem = ({ lesson, index, onEdit, onDelete }: SortableLessonItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg z-50' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          
          {/* Order Number */}
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
            {index + 1}
          </div>
          
          {/* Lesson Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-medium text-sm">{lesson.title}</h5>
              {lesson.is_free && (
                <Badge variant="secondary" className="text-xs">Gratuita</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {lesson.duration_minutes && (
                <span>{formatDuration(lesson.duration_minutes)}</span>
              )}
              {lesson.video_url && <span>Vídeo</span>}
              {lesson.material_url && <span>Material</span>}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(lesson)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Editar aula"
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Excluir aula"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Aula</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a aula "{lesson.title}"? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(lesson.id)}
                    className="bg-red-600 hover:bg-red-700"
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

interface DraggableLessonsListProps {
  module: CourseModule;
  onEditLesson: (lesson: any) => void;
  onCreateLesson: (moduleId: string) => void;
}

export const DraggableLessonsList = ({ module, onEditLesson, onCreateLesson }: DraggableLessonsListProps) => {
  const [lessons, setLessons] = useState(module.lessons || []);
  const deleteLesson = useDeleteLesson();
  const updateLessonOrder = useUpdateLessonOrder();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sincronizar estado local com as props quando os dados mudam
  useEffect(() => {
    setLessons(module.lessons || []);
  }, [module.lessons]);

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await deleteLesson.mutateAsync({ lessonId, moduleId: module.id });
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
      const newIndex = lessons.findIndex((lesson) => lesson.id === over?.id);

      const newLessons = arrayMove(lessons, oldIndex, newIndex);
      
      // Update local state immediately for better UX
      setLessons(newLessons);

      // Update order_index for each lesson
      const updatedLessons = newLessons.map((lesson, index) => ({
        id: lesson.id,
        order_index: index
      }));

      try {
        await updateLessonOrder.mutateAsync({
          moduleId: module.id,
          lessons: updatedLessons
        });
      } catch (error) {
        console.error('Error updating lesson order:', error);
        // Revert local state on error
        setLessons(module.lessons || []);
      }
    }
  };

  if (!lessons || lessons.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Nenhuma aula neste módulo</p>
          <Button
            variant="outline"
            onClick={() => onCreateLesson(module.id)}
            className="text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeira Aula
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={lessons.map(lesson => lesson.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <div key={lesson.id}>
                <SortableLessonItem
                  lesson={lesson}
                  index={index}
                  onEdit={onEditLesson}
                  onDelete={handleDeleteLesson}
                />
                {/* Expansão de quizzes da aula */}
                <LessonQuizzesList lessonId={lesson.id} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}; 

// Mock visual do componente de quizzes por aula
function LessonQuizzesList({ lessonId }: { lessonId: string }) {
  const { data: quizzes, isLoading, error } = useLessonQuizzes(lessonId);
  const { data: lesson } = useLesson(lessonId);
  const deleteQuiz = useDeleteQuiz();
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [quizTitleToDelete, setQuizTitleToDelete] = useState<string | null>(null);
  const [createQuizOpen, setCreateQuizOpen] = useState(false);
  const [editQuiz, setEditQuiz] = useState<any | null>(null);

  // Conteúdo para IA: título + conteúdo/descrição da aula
  const quizContent = lesson ? `${lesson.title}\n${lesson.content || ''}` : '';

  return (
    <div style={{ marginLeft: 32, marginTop: 12, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontWeight: 500, fontSize: 14 }}>Quizzes desta aula:</span>
        <button
          style={{ fontSize: 12, padding: '4px 12px', border: '1px solid #ccc', borderRadius: 6, background: '#f9f9f9', cursor: 'pointer' }}
          onClick={() => setCreateQuizOpen(true)}
        >
          + Adicionar Quiz
        </button>
      </div>
      {/* Modal de criação de quiz */}
      <GenerateQuizDialog
        open={createQuizOpen}
        onOpenChange={setCreateQuizOpen}
        content={quizContent}
        lessonId={lessonId}
        onQuizApproved={() => setCreateQuizOpen(false)}
      />
      {/* Modal de edição de quiz */}
      {editQuiz && (
        <GenerateQuizDialog
          open={!!editQuiz}
          onOpenChange={() => setEditQuiz(null)}
          content={quizContent}
          lessonId={lessonId}
          quiz={editQuiz}
          onQuizApproved={() => setEditQuiz(null)}
        />
      )}
      {isLoading && <span style={{ fontSize: 13, color: '#888' }}>Carregando quizzes...</span>}
      {error && <span style={{ fontSize: 13, color: 'red' }}>Erro ao carregar quizzes</span>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {quizzes && quizzes.length === 0 && !isLoading && (
          <span style={{ fontSize: 13, color: '#888' }}>Nenhum quiz cadastrado para esta aula.</span>
        )}
        {quizzes && quizzes.map((quiz) => (
          <Card key={quiz.id} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <CardContent className="py-3 px-4 flex items-center gap-4">
              <span style={{ fontWeight: 500, fontSize: 13 }}>{quiz.title}</span>
              <span style={{ fontSize: 12, color: quiz.status === 'Aprovado' ? 'green' : 'orange', fontWeight: 500 }}>{quiz.status || 'Rascunho'}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button style={{ fontSize: 12, padding: '2px 10px', border: '1px solid #b6e0fe', borderRadius: 4, background: '#e6f7ff', cursor: 'pointer' }} onClick={() => setEditQuiz(quiz)}>Editar</button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button style={{ fontSize: 12, padding: '2px 10px', border: '1px solid #ffc1c1', borderRadius: 4, background: '#fff1f0', color: '#d32f2f', cursor: 'pointer' }} onClick={() => { setQuizToDelete(quiz.id); setQuizTitleToDelete(quiz.title); }}>Excluir</button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Quiz</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o quiz "{quizTitleToDelete}"? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setQuizToDelete(null)}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        if (quizToDelete) {
                          console.log('[UI] Confirmando exclusão do quiz:', quizToDelete);
                          deleteQuiz.mutate(quizToDelete);
                        }
                        setQuizToDelete(null);
                        setQuizTitleToDelete(null);
                      }} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 