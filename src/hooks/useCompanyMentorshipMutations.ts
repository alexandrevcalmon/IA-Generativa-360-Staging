
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { useCompanyData } from "./useCompanyData";
import { toast } from "sonner";

export interface CreateMentorshipData {
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants?: number;
  meet_url?: string;
}

export const useCreateCompanyMentorship = () => {
  const { user } = useAuth();
  const { data: companyData } = useCompanyData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mentorshipData: CreateMentorshipData) => {
      if (!user?.id || !companyData?.id) {
        throw new Error('User not authenticated or company not found');
      }

      console.log('📝 Creating mentorship session for company:', companyData.id);

      const { data, error } = await supabase
        .from('mentorship_sessions')
        .insert({
          company_id: companyData.id,
          title: mentorshipData.title,
          description: mentorshipData.description,
          scheduled_at: mentorshipData.scheduled_at,
          duration_minutes: mentorshipData.duration_minutes,
          max_participants: mentorshipData.max_participants || 100,
          meet_url: mentorshipData.meet_url,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating mentorship:', error);
        throw error;
      }

      console.log('✅ Mentorship session created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-mentorships'] });
      toast.success('Sessão de mentoria criada com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Error creating mentorship:', error);
      toast.error('Erro ao criar sessão de mentoria');
    },
  });
};

export const useUpdateCompanyMentorship = () => {
  const { user } = useAuth();
  const { data: companyData } = useCompanyData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateMentorshipData> }) => {
      if (!user?.id || !companyData?.id) {
        throw new Error('User not authenticated or company not found');
      }

      console.log('✏️ Updating mentorship session:', id);

      const { data, error } = await supabase
        .from('mentorship_sessions')
        .update(updates)
        .eq('id', id)
        .eq('company_id', companyData.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating mentorship:', error);
        throw error;
      }

      console.log('✅ Mentorship session updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-mentorships'] });
      toast.success('Sessão de mentoria atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Error updating mentorship:', error);
      toast.error('Erro ao atualizar sessão de mentoria');
    },
  });
};

export const useDeleteCompanyMentorship = () => {
  const { user } = useAuth();
  const { data: companyData } = useCompanyData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mentorshipId: string) => {
      if (!user?.id || !companyData?.id) {
        throw new Error('User not authenticated or company not found');
      }

      console.log('🗑️ Deleting mentorship session:', mentorshipId);

      const { error } = await supabase
        .from('mentorship_sessions')
        .delete()
        .eq('id', mentorshipId)
        .eq('company_id', companyData.id);

      if (error) {
        console.error('❌ Error deleting mentorship:', error);
        throw error;
      }

      console.log('✅ Mentorship session deleted');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-mentorships'] });
      toast.success('Sessão de mentoria excluída com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Error deleting mentorship:', error);
      toast.error('Erro ao excluir sessão de mentoria');
    },
  });
};
