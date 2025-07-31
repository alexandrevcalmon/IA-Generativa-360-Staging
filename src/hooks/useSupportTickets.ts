import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/use-toast';

// Tipos
export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'bug' | 'feature_request' | 'question' | 'technical_issue' | 'billing' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'closed';
  company_id: string;
  created_by_user_id: string;
  assigned_to_user_id?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  company?: { name: string };
  replies?: SupportTicketReply[];
  attachments?: SupportTicketAttachment[];
  _count?: {
    replies: number;
    notifications: number;
  };
}

export interface SupportTicketReply {
  id: string;
  ticket_id: string;
  content: string;
  author_user_id: string;
  author_role: 'company' | 'producer' | 'system';
  created_at: string;
  updated_at: string;
  author?: { email: string };
}

export interface SupportTicketAttachment {
  id: string;
  ticket_id: string;
  reply_id?: string;
  file_name: string;
  file_url: string;
  file_size_bytes: number;
  file_type: string;
  uploaded_by_user_id: string;
  created_at: string;
}

export interface SupportTicketNotification {
  id: string;
  ticket_id: string;
  user_id: string;
  notification_type: 'new_ticket' | 'ticket_reply' | 'ticket_status_change' | 'ticket_assigned';
  read_at?: string;
  created_at: string;
  ticket?: { title: string; status: string };
}

