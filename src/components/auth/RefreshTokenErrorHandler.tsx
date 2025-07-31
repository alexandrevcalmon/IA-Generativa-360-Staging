import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { createSessionCleanupService } from '@/hooks/auth/sessionCleanupService';

interface RefreshTokenErrorHandlerProps {
  error?: Error | null;
  onRetry?: () => void;
  onRedirect?: () => void;
}

export function RefreshTokenErrorHandler({ 
  error, 
  onRetry, 
  onRedirect 
}: RefreshTokenErrorHandlerProps) {
  const [isHandling, setIsHandling] = useState(false);
  const cleanupService = createSessionCleanupService();

  useEffect(() => {
    // Interceptar erros de refresh token globalmente
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || '';
      
      if (errorMessage.includes('refresh_token') || 
          errorMessage.includes('isExpired') ||
          errorMessage.includes('400') ||
          errorMessage.includes('Cannot read properties of undefined')) {
        
        console.warn('🔄 Refresh token error intercepted globally:', event.reason);
        
        // Prevenir o erro de ser tratado como não capturado
        event.preventDefault();
        
        // Limpar sessão local
        cleanupService.clearLocalSession();
        
        // Redirecionar para login após um breve delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [cleanupService]);

  const handleRetry = async () => {
    setIsHandling(true);
    try {
      // Limpar sessão local primeiro
      cleanupService.clearLocalSession();
      
      // Tentar obter uma nova sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Failed to get session after cleanup:', sessionError);
        // Redirecionar para login
        window.location.href = '/login';
        return;
      }
      
      if (session) {
        console.log('✅ Session recovered after cleanup');
        onRetry?.();
      } else {
        console.log('ℹ️ No session available, redirecting to login');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('❌ Error during retry:', error);
      window.location.href = '/login';
    } finally {
      setIsHandling(false);
    }
  };

  const handleRedirect = () => {
    cleanupService.clearLocalSession();
    onRedirect?.() || (window.location.href = '/login');
  };

  // Verificar se o erro é relacionado a refresh token
  const isRefreshTokenError = error?.message?.includes('refresh_token') ||
                             error?.message?.includes('isExpired') ||
                             error?.message?.includes('400') ||
                             error?.message?.includes('Cannot read properties of undefined');

  if (!isRefreshTokenError) {
    return null;
  }

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Erro de Sessão</AlertTitle>
      <AlertDescription className="text-red-700">
        Sua sessão expirou ou está inválida. Isso pode acontecer quando:
        <ul className="mt-2 list-disc list-inside space-y-1">
          <li>Você ficou muito tempo inativo</li>
          <li>Houve um problema com a conexão</li>
          <li>Sua sessão foi invalidada por segurança</li>
        </ul>
      </AlertDescription>
      
      <div className="mt-4 flex gap-2">
        <Button
          onClick={handleRetry}
          disabled={isHandling}
          variant="outline"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isHandling ? 'animate-spin' : ''}`} />
          {isHandling ? 'Tentando...' : 'Tentar Novamente'}
        </Button>
        
        <Button
          onClick={handleRedirect}
          variant="default"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Fazer Login
        </Button>
      </div>
    </Alert>
  );
} 