
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createSessionValidationService } from './sessionValidationService';
import { createCacheManagementService } from './cacheManagementService';
import { createSessionCleanupService } from './sessionCleanupService';
import { createLogoutValidationService } from './logoutValidationService';
import { createServerLogoutService } from './serverLogoutService';

export const createSignOutService = (toast: ReturnType<typeof useToast>['toast']) => {
  const sessionService = createSessionValidationService();
  const cacheService = createCacheManagementService();
  const cleanupService = createSessionCleanupService();
  const validationService = createLogoutValidationService();
  const serverLogoutService = createServerLogoutService();
  
  // Flag to prevent multiple simultaneous logout attempts
  let isLoggingOut = false;
  
  const signOut = async () => {
    // Prevent multiple simultaneous logout attempts
    if (isLoggingOut) {
      console.log('🚫 Logout already in progress, skipping duplicate request');
      return { error: null };
    }
    
    isLoggingOut = true;
    console.log('🚪 Starting enhanced logout with 403 protection...');
    
    try {
      // Always clear local data first to prevent UI inconsistencies
      cleanupService.clearLocalSession();
      
      // Force clear browser cache and storage more aggressively
      await cacheService.clearBrowserCaches();
      
      // Validate current session
      const { session: currentSession, error: sessionError } = await validationService.validateSessionForLogout(null);
      
      if (sessionError) {
        console.log('❌ Error getting session during logout:', sessionError.message);
        // Treat session errors as successful logout
        toast({
          title: "Logout realizado",
          description: "Sessão encerrada com segurança.",
        });
        return { error: null };
      }
      
      if (!currentSession) {
        console.log('ℹ️ No session found, logout completed locally');
        toast({
          title: "Logout realizado",
          description: "Sessão já estava encerrada.",
        });
        return { error: null };
      }
      
      // Check if we should skip server logout
      const validation = await sessionService.validateSession(currentSession);
      const skipResult = validationService.shouldSkipServerLogout(currentSession, validation);
      
      if (skipResult.skip) {
        console.log(`⚠️ ${skipResult.reason}, skipping server logout`);
        toast({
          title: "Logout realizado",
          description: "Sessão encerrada localmente.",
        });
        return { error: null };
      }
      
      // Perform server logout
      console.log('🔍 Valid session found, attempting enhanced server logout...');
      const logoutResult = await serverLogoutService.performServerLogout(currentSession);
      
      if (logoutResult.success || logoutResult.treatedAs403) {
        toast({
          title: "Logout realizado com sucesso!",
          description: "Até mais!",
        });
      } else if (logoutResult.networkError) {
        toast({
          title: "Logout realizado",
          description: "Sessão encerrada localmente devido a problema de rede.",
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Sessão encerrada localmente. Cache do navegador foi limpo.",
        });
      }
      
      return { error: null };
      
    } catch (error) {
      console.error('💥 Unexpected error during enhanced logout:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Always ensure local state is cleared even on errors
      cleanupService.clearLocalSession();
      
      toast({
        title: "Logout realizado",
        description: "Sessão encerrada com limpeza de segurança completa.",
      });
      
      return { error: null }; // Always allow navigation
    } finally {
      // Reset the logout flag
      isLoggingOut = false;
      console.log('🏁 Logout process completed, flag reset');
    }
  };

  return { signOut };
};
