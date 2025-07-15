import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface QuizQuestion {
  pergunta: string;
  alternativas: string[];
  correta: string;
}

export interface CreateQuizInput {
  lessonId?: string;
  moduleId?: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  max_attempts?: number;
  passing_score?: number;
}

export interface Quiz {
  id: string;
  lesson_id: string | null;
  module_id: string | null;
  title: string;
  description: string | null;
  questions: any[];
  status?: string;
  created_at: string;
}

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (quiz: CreateQuizInput) => {
      const { lessonId, moduleId, title, description, questions, max_attempts, passing_score } = quiz;
      if (!lessonId && !moduleId) throw new Error('É necessário informar lessonId ou moduleId');
      if (!title || !questions || questions.length === 0) throw new Error('Título e perguntas são obrigatórios');
      if (!user?.id) throw new Error('Usuário não autenticado');
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          lesson_id: lessonId || null,
          module_id: moduleId || null,
          title,
          description: description || null,
          questions,
          max_attempts: max_attempts || null,
          passing_score: passing_score || null,
          user_id: user.id,
          status: 'Aprovado', // Sempre aprovado ao criar
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: 'Quiz salvo com sucesso!',
        description: data?.title,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar quiz',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useLessonQuizzes = (lessonId: string) => {
  return useQuery({
    queryKey: ['quizzes', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Quiz[];
    },
    enabled: !!lessonId,
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (quizId: string) => {
      console.log('[useDeleteQuiz] Tentando excluir quiz:', quizId);
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);
      if (error) {
        console.error('[useDeleteQuiz] Erro ao excluir quiz:', error, 'QuizId:', quizId);
        throw error;
      }
      console.log('[useDeleteQuiz] Quiz excluído com sucesso:', quizId);
      return quizId;
    },
    onSuccess: (_, quizId) => {
      console.log('[useDeleteQuiz] onSuccess - Quiz excluído:', quizId);
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: 'Quiz excluído com sucesso!',
        description: `Quiz removido: ${quizId}`,
      });
    },
    onError: (error: any, quizId) => {
      console.error('[useDeleteQuiz] onError - Erro ao excluir quiz:', error, 'QuizId:', quizId);
      toast({
        title: 'Erro ao excluir quiz',
        description: error.message || String(error),
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const allowedFields = ['title', 'description', 'questions', 'status', 'max_attempts', 'passing_score'];
      const updateData = Object.fromEntries(
        Object.entries(updates).filter(([key]) => allowedFields.includes(key))
      );
      console.log('[useUpdateQuiz] Atualizando quiz:', { id, ...updateData, status: 'Aprovado' });
      const { data, error } = await supabase
        .from('quizzes')
        .update({ ...updateData, status: 'Aprovado' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: 'Quiz atualizado com sucesso!',
        description: data?.title,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar quiz',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Tipos para tentativas de quizz
export interface QuizAttempt {
  id: string;
  user_id: string;
  lesson_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  answers?: any;
  passed: boolean;
  attempt_number: number;
  completed_at: string;
}

export interface RegisterQuizAttemptInput {
  lesson_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  answers?: any;
  passed: boolean;
}

// Hook para registrar uma tentativa de quizz
export const useRegisterQuizAttempt = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterQuizAttemptInput) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      const { lesson_id, quiz_id, score, total_questions, correct_answers, answers, passed } = input;
      // Busca o número da última tentativa
      const { data: lastAttempts, error: lastError } = await supabase
        .from('quiz_attempts')
        .select('attempt_number')
        .eq('user_id', user.id)
        .eq('quiz_id', quiz_id)
        .order('attempt_number', { ascending: false })
        .limit(1);
      let attempt_number = 1;
      if (lastAttempts && lastAttempts.length > 0) {
        attempt_number = (lastAttempts[0].attempt_number || 0) + 1;
      }
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          lesson_id,
          quiz_id,
          score,
          total_questions,
          correct_answers,
          answers: answers || null,
          passed,
          attempt_number,
        })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as QuizAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz_attempts'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao registrar tentativa do quiz',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook para buscar tentativas de um usuário para um quiz específico
export const useUserQuizAttempts = (quizId: string, lessonId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['quiz_attempts', user?.id, quizId, lessonId],
    queryFn: async () => {
      if (!user?.id || !quizId) return [];
      let query = supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_id', quizId);
      if (lessonId) query = query.eq('lesson_id', lessonId);
      const { data, error } = await query.order('attempt_number', { ascending: true });
      if (error) throw error;
      return data as QuizAttempt[];
    },
    enabled: !!user?.id && !!quizId,
  });
};

// Hook para buscar a última tentativa de um usuário para um quiz específico
export const useLastUserQuizAttempt = (quizId: string, lessonId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['quiz_attempts', 'last', user?.id, quizId, lessonId],
    queryFn: async () => {
      if (!user?.id || !quizId) return null;
      let query = supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('quiz_id', quizId);
      if (lessonId) query = query.eq('lesson_id', lessonId);
      const { data, error } = await query.order('attempt_number', { ascending: false }).limit(1);
      if (error) throw error;
      return data && data.length > 0 ? (data[0] as QuizAttempt) : null;
    },
    enabled: !!user?.id && !!quizId,
  });
};

// Hook para buscar todas as tentativas do usuário para todos os quizzes de uma aula
export const useLessonQuizAttempts = (lessonId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['quiz_attempts', 'lesson', user?.id, lessonId],
    queryFn: async () => {
      if (!user?.id || !lessonId) return [];
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!lessonId,
  });
};

// Hook para buscar um quiz pelo id
export const useQuizById = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      if (!quizId) return null;
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!quizId,
  });
}; 