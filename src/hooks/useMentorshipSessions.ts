
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MentorshipSession {
  id: string;
  producer_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants?: number;
  google_meet_url?: string;
  google_meet_id?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MentorshipParticipant {
  id: string;
  session_id: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  company_name?: string;
  registered_at: string;
  attended?: boolean;
  joined_at?: string;
  left_at?: string;
}

export const useMentorshipSessions = () => {
  return useQuery({
    queryKey: ['mentorship-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('producer_mentorship_sessions')
        .select('*')
        .eq('is_active', true)
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.error('Error fetching mentorship sessions:', error);
        throw error;
      }
      return data as MentorshipSession[];
    },
  });
};

export const useCreateMentorshipSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: Omit<MentorshipSession, 'id' | 'producer_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('producer_mentorship_sessions')
        .insert({
          ...sessionData,
          producer_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating mentorship session:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-sessions'] });
      toast.success('Sessão de mentoria criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating mentorship session:', error);
      toast.error('Erro ao criar sessão de mentoria');
    },
  });
};

export const useUpdateMentorshipSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MentorshipSession> }) => {
      const { data, error } = await supabase
        .from('producer_mentorship_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating mentorship session:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-sessions'] });
      toast.success('Sessão atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating mentorship session:', error);
      toast.error('Erro ao atualizar sessão');
    },
  });
};

export const useSessionParticipants = (sessionId: string) => {
  return useQuery({
    queryKey: ['session-participants', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('producer_mentorship_participants')
        .select('*')
        .eq('session_id', sessionId)
        .order('registered_at', { ascending: true });

      if (error) {
        console.error('Error fetching session participants:', error);
        throw error;
      }
      return data as MentorshipParticipant[];
    },
    enabled: !!sessionId,
  });
};

// New hook to check user registrations
export const useUserMentorshipRegistrations = () => {
  return useQuery({
    queryKey: ['user-mentorship-registrations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('producer_mentorship_participants')
        .select('session_id')
        .eq('participant_id', user.id);

      if (error) {
        console.error('Error fetching user registrations:', error);
        throw error;
      }
      return data.map(item => item.session_id);
    },
  });
};

export const useRegisterForMentorship = () => {
  const queryClient = useQueryClient();

  return {
    registerForMentorship: async (sessionId: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Check if user is already registered for this session
        const { data: existingRegistration } = await supabase
          .from('producer_mentorship_participants')
          .select('id')
          .eq('session_id', sessionId)
          .eq('participant_id', user.id)
          .single();

        if (existingRegistration) {
          toast.error('Você já está inscrito nesta sessão!');
          return;
        }

        // Get company user info for additional details
        const { data: companyUser } = await supabase
          .from('company_users')
          .select(`
            *,
            companies (
              name
            )
          `)
          .eq('auth_user_id', user.id)
          .single();

        const { data, error } = await supabase
          .from('producer_mentorship_participants')
          .insert({
            session_id: sessionId,
            participant_id: user.id,
            participant_name: companyUser?.name || user.user_metadata?.name || user.email || 'User',
            participant_email: user.email || '',
            company_name: companyUser?.companies?.name || undefined,
          })
          .select()
          .single();

        if (error) {
          console.error('Error registering for mentorship:', error);
          throw error;
        }

        queryClient.invalidateQueries({ queryKey: ['session-participants', sessionId] });
        queryClient.invalidateQueries({ queryKey: ['mentorship-sessions'] });
        queryClient.invalidateQueries({ queryKey: ['user-mentorship-registrations'] });
        toast.success('Inscrição realizada com sucesso!');
        return data;
      } catch (error) {
        console.error('Error in registerForMentorship:', error);
        toast.error('Erro ao se inscrever. Tente novamente.');
        throw error;
      }
    }
  };
};

// Novo hook: mentorias em que o usuário está inscrito
export const useMyMentorshipSessions = () => {
  return useQuery({
    queryKey: ['my-mentorship-sessions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Buscar sessões em que o usuário está inscrito
      const { data: registrations, error: regError } = await supabase
        .from('producer_mentorship_participants')
        .select('session_id')
        .eq('participant_id', user.id);
      if (regError) throw regError;
      const sessionIds = registrations?.map(r => r.session_id) || [];
      if (sessionIds.length === 0) return [];

      // Buscar detalhes das sessões
      const { data: sessions, error: sessError } = await supabase
        .from('producer_mentorship_sessions')
        .select('*')
        .in('id', sessionIds)
        .order('scheduled_at', { ascending: true });
      if (sessError) throw sessError;
      return sessions as MentorshipSession[];
    },
  });
};
