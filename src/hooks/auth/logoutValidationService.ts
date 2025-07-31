
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export const createLogoutValidationService = () => {
  const validateSessionForLogout = async (currentSession: Session | null) => {
    // Check current session state with timeout
    let sessionToValidate = currentSession;
    let sessionError = null;
    
    if (!currentSession) {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 3000)
        );
        
        const result = await Promise.race([sessionPromise, timeoutPromise]);
        sessionToValidate = result.data?.session || null;
        sessionError = result.error;
      } catch (error) {
        console.log('⚠️ Session check failed or timed out:', error.message);
        sessionError = error;
      }
    }
    
    return {
      session: sessionToValidate,
      error: sessionError
    };
  };

  const shouldSkipServerLogout = (session: Session | null, validationResult: any) => {
    // No session found
    if (!session) {
      return { skip: true, reason: 'No session found' };
    }
    
    // Session missing required tokens
    if (!session.access_token || !session.refresh_token) {
      return { skip: true, reason: 'Session missing required tokens' };
    }
    
    // Session already invalid on server
    if (validationResult && !validationResult.isValid && !validationResult.needsRefresh) {
      return { skip: true, reason: 'Session already invalid on server' };
    }
    
    return { skip: false, reason: null };
  };

  return {
    validateSessionForLogout,
    shouldSkipServerLogout
  };
};
