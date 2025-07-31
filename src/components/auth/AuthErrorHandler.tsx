import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Lock, Mail, Wifi, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface AuthErrorHandlerProps {
  error: string | null;
  attempts?: number;
  onRetry?: () => void;
}

export function AuthErrorHandler({ error, attempts = 0, onRetry }: AuthErrorHandlerProps) {
  if (!error) return null;

  const getErrorDetails = (errorMessage: string) => {
    console.log('Processing error message:', errorMessage);
    
    // Tentativas restantes - padrão específico
    if (errorMessage.includes('tentativa') && errorMessage.includes('antes do bloqueio')) {
      return {
        title: 'Credenciais incorretas',
        description: errorMessage,
        variant: 'destructive' as const
      };
    }
    
    // Conta bloqueada
    if (errorMessage.includes('bloqueada') || errorMessage.includes('bloqueio temporário')) {
      return {
        title: 'Conta temporariamente bloqueada',
        description: errorMessage,
        variant: 'destructive' as const
      };
    }
    
    // User-friendly error messages
    if (errorMessage.includes('Invalid login credentials') || 
        errorMessage.includes('Credenciais inválidas') || 
        errorMessage.includes('Email ou senha incorretos')) {
      return {
        title: 'Credenciais incorretas',
        description: 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
        variant: 'destructive' as const
      };
    }
    
    if (errorMessage.includes('Email not confirmed')) {
      return {
        title: 'Email não confirmado',
        description: 'Verifique sua caixa de entrada para confirmar seu email.',
        variant: 'destructive' as const
      };
    }
    
    if (errorMessage.includes('Too many requests')) {
      return {
        title: 'Muitas tentativas',
        description: 'Aguarde alguns minutos antes de tentar novamente.',
        variant: 'destructive' as const
      };
    }
    
    if (errorMessage.includes('missing email') || errorMessage.includes('Email e senha são obrigatórios')) {
      return {
        title: 'Dados obrigatórios',
        description: 'Por favor, preencha email e senha.',
        variant: 'destructive' as const
      };
    }
    
    if (errorMessage.includes('Erro de conexão') || errorMessage.includes('conexão')) {
      return {
        title: 'Problema de conexão',
        description: 'Verifique sua internet e tente novamente.',
        variant: 'destructive' as const
      };
    }
    
    // Generic error
    return {
      title: 'Erro no login',
      description: errorMessage || 'Tente novamente em alguns instantes.',
      variant: 'destructive' as const
    };
  };

  const errorDetails = getErrorDetails(error);

  // Função para determinar o ícone com base no tipo de erro
  const getErrorIcon = (errorMessage: string) => {
    if (errorMessage.includes('bloqueada') || errorMessage.includes('bloqueio temporário')) {
      return <Lock className="h-5 w-5" />;
    } else if (errorMessage.includes('Email não confirmado') || errorMessage.includes('Email not confirmed')) {
      return <Mail className="h-5 w-5" />;
    } else if (errorMessage.includes('Erro de conexão') || errorMessage.includes('conexão')) {
      return <Wifi className="h-5 w-5" />;
    } else if (errorMessage.includes('Muitas tentativas') || errorMessage.includes('Too many requests')) {
      return <Clock className="h-5 w-5" />;
    } else if (errorMessage.includes('Credenciais incorretas') || errorMessage.includes('Invalid login')) {
      return <XCircle className="h-5 w-5" />;
    } else {
      return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const icon = getErrorIcon(error);

  return (
    <Alert 
      variant={errorDetails.variant} 
      className="mb-4 bg-red-900/20 border-red-500/30 text-red-200 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-start">
        <div className="mr-3 text-red-400">
          {icon}
        </div>
        <div className="flex-1">
          <AlertTitle className="text-red-200 font-semibold mb-1">
            {errorDetails.title}
          </AlertTitle>
          <AlertDescription>
            <div className="text-sm text-red-100">{errorDetails.description}</div>
            {attempts >= 3 && (
              <div className="text-xs mt-2 text-red-300/70 italic">
                Várias tentativas falharam. Considere redefinir sua senha se o problema persistir.
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
