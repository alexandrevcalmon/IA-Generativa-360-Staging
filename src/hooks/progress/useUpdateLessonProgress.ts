
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { toast } from 'sonner';
import { useRef } from 'react';
import { retryWithBackoff } from './utils';
import { UpdateProgressParams, ProgressUpdateResult } from './types';
import { awardPointsToStudent } from '@/hooks/gamification/useStudentPoints';
import { getPointsForEvent } from '@/hooks/gamification/gamificationRules';
import { lessonProgressService } from '@/services/lessonProgressService';

export const useUpdateLessonProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const pendingUpdatesRef = useRef<Set<string>>(new Set());
  const lastUpdateTimeRef = useRef<Map<string, number>>(new Map());
  const completionToastsRef = useRef<Set<string>>(new Set()); // Track completion toasts

  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      lessonId, 
      completed, 
      watchTimeSeconds 
    }: UpdateProgressParams): Promise<ProgressUpdateResult | null> => {
      if (!user) throw new Error('User not authenticated');
      // Delegar para o service centralizado
      return lessonProgressService.updateProgress({
        lessonId,
        userId: user.id,
        completed,
        watchTimeSeconds
      });
    },
    onSuccess: (data) => {
      if (data) {
        // Invalidate relevant queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['student-courses'] });
        queryClient.invalidateQueries({ queryKey: ['student-course'] });
        queryClient.invalidateQueries({ queryKey: ['student-points'] });
        queryClient.invalidateQueries({ queryKey: ['points-history'] });
        console.log('🔄 Invalidated relevant queries after progress update');
      }
    },
    onError: (error: any) => {
      console.error('❌ Progress update error:', error);
      // Show user-friendly error messages with controlled toast
      if (error?.code === '42501') {
        toast.error("Erro de permissão", {
          description: "Você não tem permissão para atualizar o progresso desta aula.",
          duration: 3000,
          dismissible: true,
          style: {
            zIndex: 9998,
          }
        });
      } else if (error?.code !== '23505' && error?.status !== 409) {
        toast.error("Erro ao atualizar progresso", {
          description: "Não foi possível atualizar o progresso da aula. Tente novamente.",
          duration: 3000,
          dismissible: true,
          style: {
            zIndex: 9998,
          }
        });
      } else {
        console.log('🔄 Conflict error suppressed (expected during high concurrency)');
      }
    },
  });

  // Reset completion toasts tracking when component unmounts or lesson changes
  const resetCompletionToasts = (lessonId?: string) => {
    if (lessonId && user) {
      const completionToastKey = `${user.id}-${lessonId}-completed`;
      completionToastsRef.current.delete(completionToastKey);
    } else {
      completionToastsRef.current.clear();
    }
  };

  return {
    ...updateProgressMutation,
    resetCompletionToasts
  };
};
