
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { useCompanyData } from "./useCompanyData";
import { toast } from "sonner";

export const useEnrollInCollectiveMentorship = () => {
  const { user } = useAuth();
  const { data: companyData } = useCompanyData();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user?.id || !companyData?.id) {
        throw new Error('User not authenticated or company not found');
      }

      console.log('📝 Enrolling in collective mentorship session:', sessionId);

      // Get user profile data for enrollment
      const { data: profile } = await supabase
        .from('company_users')
        .select('name, email')
        .eq('auth_user_id', user.id)
        .eq('company_id', companyData.id)
        .maybeSingle();

      if (!profile) {
        throw new Error('User profile not found');
      }

      const { data, error } = await supabase
        .from('producer_mentorship_participants')
        .insert({
          session_id: sessionId,
          participant_id: user.id,
          participant_name: profile.name,
          participant_email: profile.email,
          company_name: companyData.name
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error enrolling in mentorship:', error);
        throw error;
      }

      console.log('✅ Successfully enrolled in mentorship session:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-mentorships'] });
      toast.success('Inscrição realizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('❌ Error enrolling in mentorship:', error);
      if (error.code === '23505') {
        toast.error('Você já está inscrito nesta mentoria');
      } else {
        toast.error('Erro ao se inscrever na mentoria');
      }
    },
  });
};

export const useUnenrollFromCollectiveMentorship = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('🗑️ Unenrolling from collective mentorship session:', sessionId);

      const { error } = await supabase
        .from('producer_mentorship_participants')
        .delete()
        .eq('session_id', sessionId)
        .eq('participant_id', user.id);

      if (error) {
        console.error('❌ Error unenrolling from mentorship:', error);
        throw error;
      }

      console.log('✅ Successfully unenrolled from mentorship session');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-mentorships'] });
      toast.success('Inscrição cancelada com sucesso!');
    },
    onError: (error) => {
      console.error('❌ Error unenrolling from mentorship:', error);
      toast.error('Erro ao cancelar inscrição');
    },
  });
};
