import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MentorshipNotification {
  id: string;
  mentorship_session_id: string;
  company_id?: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

// Hook para criar notificação de mentoria específica de empresa
export const useCreateMentorshipNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      companyId,
      title,
      message
    }: {
      sessionId: string;
      companyId: string;
      title: string;
      message: string;
    }) => {
      const { data, error } = await supabase
        .from('mentorship_notifications')
        .insert({
          mentorship_session_id: sessionId,
          company_id: companyId,
          notification_type: 'mentorship_created',
          title,
          message
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating mentorship notification:', error);
        throw error;
      }

      return data as MentorshipNotification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-notifications'] });
      toast.success('Notificação enviada para a empresa!');
    },
    onError: (error) => {
      console.error('Error creating mentorship notification:', error);
      toast.error('Erro ao enviar notificação');
    },
  });
};

// Hook para marcar notificação como lida
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('mentorship_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }

      return data as MentorshipNotification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
    },
  });
}; 
