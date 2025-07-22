Este plano técnico implementa um sistema robusto de controle de acesso baseado em assinatura, com período de carência, avisos antecipados e interfaces de usuário apropriadas para cada cenário.

Implementação do Sistema de Controle de Assinatura
1. Hook de Verificação de Status (useSubscriptionStatus)
Verificar status da assinatura em tempo real
Calcular período de carência (3 dias)
Determinar dias até expiração
Cache inteligente com refetch automático
2. Componente SubscriptionGuard
Verificar permissões baseadas em assinatura
Implementar lógica de bloqueio/aviso
Tela de bloqueio personalizada por role
Banner de aviso para vencimentos próximos
3. Integração com Layouts Existentes
Atualizar CompanyLayout com SubscriptionGuard
Atualizar StudentLayout para colaboradores
Manter acesso total para producers
4. Componentes de Interface
SubscriptionBlockedScreen com ações contextuais
SubscriptionWarningBanner para avisos
Diferentes mensagens por role (company/collaborator)
5. Sistema de Logs e Monitoramento
Logging detalhado de acessos bloqueados
Métricas de uso durante período de carência
Debug information para troubleshooting
6. Tratamento de Casos Edge
Fallback em caso de erro na verificação
Período de carência configurável
Suporte a diferentes status do Stripe




// Estrutura atual da tabela companies
interface CompaniesTable {
  // Campos de assinatura Stripe existentes
  stripe_customer_id: string | null;
  subscription_status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';
  subscription_id: string | null;
  current_period_end: timestamp | null;
  trial_end: timestamp | null;
  
  // Outros campos relevantes
  is_active: boolean; // Default: true
  max_students: number; // Default: 100
  current_students: number; // Default: 0
}

// Sistema de autenticação atual
interface AuthContextType {
  user: User | null;
  userRole: 'producer' | 'company' | 'student' | 'collaborator' | null;
  companyUserData: CompanyUserData | null;
  // ... outros métodos
}



// src/hooks/useSubscriptionStatus.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export interface SubscriptionStatus {
  isActive: boolean;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';
  expiresAt: string | null;
  trialEndsAt: string | null;
  planName: string | null;
  isGracePeriod: boolean; // 3 dias após vencimento
  daysUntilExpiration: number | null;
}

export const useSubscriptionStatus = (companyId?: string) => {
  const { user, userRole, companyUserData } = useAuth();
  
  // Determinar company_id baseado no role
  const targetCompanyId = 
    userRole === 'company' ? companyId : 
    userRole === 'collaborator' ? companyUserData?.company_id : 
    null;

  return useQuery({
    queryKey: ['subscription-status', targetCompanyId],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!targetCompanyId) {
        throw new Error('Company ID not available');
      }

      const { data: company, error } = await supabase
        .from('companies')
        .select(`
          subscription_status,
          current_period_end,
          trial_end,
          subscription_plan,
          subscription_plans!companies_subscription_plan_id_fkey (
            name
          )
        `)
        .eq('id', targetCompanyId)
        .single();

      if (error) throw error;

      const now = new Date();
      const expirationDate = company.current_period_end ? 
        new Date(company.current_period_end) : null;
      const trialEnd = company.trial_end ? 
        new Date(company.trial_end) : null;

      // Lógica de período de carência (3 dias)
      const gracePeriodEnd = expirationDate ? 
        new Date(expirationDate.getTime() + (3 * 24 * 60 * 60 * 1000)) : null;
      
      const isInGracePeriod = gracePeriodEnd ? 
        now <= gracePeriodEnd && now > expirationDate : false;

      // Determinar se está ativo
      const isActive = 
        company.subscription_status === 'active' ||
        company.subscription_status === 'trialing' ||
        isInGracePeriod;

      // Calcular dias até expiração
      let daysUntilExpiration = null;
      if (expirationDate && isActive) {
        const diffTime = expirationDate.getTime() - now.getTime();
        daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        isActive,
        status: company.subscription_status,
        expiresAt: company.current_period_end,
        trialEndsAt: company.trial_end,
        planName: company.subscription_plans?.name || company.subscription_plan,
        isGracePeriod: isInGracePeriod,
        daysUntilExpiration
      };
    },
    enabled: !!targetCompanyId && (userRole === 'company' || userRole === 'collaborator'),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
    retry: 3,
  });
};



// src/components/SubscriptionGuard.tsx
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { SubscriptionBlockedScreen } from './SubscriptionBlockedScreen';
import { SubscriptionWarningBanner } from './SubscriptionWarningBanner';

interface SubscriptionGuardProps {
  children: ReactNode;
  showWarnings?: boolean; // Mostrar avisos antes do bloqueio
  gracePeriodAccess?: boolean; // Permitir acesso durante período de carência
}

