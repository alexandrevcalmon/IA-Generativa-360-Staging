import React, { useState, useEffect } from 'react';
import { supabase, checkCorsIssues, clearAuthSession } from '@/integrations/supabase/client';
import { useAuthErrorHandler } from '@/hooks/auth/useAuthErrorHandler';

interface DebugInfo {
  corsStatus: boolean;
  authStatus: boolean;
  networkStatus: boolean;
  localStorageStatus: boolean;
  sessionStatus: any;
  lastError?: string;
}

export const AuthDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    corsStatus: false,
    authStatus: false,
    networkStatus: true,
    localStorageStatus: false,
    sessionStatus: null
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { checkConnectionHealth, refreshSession } = useAuthErrorHandler({
    autoRedirect: false,
    showNotifications: false
  });

  const runDiagnostics = async () => {
    setIsLoading(true);
    
    try {
      // Verificar CORS
      const corsOk = await checkCorsIssues();
      
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      
      // Verificar sessão
      const { data: { session } } = await supabase.auth.getSession();
      
      // Verificar localStorage
      const storageKey = 'sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1].split('.')[0] + '-auth-token';
      const hasLocalStorage = !!localStorage.getItem(storageKey);
      
      // Verificar conectividade
      const connectionHealth = await checkConnectionHealth();
      
      setDebugInfo({
        corsStatus: corsOk,
        authStatus: !!user,
        networkStatus: connectionHealth.online,
        localStorageStatus: hasLocalStorage,
        sessionStatus: session,
        lastError: undefined
      });
    } catch (error: any) {
      setDebugInfo(prev => ({
        ...prev,
        lastError: error.message
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshSession = async () => {
    setIsLoading(true);
    try {
      const success = await refreshSession();
      if (success) {
        await runDiagnostics();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = () => {
    clearAuthSession();
    runDiagnostics();
  };

  useEffect(() => {
    if (isVisible) {
      runDiagnostics();
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-50"
        title="Debug Auth"
      >
        🔧
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">🔧 Debug Auth</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 rounded text-sm ${debugInfo.corsStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            CORS: {debugInfo.corsStatus ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded text-sm ${debugInfo.authStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Auth: {debugInfo.authStatus ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded text-sm ${debugInfo.networkStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Network: {debugInfo.networkStatus ? '✅' : '❌'}
          </div>
          <div className={`p-2 rounded text-sm ${debugInfo.localStorageStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Storage: {debugInfo.localStorageStatus ? '✅' : '❌'}
          </div>
        </div>

        {/* Session Info */}
        {debugInfo.sessionStatus && (
          <div className="bg-gray-50 p-2 rounded text-xs">
            <div><strong>Session:</strong> {debugInfo.sessionStatus.user?.email}</div>
            <div><strong>Expires:</strong> {new Date(debugInfo.sessionStatus.expires_at * 1000).toLocaleString()}</div>
          </div>
        )}

        {/* Error Display */}
        {debugInfo.lastError && (
          <div className="bg-red-50 border border-red-200 p-2 rounded text-xs text-red-800">
            <strong>Last Error:</strong> {debugInfo.lastError}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={runDiagnostics}
            disabled={isLoading}
            className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? '🔄' : '🔍'} Check
          </button>
          <button
            onClick={handleRefreshSession}
            disabled={isLoading}
            className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleClearSession}
            className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Environment Info */}
        <div className="bg-gray-50 p-2 rounded text-xs">
          <div><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL?.slice(0, 30)}...</div>
          <div><strong>Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 20)}...</div>
        </div>
      </div>
    </div>
  );
}; 