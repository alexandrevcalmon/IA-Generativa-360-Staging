
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { LessonFormData } from "./types";
import { FileUploadField } from "@/components/FileUploadField";

interface LessonFileFieldsProps {
  control: Control<LessonFormData>;
}

export const LessonFileFields = ({ control }: LessonFileFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="image_url"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <FileUploadField
                label="Imagem da Aula"
                description="Recomendado: 1280x720px (16:9)"
                value={field.value || ""}
                onChange={(url) => field.onChange(url || "")}
                uploadOptions={{
                  bucket: 'lesson-images',
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
        control={control}
        name="video_file_url"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <FileUploadField
                label="Vídeo da Aula"
                description="Tamanho máximo: 512MB. Formatos aceitos: MP4, WebM, OGG, AVI, MOV"
                value={field.value || ""}
                onChange={(url) => field.onChange(url || "")}
                uploadOptions={{
                  bucket: 'lesson-videos',
                  maxSize: 512 * 1024 * 1024, // 512MB
                  allowedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
                }}
                accept="video/*"
                preview={true}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="material_url"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <FileUploadField
                label="Material de Apoio"
                description="PDF, Word, Excel ou CSV. Tamanho máximo: 10MB"
                value={field.value || ""}
                onChange={(url) => field.onChange(url || "")}
                uploadOptions={{
                  bucket: 'lesson-materials',
                  maxSize: 10 * 1024 * 1024, // 10MB
                  allowedTypes: [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/csv'
                  ],
                }}
                accept=".pdf,.docx,.xlsx,.csv"
                preview={false}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
