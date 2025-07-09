
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useCreateLesson, useUpdateLesson, Lesson } from "@/hooks/useLessons";
import { LessonBasicFields } from "./LessonBasicFields";
import { LessonFileFields } from "./LessonFileFields";
import { LessonSettingsFields } from "./LessonSettingsFields";
import { LessonFormData } from "./types";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const lessonSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().default(""),
  video_url: z.string().url().optional().or(z.literal("")),
  duration_minutes: z.number().min(0).default(0),
  is_free: z.boolean().default(false),
  image_url: z.string().default(""),
  video_file_url: z.string().default(""),
  material_url: z.string().default(""),
});

interface LessonFormProps {
  moduleId: string;
  lesson?: Lesson | null;
  onClose: () => void;
}

export const LessonForm = ({ moduleId, lesson, onClose }: LessonFormProps) => {
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const { toast } = useToast();

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
    },
  });

  // Reset form values when lesson changes
  useEffect(() => {
    console.log('Resetting form with lesson:', lesson);
    form.reset({
      title: lesson?.title || "",
      content: lesson?.content || "",
      video_url: lesson?.video_url || "",
      duration_minutes: lesson?.duration_minutes ? lesson.duration_minutes / 60 : 0, // Converter segundos para minutos
      is_free: lesson?.is_free || false,
      image_url: lesson?.image_url || "",
      video_file_url: lesson?.video_file_url || "",
      material_url: lesson?.material_url || "",
    });
  }, [lesson, form]);

  const onSubmit = async (data: LessonFormData) => {
    try {
      console.log('Submitting lesson form:', { data, moduleId, lesson });
      
      const lessonData = {
        module_id: moduleId,
        title: data.title,
        content: data.content || null,
        video_url: data.video_url || null,
        duration_minutes: data.duration_minutes > 0 ? Math.round(data.duration_minutes * 60) : null, // Converter para segundos
        order_index: lesson?.order_index || 0,
        is_free: data.is_free,
        resources: null,
        image_url: data.image_url || null,
        video_file_url: data.video_file_url || null,
        material_url: data.material_url || null,
      };

      console.log('Lesson data to submit:', lessonData);

      if (lesson) {
        console.log('Updating existing lesson:', lesson.id);
        await updateLessonMutation.mutateAsync({ id: lesson.id, ...lessonData });
      } else {
        console.log('Creating new lesson');
        await createLessonMutation.mutateAsync(lessonData);
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
      toast({
        title: "Erro",
        description: `Erro ao salvar aula: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <LessonBasicFields control={form.control} />
        <LessonFileFields control={form.control} />
        <LessonSettingsFields control={form.control} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={createLessonMutation.isPending || updateLessonMutation.isPending}
          >
            {lesson ? "Atualizar" : "Criar"} Aula
          </Button>
        </div>
      </form>
    </Form>
  );
};
