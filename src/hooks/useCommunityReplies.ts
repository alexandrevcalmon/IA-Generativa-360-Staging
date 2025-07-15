
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommunityReply } from "./useCommunityTopics";
import { awardPointsToStudent } from '@/hooks/gamification/useStudentPoints';
import { GAMIFICATION_RULES, DAILY_LIMITS } from '@/hooks/gamification/gamificationRules';
import { useStudentProfile } from '@/hooks/useStudentProfile';

export const useCommunityReplies = (topicId?: string) => {
  return useQuery({
    queryKey: ['community-replies', topicId],
    queryFn: async () => {
      if (!topicId) return [];
      
      const { data, error } = await supabase
        .from('community_replies')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching community replies:', error);
        throw error;
      }
      return data as CommunityReply[];
    },
    enabled: !!topicId,
  });
};

export const useCreateCommunityReply = () => {
  const queryClient = useQueryClient();
  const { data: studentProfile } = useStudentProfile();

  return useMutation({
    mutationFn: async (replyData: Omit<CommunityReply, 'id' | 'created_at' | 'updated_at' | 'likes_count'>) => {
      const { data, error } = await supabase
        .from('community_replies')
        .insert(replyData)
        .select()
        .single();
      if (error) {
        console.error('Error creating community reply:', error);
        throw error;
      }
      // Pontuar resposta se for completa (>100 caracteres) e primeira resposta do usuário no tópico
      if (studentProfile?.id && replyData.content && replyData.content.length > 100) {
        // Checar se já existe resposta pontuada desse usuário nesse tópico
        const { data: existing } = await supabase
          .from('points_history')
          .select('id')
          .eq('student_id', studentProfile.id)
          .eq('action_type', 'community_reply_created')
          .eq('reference_id', replyData.topic_id)
          .maybeSingle();
        if (!existing) {
          await awardPointsToStudent({
            studentId: studentProfile.id,
            points: GAMIFICATION_RULES.community_reply_created,
            actionType: 'community_reply_created',
            description: `Respondeu tópico: ${replyData.topic_id}`,
            referenceId: replyData.topic_id,
            meta: { reply_id: data.id, topic_id: replyData.topic_id },
            checkLimit: true,
            limitPerDay: DAILY_LIMITS.community_reply_created,
            uniquePerReference: true
          });
        }
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community-replies', variables.topic_id] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-topic', variables.topic_id] });
      toast.success('Resposta criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating community reply:', error);
      toast.error('Erro ao criar resposta');
    },
  });
};

export const useToggleReplyLike = () => {
  const queryClient = useQueryClient();
  const { data: studentProfile } = useStudentProfile();

  return useMutation({
    mutationFn: async ({ replyId, isLiked }: { replyId: string; isLiked: boolean }) => {
      if (isLiked) {
        // Remove like
        const { data: { user } } = await supabase.auth.getUser();
        const { data: reply } = await supabase
          .from('community_replies')
          .select('id, author_id, topic_id')
          .eq('id', replyId)
          .maybeSingle();
        const { error } = await supabase
          .from('community_reply_likes')
          .delete()
          .eq('reply_id', replyId)
          .eq('user_id', user?.id);
        if (error) throw error;
        // Remover pontos de quem curtiu
        if (studentProfile?.id) {
          await awardPointsToStudent({
            studentId: studentProfile.id,
            points: GAMIFICATION_RULES.community_reply_unliked,
            actionType: 'community_reply_unliked',
            description: `Removeu curtida da resposta: ${replyId}`,
            referenceId: replyId,
            meta: { reply_id: replyId },
            checkLimit: true,
            limitPerDay: DAILY_LIMITS.community_reply_liked,
            uniquePerReference: true
          });
        }
        // Remover pontos de quem recebeu a curtida
        if (reply?.author_id) {
          await awardPointsToStudent({
            studentId: reply.author_id,
            points: GAMIFICATION_RULES.community_reply_unliked,
            actionType: 'community_reply_unliked',
            description: `Perdeu curtida na resposta: ${replyId}`,
            referenceId: replyId + '-' + (user?.id || ''),
            meta: { reply_id: replyId, from_user: user?.id },
            checkLimit: true,
            limitPerDay: DAILY_LIMITS.community_reply_liked,
            uniquePerReference: true
          });
        }
      } else {
        // Add like
        const { data: { user } } = await supabase.auth.getUser();
        const { data: reply } = await supabase
          .from('community_replies')
          .select('id, author_id, topic_id')
          .eq('id', replyId)
          .maybeSingle();
        const { error } = await supabase
          .from('community_reply_likes')
          .insert({
            reply_id: replyId,
            user_id: user?.id,
          });
        if (error) throw error;
        // Pontuar quem curtiu
        if (studentProfile?.id) {
          await awardPointsToStudent({
            studentId: studentProfile.id,
            points: GAMIFICATION_RULES.community_reply_liked,
            actionType: 'community_reply_liked',
            description: `Curtiu resposta: ${replyId}`,
            referenceId: replyId,
            meta: { reply_id: replyId },
            checkLimit: true,
            limitPerDay: DAILY_LIMITS.community_reply_liked,
            uniquePerReference: true
          });
        }
        // Pontuar quem recebeu a curtida
        if (reply?.author_id) {
          await awardPointsToStudent({
            studentId: reply.author_id,
            points: GAMIFICATION_RULES.community_reply_liked,
            actionType: 'community_reply_liked',
            description: `Recebeu curtida na resposta: ${replyId}`,
            referenceId: replyId + '-' + (user?.id || ''),
            meta: { reply_id: replyId, from_user: user?.id },
            checkLimit: true,
            limitPerDay: DAILY_LIMITS.community_reply_liked,
            uniquePerReference: true
          });
        }
      }
    },
    onSuccess: (_, { replyId }) => {
      queryClient.invalidateQueries({ queryKey: ['community-replies'] });
    },
    onError: (error) => {
      console.error('Error toggling reply like:', error);
      toast.error('Erro ao curtir resposta');
    },
  });
};

export const useUpdateCommunityReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CommunityReply> & { id: string }) => {
      const { data, error } = await supabase
        .from('community_replies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Error updating community reply:', error);
        throw error;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community-replies', variables.topic_id] });
      toast.success('Resposta atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating community reply:', error);
      toast.error('Erro ao atualizar resposta');
    },
  });
};

export const useDeleteCommunityReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, topic_id }: { id: string; topic_id: string }) => {
      const { error } = await supabase
        .from('community_replies')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Error deleting community reply:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community-replies', variables.topic_id] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-topic', variables.topic_id] });
      toast.success('Resposta removida com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting community reply:', error);
      toast.error('Erro ao remover resposta');
    },
  });
};
