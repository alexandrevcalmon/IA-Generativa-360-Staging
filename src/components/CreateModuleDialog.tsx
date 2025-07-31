
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
import { Switch } from "@/components/ui/switch";
import { useCreateModule, useUpdateModule, CourseModule } from "@/hooks/useCourseModules";
import { FileUploadField } from "@/components/FileUploadField";
import { useEffect } from "react";

const moduleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  order_index: z.number().min(0),
  is_published: z.boolean().default(false),
  image_url: z.string().optional(),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface CreateModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  module?: CourseModule | null;
}

export const CreateModuleDialog = ({ isOpen, onClose, courseId, module }: CreateModuleDialogProps) => {
  const createModuleMutation = useCreateModule();
  const updateModuleMutation = useUpdateModule();

  console.log('🔧🔧🔧 CreateModuleDialog renderizado 🔧🔧🔧');
  console.log('isOpen:', isOpen);
  console.log('courseId:', courseId);
  console.log('module:', module);
  console.log('module?.title:', module?.title);
  console.log('module?.description:', module?.description);
  console.log('module?.order_index:', module?.order_index);
  console.log('module?.is_published:', module?.is_published);
  console.log('module?.image_url:', module?.image_url);
  console.log('🔧🔧🔧 FIM CreateModuleDialog 🔧🔧🔧');

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: "",
      description: "",
      order_index: 0,
      is_published: false,
      image_url: "",
    },
  });

  // Reset form values when module changes or dialog opens
  useEffect(() => {
    console.log('🔄🔄🔄 useEffect executado 🔄🔄🔄');
    console.log('isOpen:', isOpen);
    console.log('module:', module);
    
    if (isOpen) {
      const formData = {
        title: module?.title || "",
        description: module?.description || "",
        order_index: module?.order_index || 0,
        is_published: module?.is_published || false,
        image_url: module?.image_url || "",
      };
      
      console.log('🔄🔄🔄 Resetando form com dados:', formData);
      form.reset(formData);
    }
  }, [module, isOpen, form]);

  const onSubmit = async (data: ModuleFormData) => {
    try {
      const moduleData = {
        course_id: courseId,
        title: data.title,
        description: data.description || null,
        order_index: data.order_index,
        is_published: data.is_published,
        image_url: data.image_url || null,
      };

      if (module) {
        await updateModuleMutation.mutateAsync({ id: module.id, ...moduleData });
      } else {
        await createModuleMutation.mutateAsync(moduleData);
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar módulo:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {module ? "Editar Módulo" : "Criar Novo Módulo"}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {module 
              ? "Edite as informações do módulo abaixo." 
              : "Preencha as informações para criar um novo módulo."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Título *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome do módulo" 
                      {...field} 
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o conteúdo do módulo"
                      className="min-h-[80px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUploadField
                      label="Imagem do Módulo"
                      description="Recomendado: 720x1280px (formato 9:16)"
                      value={field.value || ""}
                      onChange={(url) => field.onChange(url || "")}
                      uploadOptions={{
                        bucket: 'module-images',
                        maxSize: 5 * 1024 * 1024, // 5MB
                        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
                      }}
                      accept="image/*"
                      preview={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order_index"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Ordem</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-4 bg-gray-800/50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-gray-300">Publicar Módulo</FormLabel>
                    <div className="text-sm text-gray-400">
                      Torne o módulo visível para os colaboradores
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
              <Button type="button" variant="outline" onClick={onClose} className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createModuleMutation.isPending || updateModuleMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg"
              >
                {module ? "Atualizar" : "Criar"} Módulo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
