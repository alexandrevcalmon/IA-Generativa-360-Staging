import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para que a próxima renderização mostre a UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Atualiza o state com informações do erro
    this.setState({
      error,
      errorInfo
    });

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleClearStorage = () => {
    try {
      // Limpar localStorage e sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpar cookies relacionados ao Supabase
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.includes('supabase') || name.includes('auth')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
      
      console.log('🧹 Storage cleared successfully');
      
      // Recarregar a página
      window.location.reload();
    } catch (error) {
      console.error('Error clearing storage:', error);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Se há um fallback customizado, use-o
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de fallback padrão
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
          <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white">
                Algo deu errado
              </CardTitle>
              <CardDescription className="text-gray-300">
                Ocorreu um erro inesperado. Tente uma das opções abaixo.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Informações do erro (apenas em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-600">
                  <h4 className="text-sm font-medium text-red-400 mb-2">Detalhes do Erro:</h4>
                  <p className="text-xs text-gray-400 mb-1">
                    <strong>Mensagem:</strong> {this.state.error.message}
                  </p>
                  <p className="text-xs text-gray-400 mb-1">
                    <strong>Stack:</strong> {this.state.error.stack?.split('\n')[0]}
                  </p>
                  {this.state.errorInfo && (
                    <p className="text-xs text-gray-400">
                      <strong>Component:</strong> {this.state.errorInfo.componentStack?.split('\n')[1]?.trim()}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold h-12"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white h-12"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir para o Início
                </Button>
                
                <Button
                  onClick={this.handleClearStorage}
                  variant="ghost"
                  className="w-full text-gray-400 hover:bg-gray-700 hover:text-white h-12"
                >
                  Limpar Dados e Recarregar
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-600/30">
                <p className="text-xs text-gray-400 text-center">
                  Se o problema persistir, entre em contato com o suporte
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar o Error Boundary em componentes funcionais
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
} 