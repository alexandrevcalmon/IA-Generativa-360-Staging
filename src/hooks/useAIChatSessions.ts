
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { toast } from 'sonner';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AIChatSession {
  id: string;
  lesson_id: string | null;
  user_id: string;
  company_id: string | null;
  ai_configuration_id: string | null;
  session_data: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export const useAIChatSessions = (lessonId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-chat-sessions', lessonId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const query = supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (lessonId) {
        query.eq('lesson_id', lessonId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match our TypeScript interface
      return (data || []).map(session => ({
        ...session,
        session_data: Array.isArray(session.session_data) 
          ? (session.session_data as unknown as ChatMessage[]) 
          : []
      })) as AIChatSession[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateChatSession = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ lessonId, companyId }: { lessonId?: string; companyId?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .insert({
          lesson_id: lessonId || null,
          user_id: user.id,
          company_id: companyId || null,
          session_data: []
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat-sessions'] });
    },
    onError: (error) => {
      console.error('Error creating chat session:', error);
      toast.error('Erro ao criar sessão de chat');
    },
  });
};

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      messages, 
      lessonId 
    }: { 
      sessionId: string; 
      messages: ChatMessage[];
      lessonId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Sending chat message to edge function:', {
        sessionId,
        messageCount: messages.length,
        lessonId
      });

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          sessionId,
          messages,
          lessonId,
          userId: user.id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data.error) {
        console.error('AI Chat error:', data.error);
        throw new Error(data.error);
      }

      console.log('AI response received:', {
        model: data.model,
        provider: data.provider,
        messageLength: data.message?.length,
        hasLessonContext: data.hasLessonContext
      });

      return {
        message: data.message,
        model: data.model,
        provider: data.provider,
        hasLessonContext: data.hasLessonContext || false
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat-sessions'] });
    },
    onError: (error) => {
      console.error('Error sending chat message:', error);
      toast.error('Erro ao enviar mensagem para IA');
    },
  });
};

export const useDeleteChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('ai_chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat-sessions'] });
      toast.success('Sessão de chat excluída');
    },
    onError: (error) => {
      console.error('Error deleting chat session:', error);
      toast.error('Erro ao excluir sessão de chat');
    },
  });
};
