import { useEffect } from 'react';
import { useCheckMentorshipDayNotifications } from '@/hooks/useMentorshipDayNotifications';
import { useAuth } from '@/hooks/auth/useAuth';

export function MentorshipDayNotificationChecker() {
  const { user, userRole, loading } = useAuth();
  const { checkMentorshipDayNotifications } = useCheckMentorshipDayNotifications();

  // Check mentorship day notifications when user logs in
  useEffect(() => {
    if (user && userRole && !loading) {
      // Aguardar um pouco para garantir que o usuário está completamente carregado
      const timer = setTimeout(() => {
        checkMentorshipDayNotifications();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, userRole, loading, checkMentorshipDayNotifications]);

  return null; // Este componente não renderiza nada
} 
