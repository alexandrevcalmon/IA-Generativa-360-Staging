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
import { Edit, Trash2, GripVertical, Plus, BookOpen } from "lucide-react";
import { CourseModule } from "@/hooks/useCourseModules";
import { useDeleteLesson, useUpdateLessonOrder } from "@/hooks/useLessons";
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
      className={`group hover:shadow-lg transition-shadow bg-gray-800/50 border-gray-600 ${
        isDragging ? 'shadow-xl z-50' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-300"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          
          {/* Order Number */}
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs font-medium text-gray-300">
            {index + 1}
          </div>
          
          {/* Lesson Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-medium text-sm text-white">{lesson.title}</h5>
              {lesson.is_free && (
                <Badge variant="secondary" className="text-xs bg-green-900/20 text-green-400 border-green-800">
                  Gratuita
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {lesson.duration_minutes && (
                <span>{formatDuration(lesson.duration_minutes)}</span>
              )}
              {lesson.video_url && <span>Vídeo</span>}
              {lesson.material_url && <span>Material</span>}
            </div>
          </div>
          
          {/* Actions */}
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
                    onClick={() => onDelete(lesson.id)}
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

interface DraggableLessonsListWithHeaderProps {
  module: CourseModule;
  onEditLesson: (lesson: any) => void;
  onCreateLesson: (moduleId: string) => void;
}

export const DraggableLessonsListWithHeader = ({ module, onEditLesson, onCreateLesson }: DraggableLessonsListWithHeaderProps) => {
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
      <Card className="bg-gray-800/50 border-gray-600">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400 mb-4">Nenhuma aula neste módulo</p>
          <Button
            variant="outline"
            onClick={() => onCreateLesson(module.id)}
            className="text-sm bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
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
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-base text-white flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          {module.title} ({lessons.length} aulas)
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreateLesson(module.id)}
          className="text-xs bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
        >
          <Plus className="h-3 w-3 mr-1" />
          Adicionar Aula
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={lessons.map(lesson => lesson.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <SortableLessonItem
                key={lesson.id}
                lesson={lesson}
                index={index}
                onEdit={onEditLesson}
                onDelete={handleDeleteLesson}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}; 
