
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Control } from "react-hook-form";
import { LessonFormData } from "./types";

interface LessonSettingsFieldsProps {
  control: Control<LessonFormData>;
}

// Função para converter minutos para formato MM:SS
const minutesToTimeString = (totalMinutes: number): string => {
  if (!totalMinutes) return "";
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Função para converter formato MM:SS para minutos decimais
const timeStringToMinutes = (timeString: string): number => {
  if (!timeString) return 0;
  
  // Remove espaços e caracteres não numéricos exceto ':'
  const cleanString = timeString.replace(/[^\d:]/g, '');
  
  // Verifica se contém ':'
  if (cleanString.includes(':')) {
    const parts = cleanString.split(':');
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    return minutes + (seconds / 60);
  } else {
    // Se não contém ':', assume que são apenas minutos
    return parseInt(cleanString) || 0;
  }
};

export const LessonSettingsFields = ({ control }: LessonSettingsFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="duration_minutes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duração (MM:SS)</FormLabel>
            <FormControl>
              <Input 
                type="text" 
                placeholder="Ex: 05:30 ou 30:00"
                value={minutesToTimeString(field.value || 0)}
                onChange={(e) => {
                  const value = e.target.value;
                  const minutes = timeStringToMinutes(value);
                  field.onChange(minutes);
                }}
                onBlur={(e) => {
                  // Formatar o valor quando o usuário sai do campo
                  const value = e.target.value;
                  const minutes = timeStringToMinutes(value);
                  field.onChange(minutes);
                }}
              />
            </FormControl>
            <FormMessage />
            <div className="text-xs text-muted-foreground mt-1">
              Digite no formato MM:SS (ex: 05:30 para 5 minutos e 30 segundos)
            </div>
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
