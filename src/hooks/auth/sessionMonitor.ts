
import { createSessionValidationService } from './sessionValidationService';

interface SessionMonitorProps {
  clearUserState: () => void;
}

export function createSessionMonitor(props: SessionMonitorProps) {
  const { clearUserState } = props;
  const sessionService = createSessionValidationService();

  const setupSessionMonitoring = (isMounted: React.MutableRefObject<boolean>) => {
    const checkSession = async () => {
      if (!isMounted.current) return;
      
      const validation = await sessionService.validateSession();
      
      if (!validation.isValid) {
        if (validation.needsRefresh) {
          console.log('🔄 Session expired during monitoring, attempting refresh...');
          const refreshResult = await sessionService.refreshSession();
          
          if (!refreshResult.isValid) {
            console.log('❌ Session refresh failed during monitoring, clearing state...');
            clearUserState();
          }
        } else if (validation.session) {
          // Session exists but is invalid (not just expired)
          console.log('⚠️ Invalid session detected during monitoring, clearing state...');
          clearUserState();
        }
      }
    };
    
    // Check every 2 minutes instead of 5 for better responsiveness
    const refreshTimer = setInterval(checkSession, 2 * 60 * 1000);
    return refreshTimer;
  };

  return { setupSessionMonitoring };
}
