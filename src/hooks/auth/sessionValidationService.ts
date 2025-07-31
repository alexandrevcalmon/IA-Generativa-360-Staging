
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { createSessionCleanupService } from './sessionCleanupService';

interface SessionValidationResult {
  isValid: boolean;
  session: Session | null;
  user: User | null;
  needsRefresh: boolean;
  requiresCleanup?: boolean;
  error?: string;
}

export const createSessionValidationService = () => {
  const cleanupService = createSessionCleanupService();

  const validateSession = async (currentSession?: Session | null): Promise<SessionValidationResult> => {
    try {
      console.log('🔍 Validating session with enhanced error handling...', { 
        hasCurrentSession: !!currentSession,
        sessionId: currentSession?.access_token?.substring(0, 10) + '...' || 'none',
        timestamp: new Date().toISOString()
      });
      
      // If we have a current session, validate it first before making API calls
      if (currentSession) {
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = currentSession.expires_at;
        const bufferTime = 5 * 60; // 5 minutes buffer
        
        // Check if session is expired
        if (expiresAt && now >= expiresAt) {
          console.log('⏰ Session expired', {
            now: new Date(now * 1000).toISOString(),
            expiresAt: new Date(expiresAt * 1000).toISOString(),
            timeDiff: now - expiresAt
          });
          
          return {
            isValid: false,
            session: currentSession,
            user: currentSession.user,
            needsRefresh: true
          };
        }
        
        // Check if session is about to expire
        if (expiresAt && now >= (expiresAt - bufferTime)) {
          console.log('⏰ Session expiring soon, needs refresh', {
            timeLeft: `${Math.floor((expiresAt - now) / 60)} minutes`
          });
          return {
            isValid: false,
            session: currentSession,
            user: currentSession.user,
            needsRefresh: true
          };
        }
        
        // Verify token integrity with enhanced checks
        if (!currentSession.access_token || !currentSession.refresh_token) {
          console.warn('⚠️ Session missing critical tokens, cleanup required');
          cleanupService.clearLocalSession();
          return {
            isValid: false,
            session: null,
            user: null,
            needsRefresh: false,
            requiresCleanup: true
          };
        }

        // Additional check for token validity
        if (typeof currentSession.access_token !== 'string' || 
            typeof currentSession.refresh_token !== 'string' ||
            currentSession.access_token.length < 10 ||
            currentSession.refresh_token.length < 10) {
          console.warn('⚠️ Session tokens appear invalid, cleanup required');
          cleanupService.clearLocalSession();
          return {
            isValid: false,
            session: null,
            user: null,
            needsRefresh: false,
            requiresCleanup: true
          };
        }
        
        // Session appears valid
        console.log('✅ Session validation successful (local check)', { 
          userId: currentSession.user?.id,
          timeLeft: `${Math.floor((expiresAt! - now) / 60)} minutes`
        });
        
        return {
          isValid: true,
          session: currentSession,
          user: currentSession.user,
          needsRefresh: false
        };
      }
      
      // No current session provided, get fresh session from Supabase
      const { data: { session: freshSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session validation error:', {
          message: error.message,
          status: error.status,
          code: error.code,
          timestamp: new Date().toISOString()
        });

        // Handle specific error types that require cleanup
        if (error.message?.includes('refresh_token_not_found') || 
            error.message?.includes('Invalid Refresh Token') ||
            error.message?.includes('refresh_token_revoked') ||
            error.message?.includes('isExpired') ||
            error.status === 400) {
          console.log('🧹 Token error detected, cleaning up session...');
          cleanupService.clearLocalSession();
          return {
            isValid: false,
            session: null,
            user: null,
            needsRefresh: false,
            requiresCleanup: true,
            error: error.message
          };
        }
        
        return {
          isValid: false,
          session: null,
          user: null,
          needsRefresh: false,
          error: error.message
        };
      }
      
      // No session exists
      if (!freshSession) {
        console.log('ℹ️ No session found during validation');
        return {
          isValid: false,
          session: null,
          user: null,
          needsRefresh: false
        };
      }
      
      // Validate the fresh session
      return await validateSession(freshSession);
      
    } catch (error: any) {
      console.error('💥 Session validation failed:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      // For critical errors, clean up potentially corrupted state
      if (error.message?.includes('localStorage') || 
          error.message?.includes('JSON') ||
          error.message?.includes('storage') ||
          error.message?.includes('isExpired') ||
          error.message?.includes('Cannot read properties of undefined')) {
        console.log('🧹 Storage error detected, cleaning up...');
        cleanupService.clearLocalSession();
        return {
          isValid: false,
          session: null,
          user: null,
          needsRefresh: false,
          requiresCleanup: true,
          error: 'Session validation failed'
        };
      }

      return {
        isValid: false,
        session: null,
        user: null,
        needsRefresh: false,
        error: 'Session validation failed'
      };
    }
  };

  const refreshSession = async (retryCount = 0): Promise<SessionValidationResult> => {
    const maxRetries = 2;
    
    try {
      console.log(`🔄 Attempting session refresh (attempt ${retryCount + 1}/${maxRetries + 1})...`);
      
      // Verificar se há uma sessão atual antes de tentar refresh
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.refresh_token) {
        console.log('⚠️ No refresh token available for refresh');
        cleanupService.clearLocalSession();
        return {
          isValid: false,
          session: null,
          user: null,
          needsRefresh: false,
          requiresCleanup: true,
          error: 'No refresh token available'
        };
      }
      
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Session refresh failed:', {
          message: error.message,
          status: error.status,
          code: error.code,
          timestamp: new Date().toISOString()
        });

        // Handle specific refresh errors that require cleanup
        if (error.message?.includes('refresh_token_not_found') || 
            error.message?.includes('Invalid Refresh Token') ||
            error.message?.includes('refresh_token_revoked') ||
            error.message?.includes('isExpired') ||
            error.status === 400) {
          console.log('🧹 Invalid refresh token, cleaning up session...');
          cleanupService.clearLocalSession();
          return {
            isValid: false,
            session: null,
            user: null,
            needsRefresh: false,
            requiresCleanup: true,
            error: error.message
          };
        }

        // Retry on network errors
        if (retryCount < maxRetries && (
          error.message?.includes('fetch') || 
          error.message?.includes('network') ||
          error.message?.includes('timeout') ||
          error.status === 0
        )) {
          const delayMs = (retryCount + 1) * 1000;
          console.log(`🔁 Network error, retrying refresh in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return refreshSession(retryCount + 1);
        }
        
        return {
          isValid: false,
          session: null,
          user: null,
          needsRefresh: false,
          error: error.message
        };
      }
      
      if (!session) {
        console.log('⚠️ No session returned after refresh attempt');
        if (retryCount === 0) {
          // Try once more
          return refreshSession(1);
        }
        
        console.log('🧹 Multiple refresh attempts failed, cleaning up...');
        cleanupService.clearLocalSession();
        return {
          isValid: false,
          session: null,
          user: null,
          needsRefresh: false,
          requiresCleanup: true
        };
      }
      
      console.log('✅ Session refresh successful', {
        userId: session.user?.id,
        newExpiresAt: new Date(session.expires_at! * 1000).toISOString(),
        timestamp: new Date().toISOString()
      });
      
      return {
        isValid: true,
        session,
        user: session.user,
        needsRefresh: false
      };
      
    } catch (error: any) {
      console.error('💥 Session refresh error:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      // Retry on critical errors
      if (retryCount < maxRetries) {
        const delayMs = (retryCount + 1) * 2000;
        console.log(`🔁 Critical error, retrying refresh in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return refreshSession(retryCount + 1);
      }
      
      console.log('🧹 Multiple refresh failures, cleaning up session...');
      cleanupService.clearLocalSession();
      return {
        isValid: false,
        session: null,
        user: null,
        needsRefresh: false,
        requiresCleanup: true,
        error: 'Session refresh failed'
      };
    }
  };

  const handleSessionError = async (error: any) => {
    console.log('🔧 Handling session error:', error.message);
    
    const errorHandlers = {
      'refresh_token_not_found': () => {
        console.log('🧹 Refresh token not found - clearing session');
        cleanupService.clearLocalSession();
        return { action: 'redirect_to_auth', requiresCleanup: true };
      },
      'Invalid Refresh Token': () => {
        console.log('🧹 Invalid refresh token - clearing session');
        cleanupService.clearLocalSession();
        return { action: 'redirect_to_auth', requiresCleanup: true };
      },
      'refresh_token_revoked': () => {
        console.log('🧹 Refresh token revoked - clearing session');
        cleanupService.clearLocalSession();
        return { action: 'redirect_to_auth', requiresCleanup: true };
      },
      'isExpired': () => {
        console.log('⏰ Token expired - clearing session');
        cleanupService.clearLocalSession();
        return { action: 'redirect_to_auth', requiresCleanup: true };
      },
      'Cannot read properties of undefined': () => {
        console.log('🔍 Undefined property error - clearing session');
        cleanupService.clearLocalSession();
        return { action: 'redirect_to_auth', requiresCleanup: true };
      },
      'Invalid login credentials': () => {
        console.log('❌ Invalid credentials - user needs to re-authenticate');
        return { action: 'show_error', message: 'Credenciais inválidas. Verifique email e senha.' };
      },
      'Email not confirmed': () => {
        console.log('📧 Email not confirmed');
        return { action: 'show_error', message: 'Email não confirmado. Verifique sua caixa de entrada.' };
      },
      'Cross-Origin-Opener-Policy': () => {
        console.log('🔒 CORS policy error - session issue');
        cleanupService.clearLocalSession();
        return { action: 'redirect_to_auth', message: 'Erro de sessão. Tente fazer login novamente.', requiresCleanup: true };
      }
    };

    for (const [errorType, handler] of Object.entries(errorHandlers)) {
      if (error.message?.includes(errorType)) {
        return handler();
      }
    }

    // Default error handling
    console.log('❓ Unhandled session error, applying default cleanup');
    cleanupService.clearLocalSession();
    return { 
      action: 'redirect_to_auth', 
      message: 'Erro de autenticação. Faça login novamente.', 
      requiresCleanup: true 
    };
  };

  return {
    validateSession,
    refreshSession,
    handleSessionError
  };
};
