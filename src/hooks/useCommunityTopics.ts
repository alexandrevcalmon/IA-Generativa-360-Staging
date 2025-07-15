
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { awardPointsToStudent } from '@/hooks/gamification/useStudentPoints';
import { GAMIFICATION_RULES, DAILY_LIMITS } from '@/hooks/gamification/gamificationRules';
import { useStudentProfile } from '@/hooks/useStudentProfile';

export interface CommunityTopic {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_email: string;
  company_name?: string;
  category: string;
  tags?: string[];
  is_pinned: boolean;
  is_locked: boolean;
  likes_count: number;
  replies_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityReply {
  id: string;
  topic_id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_email: string;
  company_name?: string;
  is_solution: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export const useCommunityTopics = () => {
  return useQuery({
    queryKey: ['community-topics'],
    queryFn: async () => {
      console.log('📊 Fetching community topics...');
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current user:', user?.email || 'Not authenticated');
      
      const { data, error } = await supabase
        .from('community_topics')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching community topics:', error);
        throw error;
      }
      
      console.log('📊 Community topics fetched:', { 
        count: data?.length || 0,
        topics: data?.map(t => ({ id: t.id, title: t.title })) || []
      });
      
      return data as CommunityTopic[];
    }
  });
};

export const useCreateCommunityTopic = () => {
  const queryClient = useQueryClient();
  const { data: studentProfile } = useStudentProfile();

  return useMutation({
    mutationFn: async (topicData: Omit<CommunityTopic, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'replies_count' | 'views_count'>) => {
      console.log('📝 Creating community topic:', topicData.title);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No authenticated user for topic creation');
        throw new Error('User not authenticated');
      }
      const { data, error } = await supabase
        .from('community_topics')
        .insert(topicData)
        .select()
        .single();
      if (error) {
        console.error('❌ Error creating community topic:', error);
        throw error;
      }
      // Após criar o tópico, atribuir pontos
      if (studentProfile?.id) {
        await awardPointsToStudent({
          studentId: studentProfile.id,
          points: GAMIFICATION_RULES.community_topic_created,
          actionType: 'community_topic_created',
          description: `Criou um tópico: ${topicData.title}`,
          referenceId: data.id,
          meta: { topicId: data.id, title: topicData.title },
          checkLimit: true,
          limitPerDay: DAILY_LIMITS.community_topic_created,
          uniquePerReference: true,
        });
      }
      console.log('✅ Community topic created successfully:', data.id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Tópico criado com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Error creating community topic:', error);
      toast.error('Erro ao criar tópico');
    },
  });
};

export const useUpdateCommunityTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CommunityTopic> & { id: string }) => {
      console.log('📝 Updating community topic:', id);
      
      const { data, error } = await supabase
        .from('community_topics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating community topic:', error);
        throw error;
      }
      
      console.log('✅ Community topic updated successfully:', id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Tópico atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Error updating community topic:', error);
      toast.error('Erro ao atualizar tópico');
    },
  });
};

export const useDeleteCommunityTopic = () => {
  const queryClient = useQueryClient();
  const { data: studentProfile } = useStudentProfile();

  return useMutation({
    mutationFn: async (topicId: string) => {
      console.log('🗑️ Deleting community topic:', topicId);
      // Buscar o tópico para pegar o autor
      const { data: topic } = await supabase
        .from('community_topics')
        .select('id, author_id, title')
        .eq('id', topicId)
        .maybeSingle();
      const { error } = await supabase
        .from('community_topics')
        .delete()
        .eq('id', topicId);
      if (error) {
        console.error('❌ Error deleting community topic:', error);
        throw error;
      }
      // Remover pontos do autor se for o mesmo usuário logado
      if (studentProfile?.id && topic?.author_id === studentProfile.id) {
        await awardPointsToStudent({
          studentId: studentProfile.id,
          points: -GAMIFICATION_RULES.community_topic_created,
          actionType: 'community_topic_deleted',
          description: `Tópico removido: ${topic?.title || topicId}`,
          referenceId: topicId,
          meta: { topic_id: topicId },
          uniquePerReference: true
        });
      }
      console.log('✅ Community topic deleted successfully:', topicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Tópico removido com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Error deleting community topic:', error);
      toast.error('Erro ao remover tópico');
    },
  });
};

export const useToggleTopicPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, isPinned }: { topicId: string; isPinned: boolean }) => {
      console.log('📌 Toggling topic pin:', { topicId, isPinned });
      
      const { data, error } = await supabase
        .from('community_topics')
        .update({ is_pinned: isPinned })
        .eq('id', topicId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error toggling topic pin:', error);
        throw error;
      }
      
      console.log('✅ Topic pin toggled successfully:', topicId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Tópico atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Error toggling topic pin:', error);
      toast.error('Erro ao atualizar tópico');
    },
  });
};

export const useToggleTopicLock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, isLocked }: { topicId: string; isLocked: boolean }) => {
      console.log('🔒 Toggling topic lock:', { topicId, isLocked });
      
      const { data, error } = await supabase
        .from('community_topics')
        .update({ is_locked: isLocked })
        .eq('id', topicId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error toggling topic lock:', error);
        throw error;
      }
      
      console.log('✅ Topic lock toggled successfully:', topicId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      toast.success('Tópico atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Error toggling topic lock:', error);
      toast.error('Erro ao atualizar tópico');
    },
  });
};
