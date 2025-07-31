import { useEffect, useCallback } from 'react';
import { supabase, clearAuthSession, checkCorsIssues } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthErrorHandlerOptions {
  autoRedirect?: boolean;
  showNotifications?: boolean;
}

export const useAuthErrorHandler = (options: AuthErrorHandlerOptions = {}) => {
  const navigate = useNavigate();
  const { autoRedirect = true, showNotifications = true } = options;

  const handleAuthError = useCallback(async (error: any) => {
    console.error('🔐 Auth error detected:', error);

    // Verificar se é um erro de CORS
    const isCorsError = error?.message?.includes('CORS') || 
                       error?.message?.includes('Access-Control-Allow-Origin') ||
                       error?.message?.includes('Failed to fetch');

    // Verificar se é um erro de refresh token
    const isRefreshTokenError = error?.message?.includes('refresh_token') || 
                               error?.message?.includes('isExpired') ||
                               error?.message?.includes('400') ||
                               error?.message?.includes('401');

    if (isCorsError) {
      console.warn('🌐 CORS error detected');
      
      // Tentar verificar problemas de CORS
      const corsOk = await checkCorsIssues();
      if (!corsOk) {
        console.error('❌ CORS issues confirmed');
        
        if (showNotifications) {
          // Aqui você pode adicionar uma notificação para o usuário
          console.warn('⚠️ Problemas de conectividade detectados. Verifique sua conexão.');
        }
      }
    }

    if (isRefreshTokenError) {
      console.warn('🔄 Refresh token error detected');
      
      // Limpar sessão
      clearAuthSession();
      
      if (showNotifications) {
        console.warn('⚠️ Sessão expirada. Redirecionando para login...');
      }
      
      if (autoRedirect) {
        navigate('/login');
      }
    }

    // Se for um erro de autenticação geral
    if (error?.status === 401 || error?.status === 403) {
      console.warn('🔒 Authentication error detected');
      
      if (showNotifications) {
        console.warn('⚠️ Erro de autenticação. Verificando sessão...');
      }
      
      // Verificar se o usuário ainda está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        clearAuthSession();
        
        if (autoRedirect) {
          navigate('/login');
        }
      }
    }
  }, [navigate, autoRedirect, showNotifications]);

  const handleNetworkError = useCallback((error: any) => {
    console.error('🌐 Network error detected:', error);
    
    if (showNotifications) {
      console.warn('⚠️ Problema de conectividade. Verifique sua conexão com a internet.');
    }
  }, [showNotifications]);

  useEffect(() => {
    // Listener para erros não tratados
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      // Verificar se é um erro relacionado à autenticação
      if (error?.message?.includes('auth') || 
          error?.message?.includes('CORS') ||
          error?.message?.includes('refresh_token') ||
          error?.message?.includes('Failed to fetch')) {
        
        event.preventDefault(); // Prevenir o erro padrão do navegador
        handleAuthError(error);
      }
    };

    // Listener para erros de rede
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        console.log('✅ Connection restored');
      } else {
        console.warn('❌ Connection lost');
        handleNetworkError({ message: 'Connection lost' });
      }
    };

    // Adicionar listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [handleAuthError, handleNetworkError]);

  // Função para verificar a saúde da conexão
  const checkConnectionHealth = useCallback(async () => {
    try {
      const corsOk = await checkCorsIssues();
      const { data: { user } } = await supabase.auth.getUser();
      
      return {
        cors: corsOk,
        authenticated: !!user,
        online: navigator.onLine
      };
    } catch (error) {
      console.error('❌ Connection health check failed:', error);
      return {
        cors: false,
        authenticated: false,
        online: navigator.onLine
      };
    }
  }, []);

  // Função para forçar refresh da sessão
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Session refresh failed:', error);
        clearAuthSession();
        
        if (autoRedirect) {
          navigate('/login');
        }
        
        return false;
      }
      
      console.log('✅ Session refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ Session refresh error:', error);
      return false;
    }
  }, [navigate, autoRedirect]);

  return {
    handleAuthError,
    handleNetworkError,
    checkConnectionHealth,
    refreshSession,
    clearAuthSession
  };
}; 