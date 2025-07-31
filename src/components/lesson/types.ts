export interface LessonFormData {
  title: string;
  content?: string;
  video_url?: string;
  duration_minutes?: number; // Formulário e Banco: minutos decimais (ex: 5.5 = 5min 30s)
  is_free: boolean;
  image_url?: string;
  video_file_url?: string;
  material_url?: string;
  // Campos do Bunny.net
  bunny_video_id?: string;
  bunny_library_id?: number | string | undefined;
  bunny_video_status?: 'pending' | 'processing' | 'ready' | 'error' | string | undefined;
  bunny_embed_url?: string;
}

export interface LessonViewProps {
  lessonId: string;
  courseId: string;
  companyId?: string;
  aiConfigurationId?: string;
}
