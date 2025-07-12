
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getPointsForEvent } from '@/hooks/gamification/gamificationRules';
import { awardPointsToStudent } from '@/hooks/gamification/useStudentPoints';

interface ProgressUpdate {
  lessonId: string;
  userId: string;
  completed?: boolean;
  watchTimeSeconds?: number;
}

class LessonProgressService {
  private pendingUpdates = new Map<string, NodeJS.Timeout>();
  private completionToasts = new Set<string>();
  private lastUpdateTimes = new Map<string, number>();

  private getUpdateKey(userId: string, lessonId: string): string {
    return `${userId}-${lessonId}`;
  }

  public async updateProgress({ lessonId, userId, completed, watchTimeSeconds }: ProgressUpdate) {
    console.log('[Progresso] updateProgress chamado:', { lessonId, userId, completed, watchTimeSeconds, timestamp: new Date().toISOString() });
    const updateKey = this.getUpdateKey(userId, lessonId);
    const now = Date.now();
    
    // Throttle updates - minimum 3 seconds between updates
    const lastUpdate = this.lastUpdateTimes.get(updateKey) || 0;
    if (now - lastUpdate < 3000) {
      console.log('[Progresso] Ignorando update por throttling:', { updateKey, now, lastUpdate });
      return null;
    }

    // Clear any pending update for this lesson
    if (this.pendingUpdates.has(updateKey)) {
      clearTimeout(this.pendingUpdates.get(updateKey)!);
    }

    // Set new update timer
    return new Promise((resolve) => {
      const timeoutId = setTimeout(async () => {
        try {
          this.lastUpdateTimes.set(updateKey, Date.now());
          
          // Buscar progresso existente
          const { data: existingProgress } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('lesson_id', lessonId)
            .eq('user_id', userId)
            .maybeSingle();

          const updateData = {
            lesson_id: lessonId,
            user_id: userId,
            completed: completed ?? existingProgress?.completed ?? false,
            watch_time_seconds: Math.max(
              watchTimeSeconds ?? 0,
              existingProgress?.watch_time_seconds ?? 0
            ),
            completed_at: completed ? new Date().toISOString() : existingProgress?.completed_at,
            last_watched_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('lesson_progress')
            .upsert(updateData, {
              onConflict: 'user_id,lesson_id',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (error) throw error;

          // Lógica de gamificação centralizada
          if (completed && data && !existingProgress?.completed) {
            try {
              console.log('[Gamificação] Buscando company_users.id para', userId);
              const { data: companyUser, error: companyUserError } = await supabase
                .from('company_users')
                .select('id')
                .eq('auth_user_id', userId)
                .maybeSingle();
              console.log('[Gamificação] Resultado da busca company_users:', companyUser, companyUserError);
              if (companyUserError || !companyUser) {
                console.error('[Gamificação] Não foi possível encontrar o company_users.id para o usuário', userId, companyUserError);
              } else {
                const studentId = companyUser.id;
                const points = getPointsForEvent('lesson_completed');
                console.log('[Gamificação] Pronto para atribuir pontos:', { studentId, points, lessonId });
                if (points > 0) {
                  try {
                    await awardPointsToStudent({
                      studentId,
                      points,
                      actionType: 'lesson_completed',
                      description: 'Conclusão de lição',
                      referenceId: lessonId
                    });
                    console.log('[Gamificação] Pontos atribuídos com sucesso para', studentId);
                  } catch (err) {
                    console.error('[Gamificação] Erro ao atribuir pontos:', err);
                  }
                }
              }
            } catch (err) {
              console.error('[Gamificação] Erro inesperado na lógica de gamificação:', err);
            }
          }

          // Show completion toast only once
          if (completed && data) {
            const completionKey = `${userId}-${lessonId}-completed`;
            if (!this.completionToasts.has(completionKey)) {
              this.completionToasts.add(completionKey);
              
              toast.success("Aula concluída!", {
                description: "Parabéns! Você completou esta aula.",
                duration: 4000,
                dismissible: true,
                style: {
                  zIndex: 9997, // Below chat widget
                },
                onDismiss: () => {
                  this.completionToasts.delete(completionKey);
                },
                onAutoClose: () => {
                  this.completionToasts.delete(completionKey);
                }
              });
            }
          }

          this.pendingUpdates.delete(updateKey);
          resolve(data);
        } catch (error) {
          console.error('Progress update error:', error);
          this.pendingUpdates.delete(updateKey);
          resolve(null);
        }
      }, 2000); // 2 second delay for debouncing

      this.pendingUpdates.set(updateKey, timeoutId);
    });
  }

  public resetCompletionToasts(lessonId?: string, userId?: string) {
    if (lessonId && userId) {
      const completionKey = `${userId}-${lessonId}-completed`;
      this.completionToasts.delete(completionKey);
    } else {
      this.completionToasts.clear();
    }
  }
}

export const lessonProgressService = new LessonProgressService();
