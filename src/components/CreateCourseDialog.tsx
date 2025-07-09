
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Image } from "lucide-react";
import { useCreateCourse, useUpdateCourse, Course } from "@/hooks/useCourses";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const courseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().default(""),
  category: z.string().default(""),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  estimated_hours: z.number().min(0).default(0),
  thumbnail_url: z.string().default(""),
  is_published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CreateCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
}

export const CreateCourseDialog = ({ isOpen, onClose, course }: CreateCourseDialogProps) => {
  const [newTag, setNewTag] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(course?.thumbnail_url || null);
  
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      category: course?.category || "",
      difficulty_level: course?.difficulty_level as "beginner" | "intermediate" | "advanced" || "beginner",
      estimated_hours: course?.estimated_hours || 0,
      thumbnail_url: course?.thumbnail_url || "",
      is_published: course?.is_published || false,
      tags: course?.tags || [],
    },
  });

  const uploadBannerImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-banners')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('course-banners')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsUploading(true);
      
      let thumbnailUrl = data.thumbnail_url;
      
      // Upload banner image if a new file was selected
      if (bannerFile) {
        const uploadedUrl = await uploadBannerImage(bannerFile);
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl;
        }
      }

      // Ensure title is present (it's required by the schema)
      const courseData = {
        title: data.title, // This is guaranteed to be string due to schema validation
        description: data.description || null,
        category: data.category || null,
        difficulty_level: data.difficulty_level === "beginner" && !course ? null : data.difficulty_level,
        estimated_hours: data.estimated_hours > 0 ? data.estimated_hours : null,
        thumbnail_url: thumbnailUrl || null,
        is_published: data.is_published,
        tags: data.tags,
        instructor_id: null, // Por enquanto, não temos sistema de instrutores
      };

      if (course) {
        await updateCourseMutation.mutateAsync({ id: course.id, ...courseData });
      } else {
        await createCourseMutation.mutateAsync(courseData);
      }
      
      form.reset();
      setBannerFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar curso:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !form.getValues("tags").includes(newTag.trim())) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {course ? "Editar Curso" : "Criar Novo Curso"}
          </DialogTitle>
          <DialogDescription>
            {course 
              ? "Edite as informações do curso abaixo." 
              : "Preencha as informações para criar um novo curso."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do curso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Programação, Design..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o conteúdo e objetivos do curso"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Dificuldade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "beginner"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Iniciante</SelectItem>
                        <SelectItem value="intermediate">Intermediário</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração Estimada (horas)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 40"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? Number(value) : 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel>Imagem do Banner</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview do banner" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPreviewUrl(null);
                          setBannerFile(null);
                        }}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="banner-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Clique para fazer upload da imagem do banner
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          PNG, JPG até 5MB
                        </span>
                      </label>
                      <input
                        id="banner-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                )}
                
                {!previewUrl && (
                  <div className="mt-4">
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="banner-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Escolher Arquivo
                      </label>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem (alternativa)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://exemplo.com/imagem.jpg"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Digite uma tag e pressione Enter"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {form.watch("tags").map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Publicar Curso</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Torne o curso visível para os alunos
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createCourseMutation.isPending || updateCourseMutation.isPending || isUploading}
              >
                {isUploading ? "Enviando..." : course ? "Atualizar" : "Criar"} Curso
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
