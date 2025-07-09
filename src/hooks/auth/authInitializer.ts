
import { createSessionValidationService } from './sessionValidationService';

interface AuthInitializerProps {
  handleAuthStateChange: (event: string, session: any) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
  clearUserState: () => void;
}

export function createAuthInitializer(props: AuthInitializerProps) {
  const { handleAuthStateChange, setLoading, setIsInitialized, clearUserState } = props;
  const sessionService = createSessionValidationService();

  const initializeAuth = async (isMounted: React.MutableRefObject<boolean>) => {
    try {
      console.log('🔍 Checking for existing session...');
      const validation = await sessionService.validateSession();
      
      if (!validation.isValid && validation.needsRefresh) {
        console.log('🔄 Session expired during init, attempting refresh...');
        const refreshResult = await sessionService.refreshSession();
        
        if (refreshResult.isValid && refreshResult.session && isMounted.current) {
          console.log('✅ Session refreshed during initialization');
          await handleAuthStateChange('SIGNED_IN', refreshResult.session);
          return;
        }
      }
      
      if (validation.isValid && validation.session && isMounted.current) {
        console.log('✅ Found valid existing session');
        await handleAuthStateChange('SIGNED_IN', validation.session);
      } else {
        console.log('ℹ️ No valid session found during initialization');
        if (isMounted.current) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    } catch (error) {
      console.error('💥 Error during auth initialization:', error);
      if (isMounted.current) {
        clearUserState();
        setLoading(false);
        setIsInitialized(true);
      }
    }
  };

  return { initializeAuth };
}
