export interface LessonFormData {
  title: string;
  content?: string;
  video_url?: string;
  duration_minutes?: number; // Formulário: minutos decimais (ex: 5.5 = 5min 30s) | Banco: segundos totais
  is_free: boolean;
  image_url?: string;
  video_file_url?: string;
  material_url?: string;
}

export interface LessonViewProps {
  lessonId: string;
  courseId: string;
  companyId?: string;
  aiConfigurationId?: string;
}
