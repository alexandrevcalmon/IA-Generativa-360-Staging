import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AuthErrorHandlerProps {
  error: string | null;
  attempts?: number;
  onRetry?: () => void;
}

export function AuthErrorHandler({ error, attempts = 0, onRetry }: AuthErrorHandlerProps) {
  if (!error) return null;

  const getErrorDetails = (errorMessage: string) => {
    // User-friendly error messages
    if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Credenciais inválidas')) {
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

  return (
    <Alert variant={errorDetails.variant} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="font-medium">{errorDetails.title}</div>
        <div className="text-sm mt-1">{errorDetails.description}</div>
        {attempts >= 3 && (
          <div className="text-xs mt-2 text-muted-foreground">
            Várias tentativas falharam. Considere redefinir sua senha se o problema persistir.
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}