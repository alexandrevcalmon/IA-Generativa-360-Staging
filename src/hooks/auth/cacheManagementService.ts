
export const createCacheManagementService = () => {
  const clearBrowserCaches = async () => {
    console.log('🧹 Starting browser cache clearing...');
    
    try {
      // Clear additional browser storage that might cache auth tokens
      if (typeof window !== 'undefined') {
        // Clear any potential cached requests
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
          console.log('🧹 Browser caches cleared');
        }
        
        // Clear IndexedDB data related to Supabase
        if ('indexedDB' in window) {
          try {
            const deleteRequest = indexedDB.deleteDatabase('supabase-auth');
            deleteRequest.onsuccess = () => console.log('🗑️ IndexedDB auth data cleared');
          } catch (idbError) {
            console.log('ℹ️ IndexedDB cleanup skipped (not critical)');
          }
        }
      }
    } catch (cacheError) {
      console.log('ℹ️ Cache clearing skipped (not critical):', cacheError.message);
    }
  };

  return {
    clearBrowserCaches
  };
};