// Hook principal
export function useSupportTickets() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar tickets
  const getTickets = useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: async () => {
      console.log('🔄 Fetching tickets from API...');
      const { data, error } = await supabase.functions.invoke('support-tickets', {
        body: {
          action: 'get_tickets'
        }
      });

      if (error) throw error;
      console.log('📦 Tickets received:', data.data?.length || 0);
      
      // Log dos primeiros tickets para debug
      if (data.data && data.data.length > 0) {
        data.data.slice(0, 2).forEach((ticket: SupportTicket) => {
          console.log(`📋 Ticket ${ticket.id}: ${ticket._count?.replies || 0} replies`);
        });
      }
      
      return data.data as SupportTicket[];
    },
    enabled: !!user,
    staleTime: 0, // Sempre considerar os dados como stale para forçar refetch
    cacheTime: 1000 * 30, // Cache por apenas 30 segundos
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Buscar ticket específico
  const getTicket = (ticketId: string) => useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      console.log(`🔄 Fetching ticket ${ticketId} from API...`);
      const { data, error } = await supabase.functions.invoke('support-tickets', {
        body: {
          action: 'get_ticket',
          ticket_id: ticketId
        }
      });

      if (error) throw error;
      console.log(`📋 Ticket ${ticketId} received with ${data.data?.replies?.length || 0} replies`);
      return data.data as SupportTicket;
    },
    enabled: !!user && !!ticketId,
    staleTime: 0, // Sempre considerar os dados como stale para forçar refetch
    cacheTime: 1000 * 30, // Cache por apenas 30 segundos
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Criar ticket
  const createTicket = useMutation({
    mutationFn: async (ticketData: {
      title: string;
      description: string;
      category: SupportTicket['category'];
      priority: SupportTicket['priority'];
      company_id: string;
    }) => {
      console.log('Creating ticket with data:', ticketData);
      
      const { data, error } = await supabase.functions.invoke('support-tickets', {
        body: {
          action: 'create_ticket',
          ...ticketData
        }
      });

      console.log('Response from Edge Function:', { data, error });
      
      if (error) throw error;
      return data.data as SupportTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({
        title: 'Chamado criado com sucesso!',
        description: 'Seu chamado foi registrado e será respondido em breve.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar chamado',
        description: 'Tente novamente ou entre em contato conosco.',
        variant: 'destructive',
      });
    },
  });

  // Atualizar ticket
  const updateTicket = useMutation({
    mutationFn: async ({ ticketId, updates }: { ticketId: string; updates: Partial<SupportTicket> }) => {
      console.log('🔄 Updating ticket:', { ticketId, updates });
      
      const { data, error } = await supabase.functions.invoke('support-tickets', {
        body: {
          action: 'update_ticket',
          ticket_id: ticketId,
          updates
        }
      });

      if (error) {
        console.error('❌ Error updating ticket:', error);
        throw error;
      }
      
      console.log('✅ Ticket updated successfully:', data.data);
      return data.data as SupportTicket;
    },
    onSuccess: (data, variables) => {
      console.log('🎉 Update success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.ticketId] });
      toast({
        title: 'Chamado atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error) => {
      console.error('❌ Update mutation error:', error);
      toast({
        title: 'Erro ao atualizar chamado',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Criar resposta
  const createReply = useMutation({
    mutationFn: async ({ ticketId, content }: { ticketId: string; content: string }) => {
      const { data, error } = await supabase.functions.invoke('support-tickets', {
        body: {
          action: 'create_reply',
          ticket_id: ticketId,
          content,
          author_role: userRole === 'producer' ? 'producer' : 'company'
        }
      });

      if (error) throw error;
      return data.data as SupportTicketReply;
    },
    onSuccess: (_, { ticketId }) => {
      // Limpar completamente o cache e forçar refetch
      queryClient.removeQueries({ queryKey: ['support-tickets'] });
      queryClient.removeQueries({ queryKey: ['support-ticket', ticketId] });
      queryClient.removeQueries({ queryKey: ['support-ticket-counts'] });
      queryClient.removeQueries({ queryKey: ['support-notifications'] });
      
      // Forçar refetch imediato dos dados
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['support-tickets'] });
        queryClient.refetchQueries({ queryKey: ['support-ticket', ticketId] });
        queryClient.refetchQueries({ queryKey: ['support-ticket-counts'] });
      }, 100);
      
      toast({
        title: 'Resposta enviada!',
        description: 'Sua resposta foi registrada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar resposta',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Buscar notificações
  const getNotifications = useQuery({
    queryKey: ['support-notifications', user?.id],
    queryFn: async () => {
      console.log('🔔 Fetching notifications for user:', user?.id);
      const { data, error } = await supabase.functions.invoke('support-tickets', {
        body: {
          action: 'get_notifications',
          limit: 20
        }
      });

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
      }
      
      console.log('📦 Notifications fetched:', data.data?.length || 0, 'notifications');
      return data.data as SupportTicketNotification[];
    },
    enabled: !!user,
  });

  // Marcar notificação como lida
  const markNotificationRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase.functions.invoke('support-tickets', {
        body: {
          action: 'mark_notification_read',
          notification_id: notificationId
        }
      });

      if (error) throw error;
      return data.data as SupportTicketNotification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-notifications'] });
    },
  });

  // Contadores
  const getTicketCounts = useQuery({
    queryKey: ['support-ticket-counts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('status');

      if (error) throw error;

      const counts = {
        open: 0,
        in_progress: 0,
        closed: 0,
        total: 0,
      };

      data?.forEach((ticket) => {
        counts[ticket.status as keyof typeof counts]++;
        counts.total++;
      });

      return counts;
    },
    enabled: !!user,
  });

  // Corrigir tickets antigos
  const fixOldTickets = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('support-tickets', {
        body: {
          action: 'fix_old_tickets'
        }
      });

      if (error) throw error;
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-ticket-counts'] });
      toast({
        title: 'Tickets corrigidos!',
        description: `${data.fixedCount} tickets foram corrigidos automaticamente.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao corrigir tickets',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  return {
    // Queries
    tickets: getTickets.data || [],
    isLoading: getTickets.isLoading,
    error: getTickets.error,
    getTicket,
    notifications: getNotifications.data || [],
    isLoadingNotifications: getNotifications.isLoading,
    ticketCounts: getTicketCounts.data,
    
    // Mutations
    createTicket: createTicket.mutate,
    isCreatingTicket: createTicket.isPending,
    updateTicket: updateTicket.mutate,
    isUpdatingTicket: updateTicket.isPending,
    createReply: createReply.mutate,
    isCreatingReply: createReply.isPending,
    markNotificationRead: markNotificationRead.mutate,
    isMarkingRead: markNotificationRead.isPending,
    fixOldTickets: fixOldTickets.mutate,
    isFixingOldTickets: fixOldTickets.isPending,
    
    // Utils
    refetch: getTickets.refetch,
  };
}

// Hook para notificações em tempo real
export function useSupportTicketRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    console.log('🔔 Setting up realtime subscriptions for user:', user.id);

    // Escutar mudanças em tickets
    const ticketsChannel = supabase
      .channel('support_tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
        },
        (payload) => {
          console.log('📋 Ticket change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
          queryClient.invalidateQueries({ queryKey: ['support-ticket-counts'] });
        }
      )
      .subscribe();

    // Escutar mudanças em respostas
    const repliesChannel = supabase
      .channel('support_replies_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_ticket_replies',
        },
        (payload) => {
          console.log('💬 Reply change detected:', payload);
          
          // Invalidar queries relacionadas
          queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
          queryClient.invalidateQueries({ queryKey: ['support-ticket-counts'] });
          
          // Se temos o ticket_id, invalidar também a query específica do ticket
          if (payload.new && payload.new.ticket_id) {
            queryClient.invalidateQueries({ queryKey: ['support-ticket', payload.new.ticket_id] });
            queryClient.refetchQueries({ queryKey: ['support-ticket', payload.new.ticket_id] });
          }
        }
      )
      .subscribe();

    // Escutar mudanças em notificações
    const notificationsChannel = supabase
      .channel('support_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_ticket_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Notification change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['support-notifications'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔔 Cleaning up realtime subscriptions');
      supabase.removeChannel(ticketsChannel);
      supabase.removeChannel(repliesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user, queryClient]);
} 
