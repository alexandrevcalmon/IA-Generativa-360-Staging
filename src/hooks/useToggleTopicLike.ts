
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useToggleTopicLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, isLiked }: { topicId: string; isLiked: boolean }) => {
      console.log('🔄 Toggling topic like:', { topicId, isLiked });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No authenticated user found');
        throw new Error('User not authenticated');
      }

      console.log('✅ User authenticated:', user.email);

      if (isLiked) {
        // Remove like
        console.log('➖ Removing like for topic:', topicId);
        const { error } = await supabase
          .from('community_topic_likes')
          .delete()
          .eq('topic_id', topicId)
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ Error removing like:', error);
          throw error;
        }
        console.log('✅ Like removed successfully');
      } else {
        // Add like
        console.log('➕ Adding like for topic:', topicId);
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
        console.log('✅ Like added successfully');
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after like toggle');
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['topic-likes'] });
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
