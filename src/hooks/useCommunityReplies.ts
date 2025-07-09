
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommunityReply } from "./useCommunityTopics";

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
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community-replies', variables.topic_id] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
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

  return useMutation({
    mutationFn: async ({ replyId, isLiked }: { replyId: string; isLiked: boolean }) => {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('community_reply_likes')
          .delete()
          .eq('reply_id', replyId)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('community_reply_likes')
          .insert({
            reply_id: replyId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          });

        if (error) throw error;
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
