
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "./types";

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      console.log('🔍 Fetching companies...');
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          subscription_plan:subscription_plan_id (
            id,
            name,
            price,
            annual_price,
            semester_price,
            max_students
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }

      console.log('📦 Companies fetched:', data?.length || 0, 'companies');
      return data as Company[];
    }
  });
};

export const useCompanyById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Company ID is required');
      }

      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          subscription_plan:subscription_plan_id (
            id,
            name,
            price,
            annual_price,
            semester_price,
            max_students
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching company:', error);
        throw error;
      }

      return data as Company | null;
    },
    enabled: !!id
  });
};
