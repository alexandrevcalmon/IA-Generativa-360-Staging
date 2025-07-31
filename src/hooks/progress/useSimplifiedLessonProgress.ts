
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { lessonProgressService } from '@/services/lessonProgressService';
import { UpdateProgressParams } from './types';

export const useSimplifiedLessonProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: UpdateProgressParams) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      return lessonProgressService.updateProgress({
        lessonId: params.lessonId,
        userId: user.id,
        completed: params.completed,
        watchTimeSeconds: params.watchTimeSeconds
      });
    },
    onSuccess: (data) => {
      if (data) {
        // Only invalidate queries once per successful update
        queryClient.invalidateQueries({ queryKey: ['student-courses'] });
        queryClient.invalidateQueries({ queryKey: ['student-course'] });
        queryClient.invalidateQueries({ queryKey: ['student-points'] });
        queryClient.invalidateQueries({ queryKey: ['collaborator-analytics'] });
      }
    },
    onError: (error: any) => {
      console.error('Progress update failed:', error);
    }
  });

  const resetCompletionToasts = (lessonId?: string) => {
    if (user?.id) {
      lessonProgressService.resetCompletionToasts(lessonId, user.id);
    }
  };

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    resetCompletionToasts
  };
};
