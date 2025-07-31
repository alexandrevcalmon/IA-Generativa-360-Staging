
import { createContext, ReactNode, useEffect, useState } from 'react';
import { AuthContextType } from './types';
import { useAuthInitialization } from './useAuthInitialization';
import { useAuthMethods } from './useAuthMethods';
import { useAuthErrorHandler } from './useAuthErrorHandler';
import { unifiedRoleService } from './unifiedRoleService';
import { subscriptionMonitorService } from './subscriptionMonitorService';
import { enhancedAuditService } from './enhancedAuditService';
import { MentorshipDayNotificationChecker } from '@/components/MentorshipDayNotificationChecker';
import { logger } from '@/lib/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  logger.debug('AuthProvider: Initializing...');
  
  const authState = useAuthInitialization();
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [subscriptionAlert, setSubscriptionAlert] = useState<any>(null);
  const [isSubscriptionBlocked, setIsSubscriptionBlocked] = useState(false);
  
  // Inicializar o handler de erros de autenticação
  useAuthErrorHandler({
    autoRedirect: true,
    showNotifications: true
  });
  
  const {
    user,
    session,
    loading,
    userRole,
    needsPasswordChange,
    companyUserData,
    isInitialized,
    setUser,
    setSession,
    setUserRole,
    setNeedsPasswordChange,
    setCompanyUserData,
    setLoading,
  } = authState;

  const authMethods = useAuthMethods({
    user,
    companyUserData,
    setUser,
    setSession,
    setUserRole,
    setNeedsPasswordChange,
    setCompanyUserData,
    setLoading,
  });

  // Monitor subscription status for company users
  useEffect(() => {
    if (user && userRole === 'company') {
      const monitorSubscription = async () => {
        try {
          const result = await subscriptionMonitorService.monitorSubscription(user.id);
          setSubscriptionStatus(result.status);
          setSubscriptionAlert(result.alert);
          setIsSubscriptionBlocked(result.shouldBlock);

          // Log subscription events
          if (result.shouldBlock) {
            await enhancedAuditService.logSubscriptionEvent(user.id, 'subscription_blocked', {
              status: result.status.status,
              isExpired: result.status.isExpired,
              daysUntilExpiry: result.status.daysUntilExpiry
            });
          }
        } catch (error) {
          console.error('[AuthProvider] Error monitoring subscription:', error);
        }
      };

      monitorSubscription();
      
      // Set up periodic monitoring (every 5 minutes)
      const interval = setInterval(monitorSubscription, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [user, userRole]);



  // Role helper properties
  const isProducer = userRole === 'producer';
  const isCompany = userRole === 'company';
  const isStudent = userRole === 'student';
  const isCollaborator = userRole === 'collaborator';
  
  logger.debug('AuthProvider current state', {
    user: user?.email,
    userRole,
    isProducer,
    isCompany,
    isStudent,
    isCollaborator,
    loading: loading || !isInitialized,
    isInitialized,
    isSubscriptionBlocked
  });

  const value = {
    user,
    session,
    loading: loading || !isInitialized,
    userRole,
    isProducer,
    isCompany,
    isStudent,
    needsPasswordChange,
    companyUserData,
    subscriptionStatus,
    subscriptionAlert,
    isSubscriptionBlocked,
    ...authMethods,
  };
  logger.debug('AuthProvider: Providing context value');

  return (
    <AuthContext.Provider value={value}>
      <MentorshipDayNotificationChecker />
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
