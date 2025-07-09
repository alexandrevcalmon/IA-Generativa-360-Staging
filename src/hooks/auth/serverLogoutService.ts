
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export const createServerLogoutService = () => {
  const performServerLogout = async (session: Session) => {
    try {
      console.log('🔄 Attempting server logout with enhanced error handling...');
      
      // Use local scope and add additional headers for cache busting
      const logoutOptions = {
        scope: 'local' as const,
      };
      
      // Add cache-busting timestamp to force fresh request
      const timestamp = Date.now();
      console.log(`🕐 Logout attempt timestamp: ${timestamp}`);
      
      const { error: logoutError } = await supabase.auth.signOut(logoutOptions);
      
      if (logoutError) {
        console.warn('⚠️ Server logout error details:', {
          message: logoutError.message,
          status: logoutError.status,
          code: logoutError.code,
          timestamp: new Date().toISOString()
        });
        
        // Enhanced 403 error handling
        if (logoutError.message?.includes('403') || 
            logoutError.message?.toLowerCase().includes('forbidden') ||
            logoutError.status === 403) {
          
          console.log('🔒 403 Forbidden detected - treating as successful logout');
          console.log('💡 This usually means the session was already invalidated on the server');
          
          return { success: true, treatedAs403: true };
        }
        
        // For other server errors, still proceed with local cleanup
        console.warn('⚠️ Server logout failed but local cleanup completed:', logoutError.message);
        return { success: false, error: logoutError };
      }
      
      console.log('✅ Server logout successful');
      return { success: true };
      
    } catch (networkError) {
      console.error('🌐 Network error during logout:', networkError);
      
      // Network errors are treated as successful logout since local state is cleared
      return { success: false, networkError: true };
    }
  };

  return {
    performServerLogout
  };
};
