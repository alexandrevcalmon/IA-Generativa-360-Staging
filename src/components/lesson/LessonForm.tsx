
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useCreateLesson, useUpdateLesson, Lesson } from "@/hooks/useLessons";
import { LessonBasicFields } from "./LessonBasicFields";
import { LessonFileFields, LessonFileFieldsRef } from "./LessonFileFields";
import { LessonSettingsFields } from "./LessonSettingsFields";
import { LessonFormData } from "./types";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { GenerateQuizDialog } from '@/components/producer/GenerateQuizDialog';
import { useState } from 'react';
import { useCreateQuiz } from '@/hooks/useQuizzes';

const lessonSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().default(""),
  video_url: z.string().url().optional().or(z.literal("")),
  duration_minutes: z.number().min(0).default(0),
  is_free: z.boolean().default(false),
  image_url: z.string().default(""),
  video_file_url: z.string().default(""),
  material_url: z.string().default(""),
  // Campos do Bunny.net - mais permissivos
  bunny_video_id: z.string().optional().or(z.literal("")),
  bunny_library_id: z.any().optional(),
  bunny_video_status: z.any().optional(),
  bunny_embed_url: z.string().optional().or(z.literal("")),
});

interface LessonFormProps {
  moduleId: string;
  lesson?: Lesson | null;
  onClose: () => void;
}

