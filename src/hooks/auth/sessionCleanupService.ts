
export const createSessionCleanupService = () => {
  const clearLocalSession = () => {
    console.log('🧹 Starting comprehensive session cleanup...');
    
    try {
      // Clear ALL localStorage first
      const allLocalKeys = [...Object.keys(localStorage)];
      console.log(`🔍 Clearing ${allLocalKeys.length} localStorage keys`);
      
      allLocalKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`🗑️ Cleared localStorage: ${key}`);
        } catch (keyError) {
          console.warn(`⚠️ Failed to clear localStorage key ${key}:`, keyError.message);
        }
      });

      // Clear ALL sessionStorage
      const allSessionKeys = [...Object.keys(sessionStorage)];
      console.log(`🔍 Clearing ${allSessionKeys.length} sessionStorage keys`);
      
      allSessionKeys.forEach(key => {
        try {
          sessionStorage.removeItem(key);
          console.log(`🗑️ Cleared sessionStorage: ${key}`);
        } catch (keyError) {
          console.warn(`⚠️ Failed to clear sessionStorage key ${key}:`, keyError.message);
        }
      });

      // Force clear browser IndexedDB if accessible
      try {
        if (typeof indexedDB !== 'undefined') {
          // Clear Supabase's internal IndexedDB storage
          indexedDB.deleteDatabase('supabase-gotrue');
          console.log('🗑️ Cleared Supabase IndexedDB');
        }
      } catch (idbError) {
        console.log('ℹ️ IndexedDB cleanup skipped:', idbError.message);
      }

      // Clear any cookies related to auth
      try {
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.toLowerCase().includes('supabase') || name.toLowerCase().includes('auth')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            console.log(`🗑️ Cleared cookie: ${name}`);
          }
        });
      } catch (cookieError) {
        console.log('ℹ️ Cookie cleanup skipped:', cookieError.message);
      }
      
      console.log('✅ Comprehensive session cleanup completed');
    } catch (error) {
      console.error('❌ Error during session cleanup:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  };

  const emergencyCleanup = () => {
    console.log('🚨 Emergency cleanup initiated...');
    
    try {
      // Nuclear option - clear everything
      localStorage.clear();
      sessionStorage.clear();
      
      // Force reload to clear any memory state
      setTimeout(() => {
        window.location.href = '/auth?cleared=true';
      }, 100);
      
      console.log('✅ Emergency cleanup completed - redirecting');
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
      // Last resort - force page reload
      window.location.reload();
    }
  };

  return {
    clearLocalSession,
    emergencyCleanup
  };
};
