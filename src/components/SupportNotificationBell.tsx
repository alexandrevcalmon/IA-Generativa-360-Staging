import React, { useState } from 'react';
import { Bell, Check, X, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useSupportTickets, useSupportTicketRealtime } from '@/hooks/useSupportTickets';
import { useMentorshipDayNotifications } from '@/hooks/useMentorshipDayNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';

export function SupportNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications: supportNotifications = [], markNotificationRead: markSupportRead, isMarkingRead } = useSupportTickets();
  const { notifications: mentorshipNotifications = [], markNotificationRead: markMentorshipRead, unreadCount: mentorshipUnreadCount = 0 } = useMentorshipDayNotifications();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  
  // Ativar notificações em tempo real
  useSupportTicketRealtime();

  // Combinar todas as notificações com tratamento de erro
  const allNotifications = [
    ...(supportNotifications || []).map(n => ({ ...n, type: 'support' as const })),
    ...(mentorshipNotifications || []).map(n => ({ ...n, type: 'mentorship' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalUnreadCount = (supportNotifications || []).filter(n => !n.read_at).length + (mentorshipUnreadCount || 0);
  


  const handleMarkAsRead = async (notification: any) => {
    if (notification.type === 'support') {
      await markSupportRead(notification.id);
    } else if (notification.type === 'mentorship') {
      await markMentorshipRead(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadSupportNotifications = (supportNotifications || []).filter(n => !n.read_at);
    const unreadMentorshipNotifications = (mentorshipNotifications || []).filter(n => !n.read_at);
    
    await Promise.all([
      ...unreadSupportNotifications.map(n => markSupportRead(n.id)),
      ...unreadMentorshipNotifications.map(n => markMentorshipRead(n.id))
    ]);
  };

  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida se não estiver lida
    if (!notification.read_at) {
      await handleMarkAsRead(notification);
    }
    
    if (notification.type === 'support') {
      // Navegar para o ticket
      const ticketUrl = userRole === 'producer' 
        ? `/producer/support/${notification.ticket_id}`
        : `/company/support/${notification.ticket_id}`;
      
      navigate(ticketUrl);
    } else if (notification.type === 'mentorship') {
      // Navegar para a página de mentorias
      const mentorshipUrl = userRole === 'producer' 
        ? '/producer/mentorship'
        : userRole === 'company'
        ? '/company/mentorships'
        : '/student/mentorship';
      
      navigate(mentorshipUrl);
    }
    
    setIsOpen(false); // Fechar o popover
  };

  const getNotificationIcon = (notification: any) => {
    if (notification.type === 'mentorship') {
      return '🎯';
    }
    
    switch (notification.notification_type) {
      case 'new_ticket':
        return '🎫';
      case 'ticket_reply':
        return '💬';
      case 'ticket_status_change':
        return '🔄';
      case 'ticket_assigned':
        return '👤';
      default:
        return '🔔';
    }
  };

  const getNotificationText = (notification: any) => {
    if (notification.type === 'mentorship') {
      const session = notification.mentorship_session;
      if (session) {
        const time = new Date(session.scheduled_at).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return `Mentoria hoje às ${time}: ${session.title}`;
      }
      return 'Mentoria agendada para hoje';
    }
    
    switch (notification.notification_type) {
      case 'new_ticket':
        return 'Novo chamado criado';
      case 'ticket_reply':
        return 'Nova resposta no chamado';
      case 'ticket_status_change':
        return 'Status do chamado alterado';
      case 'ticket_assigned':
        return 'Chamado atribuído a você';
      default:
        return 'Notificação de suporte';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
                       <Button
                 variant="ghost"
                 size="icon"
                 className="relative h-10 w-10 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-200 overflow-visible"
               >
                           <Bell className="h-5 w-5 text-gray-300" />
                 {totalUnreadCount > 0 && (
                   <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 border-2 border-gray-900 shadow-lg animate-pulse">
                     <span className="text-[10px] font-bold text-white leading-none tracking-tight">
                       {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                     </span>
                   </div>
                 )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl"
        align="end"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h4 className="font-semibold text-white">Notificações</h4>
          {totalUnreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingRead}
              className="text-xs text-gray-400 hover:text-white"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-80">
          {allNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="p-2">
              {allNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                      notification.read_at
                        ? 'bg-gray-800/30 hover:bg-gray-800/50'
                        : 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg">
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-white">
                            {getNotificationText(notification)}
                          </p>
                          {!notification.read_at && (
                                                          <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification);
                                }}
                                disabled={isMarkingRead}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                          )}
                        </div>
                        {notification.ticket && (
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.ticket.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  {index < allNotifications.length - 1 && (
                    <Separator className="my-2 bg-gray-700/30" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {allNotifications.length > 0 && (
          <div className="p-3 border-t border-gray-700/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-full text-gray-400 hover:text-white"
            >
              Fechar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
} 
