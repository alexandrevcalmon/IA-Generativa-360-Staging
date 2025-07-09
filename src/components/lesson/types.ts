export interface LessonFormData {
  title: string;
  content?: string;
  video_url?: string;
  duration_minutes?: number;
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
