
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { LessonFormData } from "./types";

interface LessonBasicFieldsProps {
  control: Control<LessonFormData>;
}

export const LessonBasicFields = ({ control }: LessonBasicFieldsProps) => {
  return (
    <div className="dark-theme-override">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Título *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Nome da aula" 
                {...field} 
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-300">Conteúdo</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva o conteúdo da aula"
                className="min-h-[100px] bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
