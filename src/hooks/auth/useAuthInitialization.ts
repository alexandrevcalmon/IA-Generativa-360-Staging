
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from './useAuthState';
import { createAuthStateHandler } from './authStateHandler';
import { createAuthInitializer } from './authInitializer';
import { createSessionMonitor } from './sessionMonitor';

export function useAuthInitialization() {
  const authState = useAuthState();
  const isMountedRef = useRef(true);
  
  const {
    setSession,
    setUser,
    setUserRole,
    setNeedsPasswordChange,
    setCompanyUserData,
    setLoading,
    setIsInitialized,
    clearUserState,
  } = authState;

  const authStateHandler = createAuthStateHandler({
    setSession,
    setUser,
    setUserRole,
    setNeedsPasswordChange,
    setCompanyUserData,
    setLoading,
    setIsInitialized,
    clearUserState,
  });

  const authInitializer = createAuthInitializer({
    handleAuthStateChange: authStateHandler.handleAuthStateChange,
    setLoading,
    setIsInitialized,
    clearUserState,
  });

  const sessionMonitor = createSessionMonitor({
    clearUserState,
  });

  useEffect(() => {
    console.log('🚀 Initializing Enhanced AuthProvider with improved session management...');
    isMountedRef.current = true;
    let refreshTimer: NodeJS.Timeout | null = null;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;
      await authStateHandler.handleAuthStateChange(event, session);
    });

    // Initialize auth state
    authInitializer.initializeAuth(isMountedRef);

    // Set up periodic session monitoring
    refreshTimer = sessionMonitor.setupSessionMonitoring(isMountedRef);

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, []);

  return authState;
}
