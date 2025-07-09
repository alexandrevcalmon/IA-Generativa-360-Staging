
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Control } from "react-hook-form";
import { LessonFormData } from "./types";

interface LessonSettingsFieldsProps {
  control: Control<LessonFormData>;
}

export const LessonSettingsFields = ({ control }: LessonSettingsFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="duration_minutes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duração (minutos)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Ex: 30"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="is_free"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Aula Gratuita</FormLabel>
              <div className="text-sm text-muted-foreground">
                Permitir acesso gratuito a esta aula
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
    </>
  );
};
