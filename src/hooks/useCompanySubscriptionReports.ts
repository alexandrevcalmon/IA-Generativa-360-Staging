import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth';

interface CompanySubscriptionReport {
  id: string;
  name: string;
  contact_email: string;
  contact_name: string;
  subscription_status: string;
  subscription_ends_at: string | null;
  max_collaborators: number;
  total_collaborators: number;
  active_collaborators: number;
  blocked_collaborators: number;
  days_until_expiry: number | null;
  is_overdue: boolean;
  last_payment_date: string | null;
  created_at: string;
  subscription_plan_data?: {
    name: string;
    price: number;
  };
  // Novos campos do Stripe
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_data?: {
    status: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    plan_name: string;
    amount: number;
    currency: string;
    subscription_id?: string;
    customer_id?: string;
  };
  error?: string;
}

interface SubscriptionReportsData {
  companies: CompanySubscriptionReport[];
  summary: {
    totalCompanies: number;
    activeSubscriptions: number;
    overdueSubscriptions: number;
    canceledSubscriptions: number;
    totalRevenue: number;
    totalBlockedCollaborators: number;
    companiesAtRisk: number;
    // Novos campos do Stripe
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    churnRate: number;
    lastSyncAt?: string;
  };
  overdueCompanies: CompanySubscriptionReport[];
  atRiskCompanies: CompanySubscriptionReport[];
}

export function useCompanySubscriptionReports() {
  const { user, userRole } = useAuth();

  return useQuery<SubscriptionReportsData>({
    queryKey: ['company-subscription-reports', user?.id],
    queryFn: async () => {
      if (!user?.id || userRole !== 'producer') {
        throw new Error('Apenas produtores podem acessar relatórios de assinaturas');
      }

      console.log('🔄 Fetching Stripe analytics data...');
      
      // Usar a nova Edge Function consolidada
      const { data: analyticsData, error } = await supabase.functions.invoke('get-stripe-analytics', {
        body: {}
      });

      if (error) {
        console.error('❌ Error fetching analytics data:', error);
        throw new Error('Erro ao buscar dados de analytics do Stripe');
      }

      if (!analyticsData?.success) {
        console.error('❌ Analytics function returned error:', analyticsData);
        throw new Error('Erro na função de analytics');
      }

      console.log('✅ Analytics data fetched successfully');
      console.log('📊 Summary:', analyticsData.summary);
      console.log('🏢 Companies processed:', analyticsData.companies?.length || 0);

      return analyticsData;
    },
    enabled: !!user?.id && userRole === 'producer',
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    refetchOnWindowFocus: false,
    retry: 2,
  });
} 
