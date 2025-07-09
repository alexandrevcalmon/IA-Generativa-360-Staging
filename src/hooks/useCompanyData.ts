
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export interface CompanyData {
  id: string;
  name: string;
  official_name?: string;
  email?: string;
  contact_email?: string;
  phone?: string;
  contact_phone?: string;
  cnpj?: string;
  subscription_plan?: string;
  subscription_plan_id?: string;
  max_students: number;
  current_students: number;
  is_active: boolean;
  created_at: string;
  subscription_plan_data?: {
    id: string;
    name: string;
    price: number;
    max_students: number;
  };
}

export const useCompanyData = () => {
  const { user, userRole } = useAuth();

  return useQuery({
    queryKey: ['company-data', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('🏢 Fetching company data for user:', user.id, 'with role:', userRole);

      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          subscription_plan_data:subscription_plans!companies_subscription_plan_id_fkey (
            id,
            name,
            price,
            max_students
          )
        `)
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching company data:', error);
        throw error;
      }

      if (!data) {
        console.log('⚠️ No company data found for user:', user.id);
        return null;
      }

      console.log('✅ Company data fetched:', data);
      return data as CompanyData;
    },
    enabled: !!user?.id && userRole === 'company',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
