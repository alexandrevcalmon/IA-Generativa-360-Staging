import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/use-toast';

// Tipos
export interface MentorshipDayNotification {
  id: string;
  user_id: string;
  mentorship_session_id: string;
  notification_type: 'mentorship_today' | 'mentorship_reminder';
  read_at?: string;
  created_at: string;
  scheduled_date: string;
  company_id?: string;
  user_role: 'collaborator' | 'company' | 'producer';
  mentorship_session?: {
    id: string;
    title: string;
    description?: string;
    scheduled_at: string;
    duration_minutes: number;
    is_collective: boolean;
    target_company_id?: string;
    producer_id: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

// Hook principal para buscar notificações
export function useMentorshipDayNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar notificações
  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['mentorship-day-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('mentorship_day_notifications')
        .select(`
          *,
          mentorship_session:producer_mentorship_sessions!mentorship_day_notifications_mentorship_session_id_fkey(
            id,
            title,
            description,
            scheduled_at,
            duration_minutes,
            is_collective,
            target_company_id,
            producer_id
          ),
          company:companies!mentorship_day_notifications_company_id_fkey(
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching mentorship day notifications:', error);
        throw error;
      }

      return data as MentorshipDayNotification[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  });

  // Marcar notificação como lida
  const markNotificationRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('mentorship_day_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-day-notifications', user?.id] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      });
    },
  });

  // Marcar todas as notificações como lidas
  const markAllNotificationsRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('mentorship_day_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user?.id)
        .is('read_at', null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-day-notifications', user?.id] });
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas.",
        variant: "destructive",
      });
    },
  });

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.read_at).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markNotificationRead: markNotificationRead.mutate,
    markAllNotificationsRead: markAllNotificationsRead.mutate,
    isMarkingRead: markNotificationRead.isPending,
    isMarkingAllRead: markAllNotificationsRead.isPending,
  };
}

// Hook para verificar se há mentorias do dia ao fazer login
export function useCheckMentorshipDayNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();

  const checkMentorshipDayNotifications = useMutation({
    mutationFn: async () => {
      if (!user) return;

      // Buscar mentorias do dia para o usuário
      const { data, error } = await supabase
        .from('mentorship_day_notifications')
        .select(`
          *,
          mentorship_session:producer_mentorship_sessions!mentorship_day_notifications_mentorship_session_id_fkey(
            id,
            title,
            description,
            scheduled_at,
            duration_minutes,
            is_collective,
            target_company_id
          )
        `)
        .eq('user_id', user.id)
        .eq('scheduled_date', new Date().toISOString().split('T')[0])
        .is('read_at', null)
        .limit(5);

      if (error) {
        console.error('Error checking mentorship day notifications:', error);
        return;
      }

      // Mostrar notificação para cada mentoria do dia
      data?.forEach((notification) => {
        const session = notification.mentorship_session;
        if (session) {
          const time = new Date(session.scheduled_at).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });

          toast({
            title: "🎯 Mentoria Hoje!",
            description: `${session.title} às ${time}`,
            duration: 8000,
          });
        }
      });
    },
    onError: (error) => {
      console.error('Error checking mentorship day notifications:', error);
    },
  });

  return {
    checkMentorshipDayNotifications: checkMentorshipDayNotifications.mutate,
    isChecking: checkMentorshipDayNotifications.isPending,
  };
} 
