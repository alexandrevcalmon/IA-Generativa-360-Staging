
// Type definitions for progress-related functionality

export interface UpdateProgressParams {
  lessonId: string;
  completed?: boolean;
  watchTimeSeconds?: number;
}

export interface ProgressUpdateResult {
  lesson_id: string;
  user_id: string;
  completed: boolean;
  watch_time_seconds: number;
  completed_at?: string;
  last_watched_at: string;
}