export const LessonForm = ({ moduleId, lesson, onClose }: LessonFormProps) => {
  console.log('🎯🎯🎯 LessonForm renderizado 🎯🎯🎯');
  console.log('moduleId:', moduleId);
  console.log('lesson:', lesson);
  console.log('lesson?.id:', lesson?.id);
  console.log('lesson?.title:', lesson?.title);
  console.log('lesson?.duration_minutes:', lesson?.duration_minutes);
  console.log('lesson?.bunny_video_id:', lesson?.bunny_video_id);
  console.log('🎯🎯🎯 FIM LessonForm 🎯🎯🎯');

  if (!moduleId) {
    console.error('❌ ERRO: moduleId é vazio ou undefined');
    // Fechar o dialog automaticamente se não houver moduleId
    onClose();
    return null;
  }

  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const createQuizMutation = useCreateQuiz();
  const { toast } = useToast();
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  
  // Ref para acessar as funções do LessonFileFields
  const lessonFileFieldsRef = useRef<LessonFileFieldsRef | null>(null);

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      content: "",
      video_url: "",
      duration_minutes: 0,
      is_free: false,
      image_url: "",
      video_file_url: "",
      material_url: "",
      // Campos do Bunny.net
      bunny_video_id: "",
      bunny_library_id: undefined,
      bunny_video_status: undefined,
      bunny_embed_url: "",
    },
  });

  // Preencher formulário com dados da aula existente
  useEffect(() => {
    if (lesson) {
      console.log('🎯🎯🎯 PREENCHENDO FORMULÁRIO COM AULA EXISTENTE 🎯🎯🎯');
      console.log('lesson:', lesson);
      console.log('lesson.id:', lesson.id);
      console.log('lesson.title:', lesson.title);
      console.log('lesson.duration_minutes:', lesson.duration_minutes);
      console.log('lesson.bunny_video_id:', lesson.bunny_video_id);
      console.log('🎯🎯🎯 FIM PREENCHIMENTO 🎯🎯🎯');

      form.reset({
        title: lesson.title || "",
        content: lesson.content || "",
        video_url: lesson.video_url || "",
        duration_minutes: lesson.duration_minutes || 0,
        is_free: lesson.is_free || false,
        image_url: lesson.image_url || "",
        video_file_url: lesson.video_file_url || "",
        material_url: lesson.material_url || "",
        // Campos do Bunny.net
        bunny_video_id: lesson.bunny_video_id || "",
        bunny_library_id: lesson.bunny_library_id || undefined,
        bunny_video_status: lesson.bunny_video_status || undefined,
        bunny_embed_url: lesson.bunny_embed_url || "",
      });
    } else {
      console.log('❌❌❌ NENHUMA AULA PARA EDITAR ❌❌❌');
    }
  }, [lesson, form]);

  const onSubmit = async (data: LessonFormData) => {
    try {
      console.log('Submitting lesson form:', { data, moduleId, lesson });
      
      const lessonData = {
        module_id: moduleId,
        title: data.title,
        content: data.content || null,
        video_url: data.video_url || null,
        duration_minutes: data.duration_minutes > 0 ? data.duration_minutes : null, // Manter em minutos
        order_index: lesson?.order_index || 0,
        is_free: data.is_free,
        resources: null,
        image_url: data.image_url || null,
        video_file_url: data.video_file_url || null,
        material_url: data.material_url || null,
        // Campos do Bunny.net
        bunny_video_id: data.bunny_video_id || null,
        bunny_library_id: data.bunny_library_id || null,
        bunny_video_status: data.bunny_video_status || null,
        bunny_embed_url: data.bunny_embed_url || null,
      };

      console.log('Lesson data to submit:', lessonData);

      let createdLessonId: string;

      if (lesson) {
        console.log('Updating existing lesson:', lesson.id);
        const updatedLesson = await updateLessonMutation.mutateAsync({ id: lesson.id, ...lessonData });
        createdLessonId = updatedLesson.id;
      } else {
        console.log('Creating new lesson');
        const createdLesson = await createLessonMutation.mutateAsync(lessonData);
        createdLessonId = createdLesson.id;
      }

      // Após criar/atualizar a aula, criar o registro do material se houver
      if (lessonFileFieldsRef.current && data.material_url) {
        try {
          await lessonFileFieldsRef.current.createMaterialRecord(createdLessonId);
          console.log('Material record created successfully');
        } catch (materialError) {
          console.error('Error creating material record:', materialError);
          // Não falhar o processo se o material falhar
        }
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
      toast.error({
        title: "Erro",
        description: `Erro ao salvar aula: ${error.message}`
      });
    }
  };

  const handleQuizApproved = (questions: any[]) => {
    if (!lesson?.id) {
      // Aula ainda não foi criada, não é possível associar quiz
      toast.error({
        title: 'Crie a aula antes de salvar o quiz',
        description: 'Salve a aula e depois gere o quiz para associá-lo corretamente.'
      });
      return;
    }
    createQuizMutation.mutate({
      lessonId: lesson.id,
      title: `Quiz da aula: ${lesson.title}`,
      description: lesson.content?.slice(0, 100) || '',
      questions,
    });
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(
          (data) => {
            console.log('Form submitted successfully:', data);
            onSubmit(data);
          },
          (errors) => {
            console.error('Form validation errors:', errors);
            console.error('bunny_library_id error details:', errors.bunny_library_id);
            console.error('Form values:', form.getValues());
            toast.error({
              title: "Erro de Validação",
              description: "Por favor, corrija os erros no formulário."
            });
          }
        )} 
        className="space-y-6 dark-theme-override"
      >
        <div className="dark-theme-override">
          <LessonBasicFields control={form.control} />
          <LessonFileFields ref={lessonFileFieldsRef} />
          <LessonSettingsFields control={form.control} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="!border-gray-600 !text-gray-300 hover:!text-white hover:!bg-gray-700 !bg-transparent"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createLessonMutation.isPending || updateLessonMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {createLessonMutation.isPending || updateLessonMutation.isPending ? "Salvando..." : lesson ? "Atualizar Aula" : "Criar Aula"}
            </Button>
          </div>
        </div>
      </form>

      {/* Quiz Generation Dialog */}
      <GenerateQuizDialog
        open={quizDialogOpen}
        onOpenChange={setQuizDialogOpen}
        onQuizApproved={handleQuizApproved}
        lessonTitle={lesson?.title || ""}
        lessonContent={lesson?.content || ""}
      />
    </Form>
  );
};