export function SubscriptionGuard({ 
  children, 
  showWarnings = true,
  gracePeriodAccess = true 
}: SubscriptionGuardProps) {
  const { user, userRole, companyUserData } = useAuth();
  const navigate = useNavigate();
  
  // Hook de status da assinatura
  const { 
    data: subscriptionStatus, 
    isLoading, 
    error,
    refetch 
  } = useSubscriptionStatus();

  // Log para debugging
  useEffect(() => {
    if (subscriptionStatus) {
      console.log('🔒 SubscriptionGuard Status:', {
        userRole,
        companyId: companyUserData?.company_id,
        subscriptionStatus,
        timestamp: new Date().toISOString()
      });
    }
  }, [subscriptionStatus, userRole, companyUserData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Verificando assinatura...</div>
      </div>
    );
  }

  // Error state - permitir acesso em caso de erro para evitar false positives
  if (error) {
    console.error('❌ Erro ao verificar assinatura:', error);
    return (
      <>
        {showWarnings && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="text-yellow-700">
             ⚠️ Não foi possível verificar o status da assinatura. 
              Contate o suporte se o problema persistir.
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  // Não aplicar guard para producers
  if (userRole === 'producer') {
    return <>{children}</>;
  }

  // Não aplicar guard se não for company/collaborator
  if (userRole !== 'company' && userRole !== 'collaborator') {
    return <>{children}</>;
  }

  const { isActive, isGracePeriod, daysUntilExpiration, status } = subscriptionStatus!;

  // Lógica de bloqueio
  const shouldBlock = !isActive || (isGracePeriod && !gracePeriodAccess);
  const shouldShowWarning = isActive && daysUntilExpiration !== null && daysUntilExpiration <= 7;

  if (shouldBlock) {
    return (
      <SubscriptionBlockedScreen 
        subscriptionStatus={subscriptionStatus!}
        onRetry={() => refetch()}
        userRole={userRole}
      />
    );
  }

  return (
    <>
      {showWarnings && shouldShowWarning && (
        <SubscriptionWarningBanner 
          daysUntilExpiration={daysUntilExpiration!}
          isGracePeriod={isGracePeriod}
          onNavigateToPlans={() => navigate('/company/profile?tab=settings')}
        />
      )}
      {children}
    </>
  );
}



// src/components/SubscriptionBlockedScreen.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CreditCard, Calendar, RefreshCw } from 'lucide-react';
import { SubscriptionStatus } from '@/hooks/useSubscriptionStatus';

interface SubscriptionBlockedScreenProps {
  subscriptionStatus: SubscriptionStatus;
  onRetry: () => void;
  userRole: 'company' | 'collaborator';
}

export function SubscriptionBlockedScreen({ 
  subscriptionStatus, 
  onRetry, 
  userRole 
}: SubscriptionBlockedScreenProps) {
  const { status, expiresAt, isGracePeriod } = subscriptionStatus;

  const getTitle = () => {
    switch (status) {
      case 'past_due': return 'Pagamento em Atraso';
      case 'canceled': return 'Assinatura Cancelada';
      case 'inactive': return 'Assinatura Inativa';
      default: return 'Acesso Suspenso';
    }
  };

  const getMessage = () => {
    if (userRole === 'collaborator') {
      return 'O acesso foi suspenso devido ao status da assinatura da empresa. Entre em contato com o administrador da empresa.';
    }
    
    switch (status) {
      case 'past_due':
        return isGracePeriod 
          ? 'Sua assinatura está com pagamento em atraso. Você tem acesso limitado por mais alguns dias.'
          : 'Sua assinatura está com pagamento em atraso. Atualize seus dados de pagamento para restaurar o acesso.';
      case 'canceled':
        return 'Sua assinatura foi cancelada. Reative sua assinatura para continuar usando a plataforma.';
      case 'inactive':
        return 'Sua assinatura está inativa. Ative um plano para acessar a plataforma.';
      default:
        return 'Há um problema com sua assinatura. Entre em contato com o suporte.';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-red-800">
            {getTitle()}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {getMessage()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Informações da assinatura */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className="font-medium capitalize">{status}</span>
            </div>
            {expiresAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Vencimento:</span>
                <span className="font-medium">{formatDate(expiresAt)}</span>
              </div>
            )}
            {isGracePeriod && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                <Calendar className="inline h-3 w-3 mr-1" />
                Período de carência ativo
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="space-y-2 pt-4">
            {userRole === 'company' && (
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/company/profile?tab=settings'}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Gerenciar Assinatura
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar Novamente
            </Button>

            {userRole === 'collaborator' && (
              <Button 
                variant="ghost" 
                className="w-full text-sm" 
                onClick={() => window.location.href = '/auth'}
              >
                Fazer Logout
              </Button>
            )}
          </div>

          {/* Informações de contato */}
          <div className="pt-4 border-t text-center text-xs text-gray-500">
            Precisa de ajuda? Entre em contato com o suporte.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// src/components/CompanyLayout.tsx (atualização)
import { useAuth } from '@/hooks/auth';
import { Navigate, Outlet } from 'react-router-dom';
import { CompanySidebar } from './CompanySidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SubscriptionGuard } from './SubscriptionGuard';

const CompanyLayout = () => {
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'company') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionGuard showWarnings={true} gracePeriodAccess={true}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <CompanySidebar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </SubscriptionGuard>
  );
};

export default CompanyLayout;




// src/components/StudentLayout.tsx (atualização)
import { ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { SubscriptionGuard } from './SubscriptionGuard';

const StudentLayout = () => {
  const { user, loading, userRole } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Permitir acesso para student e collaborator
  if (userRole !== 'student' && userRole !== 'collaborator') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionGuard 
      showWarnings={userRole === 'collaborator'} 
      gracePeriodAccess={true}
    >
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="min-h-screen flex w-full bg-background">
          <StudentSidebar />
          <SidebarInset className="flex-1 flex flex-col">
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SubscriptionGuard>
  );
};

export default StudentLayout;



// src/hooks/auth/types.ts (extensão)
export interface AuthContextType {
  // ... campos existentes
  subscriptionStatus?: SubscriptionStatus | null;
  isSubscriptionActive: boolean;
  refreshSubscription: () => Promise<void>;
}


// src/hooks/auth/AuthProvider.tsx (extensão)
import { useSubscriptionStatus } from '../useSubscriptionStatus';

export function AuthProvider({ children }: { children: ReactNode }) {
  // ... código existente
  
  // Hook de assinatura
  const { 
    data: subscriptionStatus, 
    refetch: refreshSubscription 
  } = useSubscriptionStatus();

  const isSubscriptionActive = subscriptionStatus?.isActive ?? true; // Default true para não bloquear producers

  const value = {
    // ... valores existentes
    subscriptionStatus,
    isSubscriptionActive,
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


// src/components/SubscriptionWarningBanner.tsx
interface SubscriptionWarningBannerProps {
  daysUntilExpiration: number;
  isGracePeriod: boolean;
  onNavigateToPlans: () => void;
}

export function SubscriptionWarningBanner({ 
  daysUntilExpiration, 
  isGracePeriod, 
  onNavigateToPlans 
}: SubscriptionWarningBannerProps) {
  const getBannerColor = () => {
    if (isGracePeriod) return 'bg-red-50 border-red-200 text-red-800';
    if (daysUntilExpiration <= 3) return 'bg-orange-50 border-orange-200 text-orange-800';
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  const getMessage = () => {
    if (isGracePeriod) {
      return '🚨 Sua assinatura expirou! Você tem acesso limitado por mais alguns dias.';
    }
    if (daysUntilExpiration === 1) {
      return ⚠️ Sua assinatura expira amanhã!';
    }
    return `⚠️ Sua assinatura expira em ${daysUntilExpiration} dias.`;
  };

  return (
    <div className={`border-l-4 p-4 ${getBannerColor()}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <p className="font-medium">{getMessage()}</p>
          <p className="text-sm mt-1">
            Renove sua assinatura para continuar usando todos os recursos.
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={onNavigateToPlans}
          className="ml-4"
        >
          Renovar Agora
        </Button>
      </div>
    </div>
  );
}



// src/hooks/__tests__/useSubscriptionStatus.test.ts
describe('useSubscriptionStatus', () => {
  test('should return active status for active subscription', async () => {
    // Mock company with active subscription
    // Assert isActive = true
  });

  test('should return inactive for past_due beyond grace period', async () => {
    // Mock company with past_due subscription > 3 days
    // Assert isActive = false
  });

  test('should return active during grace period', async () => {
    // Mock company with past_due subscription < 3 days
    // Assert isActive = true, isGracePeriod = true
  });

  test('should handle trial period correctly', async () => {
    // Mock company in trial period
    // Assert proper trial handling
  });
});



// src/utils/subscriptionLogger.ts
export const subscriptionLogger = {
  logAccessBlocked: (userId: string, companyId: string, reason: string) => {
    console.warn('🚫 Subscription Access Blocked:', {
      userId,
      companyId,
      reason,
      timestamp: new Date().toISOString()
    });
  },

  logGracePeriodAccess: (userId: string, companyId: string, daysRemaining: number) => {
    console.info('⏰ Grace Period Access:', {
      userId,
      companyId,
      daysRemaining,
      timestamp: new Date().toISOString()
    });
  },

  logSubscriptionCheck: (companyId: string, status: SubscriptionStatus) => {
    console.info('✅ Subscription Check:', {
      companyId,
      status,
      timestamp: new Date().toISOString()
    });
  }
};



