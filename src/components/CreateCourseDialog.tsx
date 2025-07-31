
import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description || "",
        category: course.category || "",
        difficulty_level: course.difficulty_level as "beginner" | "intermediate" | "advanced" || "beginner",
        estimated_hours: course.estimated_hours || 0,
        thumbnail_url: course.thumbnail_url || "",
        is_published: course.is_published || false,
        tags: course.tags || [],
      });
      setPreviewUrl(course.thumbnail_url || null);
    }
  }, [course, form]);

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
      toast.error({
        title: "Erro",
        description: "Erro ao fazer upload da imagem"
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {course ? "Editar Curso" : "Criar Novo Curso"}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
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
                    <FormLabel className="text-gray-300">Título *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Digite o título do curso"
                      />
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
                    <FormLabel className="text-gray-300">Categoria</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Ex: Tecnologia, Marketing, etc."
                      />
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
                  <FormLabel className="text-gray-300">Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Descreva o conteúdo do curso..."
                      rows={4}
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
                    <FormLabel className="text-gray-300">Nível de Dificuldade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="beginner" className="text-gray-300 hover:text-white hover:bg-gray-700">Iniciante</SelectItem>
                        <SelectItem value="intermediate" className="text-gray-300 hover:text-white hover:bg-gray-700">Intermediário</SelectItem>
                        <SelectItem value="advanced" className="text-gray-300 hover:text-white hover:bg-gray-700">Avançado</SelectItem>
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
                    <FormLabel className="text-gray-300">Horas Estimadas</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
                        placeholder="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-4">
              <FormLabel className="text-gray-300">Imagem de Capa</FormLabel>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Imagem
                  </label>
                </div>
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null);
                        setBannerFile(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <FormLabel className="text-gray-300">Tags</FormLabel>
              <div className="flex items-center space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite uma tag e pressione Enter"
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch("tags").map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gray-700 text-gray-300 border-gray-600"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-gray-300">Publicar Curso</FormLabel>
                    <div className="text-sm text-gray-400">
                      Marque esta opção para tornar o curso público
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

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg border-0"
              >
                {isUploading ? "Salvando..." : course ? "Atualizar Curso" : "Criar Curso"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
