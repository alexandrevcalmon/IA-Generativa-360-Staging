import React from 'react';
import { useAccessValidation, AccessValidationParams } from '@/hooks/useAccessValidation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  companyId?: string;
  fallback?: React.ReactNode;
  onAccessDenied?: (error: string) => void;
}

export const AccessGuard: React.FC<AccessGuardProps> = ({
  children,
  requiredRole,
  companyId,
  fallback,
  onAccessDenied
}) => {
  const { user } = useAuth();
  const accessValidation = useAccessValidation();

  // Se não há usuário autenticado, mostrar loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não há validação necessária, mostrar conteúdo
  if (!requiredRole && !companyId) {
    return <>{children}</>;
  }

  // Se ainda não validou, fazer validação
  if (!accessValidation.isSuccess && !accessValidation.isError) {
    const params: AccessValidationParams = {};
    if (requiredRole) params.requiredRole = requiredRole;
    if (companyId) params.companyId = companyId;

    accessValidation.mutate(params);
  }

  // Loading durante validação
  if (accessValidation.isPending) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center space-y-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <p className="text-sm text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Erro na validação
  if (accessValidation.isError) {
    const errorMessage = accessValidation.error?.message || 'Acesso negado';
    
    // Chamar callback se fornecido
    if (onAccessDenied) {
      onAccessDenied(errorMessage);
    }

    // Mostrar fallback personalizado ou padrão
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Acesso Negado</span>
          </CardTitle>
          <CardDescription>
            Você não tem permissão para acessar este recurso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            {errorMessage}
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Voltar
            </Button>
            <Button
              onClick={() => accessValidation.mutate({ requiredRole, companyId })}
              disabled={accessValidation.isPending}
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Acesso validado com sucesso
  if (accessValidation.isSuccess && accessValidation.data?.success) {
    return <>{children}</>;
  }

  // Acesso negado após validação
  const errorMessage = accessValidation.data?.error || 'Acesso negado';
  
  if (onAccessDenied) {
    onAccessDenied(errorMessage);
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span>Acesso Negado</span>
        </CardTitle>
        <CardDescription>
          Você não tem permissão para acessar este recurso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          {errorMessage}
        </p>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Voltar
          </Button>
          <Button
            onClick={() => accessValidation.mutate({ requiredRole, companyId })}
            disabled={accessValidation.isPending}
          >
            Tentar Novamente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componentes específicos para diferentes tipos de acesso
export const CompanyAccessGuard: React.FC<Omit<AccessGuardProps, 'requiredRole'>> = (props) => (
  <AccessGuard {...props} requiredRole="company" />
);

export const ProducerAccessGuard: React.FC<Omit<AccessGuardProps, 'requiredRole'>> = (props) => (
  <AccessGuard {...props} requiredRole="producer" />
);

export const CollaboratorAccessGuard: React.FC<Omit<AccessGuardProps, 'requiredRole'>> = (props) => (
  <AccessGuard {...props} requiredRole="collaborator" />
); 
