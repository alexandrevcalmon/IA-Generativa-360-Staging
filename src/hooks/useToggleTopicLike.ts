
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { awardPointsToStudent } from '@/hooks/gamification/useStudentPoints';
import { GAMIFICATION_RULES, DAILY_LIMITS } from '@/hooks/gamification/gamificationRules';
import { useStudentProfile } from '@/hooks/useStudentProfile';

export const useToggleTopicLike = () => {
  const queryClient = useQueryClient();
  const { data: studentProfile } = useStudentProfile();

  return useMutation({
    mutationFn: async ({ topicId, isLiked }: { topicId: string; isLiked: boolean }) => {
      console.log('🔄 Toggling topic like:', { topicId, isLiked });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No authenticated user found');
        throw new Error('User not authenticated');
      }
      // Buscar o tópico para pegar o autor
      const { data: topic } = await supabase
        .from('community_topics')
        .select('id, author_id, title')
        .eq('id', topicId)
        .maybeSingle();
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('community_topic_likes')
          .delete()
          .eq('topic_id', topicId)
          .eq('user_id', user.id);
        if (error) {
          console.error('❌ Error removing like:', error);
          throw error;
        }
        // Remover pontos de quem curtiu
        if (studentProfile?.id) {
          await awardPointsToStudent({
            studentId: studentProfile.id,
            points: GAMIFICATION_RULES.community_topic_unliked,
            actionType: 'community_topic_unliked',
            description: `Removeu curtida do tópico: ${topic?.title || topicId}`,
            referenceId: topicId,
            meta: { topic_id: topicId },
            checkLimit: true,
            limitPerDay: DAILY_LIMITS.community_topic_liked,
            uniquePerReference: true
          });
        }
        // Remover pontos de quem recebeu a curtida
        if (topic?.author_id) {
          await awardPointsToStudent({
            studentId: topic.author_id,
            points: GAMIFICATION_RULES.community_topic_unliked,
            actionType: 'community_topic_unliked',
            description: `Perdeu curtida no tópico: ${topic?.title || topicId}`,
            referenceId: topicId + '-' + user.id,
            meta: { topic_id: topicId, from_user: user.id },
            checkLimit: true,
            limitPerDay: DAILY_LIMITS.community_topic_liked,
            uniquePerReference: true
          });
        }
        console.log('✅ Like removed successfully');
      } else {
        // Add like
        const { error } = await supabase
          .from('community_topic_likes')
          .insert({
            topic_id: topicId,
            user_id: user.id,
          });
        if (error) {
          console.error('❌ Error adding like:', error);
          throw error;
        }
        // Pontuar quem curtiu
        if (studentProfile?.id) {
          console.log('[Gamificação] Pontuando quem curtiu:', studentProfile.id, topicId);
          try {
            const result = await awardPointsToStudent({
              studentId: studentProfile.id,
              points: GAMIFICATION_RULES.community_topic_liked,
              actionType: 'community_topic_liked',
              description: `Curtiu tópico: ${topic?.title || topicId}`,
              referenceId: topicId,
              meta: { topic_id: topicId },
              checkLimit: true,
              limitPerDay: DAILY_LIMITS.community_topic_liked,
              uniquePerReference: true
            });
            if (result?.skipped) {
              toast.warning('Você já ganhou pontos por curtir este tópico ou atingiu o limite diário.');
              console.warn('[Gamificação] Pontuação pulada:', result);
            }
          } catch (err) {
            toast.error('Erro ao atribuir pontos por curtir tópico.');
            console.error('[Gamificação] Erro ao pontuar quem curtiu:', err);
          }
        } else {
          console.warn('[Gamificação] studentProfile.id indefinido ao curtir tópico', studentProfile);
        }
        // Pontuar quem recebeu a curtida via RPC
        if (topic?.author_id) {
          console.log('[Gamificação] Pontuando autor do tópico via RPC:', topic.author_id, topicId);
          try {
            const { error } = await supabase.rpc('award_points_to_student', {
              p_target_student_id: topic.author_id,
              p_points: GAMIFICATION_RULES.community_topic_liked,
              p_action_type: 'community_topic_liked',
              p_description: `Recebeu curtida no tópico: ${topic?.title || topicId}`,
              p_reference_id: topicId + '-' + user.id,
              p_meta: { topic_id: topicId, from_user: user.id }
            });
            if (error) {
              toast.error('Erro ao pontuar autor do tópico via RPC.');
              console.error('[Gamificação] Erro ao pontuar autor do tópico via RPC:', error);
            }
          } catch (err) {
            toast.error('Erro ao pontuar autor do tópico via RPC.');
            console.error('[Gamificação] Erro ao pontuar autor do tópico via RPC:', err);
            // Tratamento para refresh token inválido
            if (err?.message?.includes('Invalid Refresh Token') || err?.message?.includes('Refresh Token Not Found')) {
              window.location.href = '/login';
            }
          }
        } else {
          console.warn('[Gamificação] topic.author_id indefinido ao curtir tópico', topic);
        }
        console.log('✅ Like added successfully');
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after like toggle');
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['topic-likes'] });
      // Invalidar queries relacionadas a pontos e gamificação
      queryClient.invalidateQueries({ queryKey: ['points-history'] });
      queryClient.invalidateQueries({ queryKey: ['student-points'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      // Invalidar queries relacionadas a conquistas
      queryClient.invalidateQueries({ queryKey: ['student-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['available-achievements'] });
    },
    onError: (error) => {
      console.error('❌ Error toggling topic like:', error);
      toast.error('Erro ao curtir tópico. Verifique suas permissões.');
    },
  });
};

export const useGetTopicLikes = (topicId: string) => {
  return useQuery({
    queryKey: ['topic-likes', topicId],
    queryFn: async () => {
      console.log('📊 Fetching likes for topic:', topicId);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('community_topic_likes')
        .select('*')
        .eq('topic_id', topicId);

      if (error) {
        console.error('❌ Error fetching topic likes:', error);
        throw error;
      }

      const isLiked = user ? data.some(like => like.user_id === user.id) : false;
      
      console.log('📊 Topic likes result:', { 
        topicId, 
        likesCount: data.length, 
        isLiked, 
        userEmail: user?.email 
      });
      
      return {
        likes: data,
        isLiked,
        likesCount: data.length
      };
    },
    enabled: !!topicId,
  });
};
