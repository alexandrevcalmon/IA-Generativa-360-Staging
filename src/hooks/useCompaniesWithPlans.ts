
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyWithPlan {
  id: string;
  name: string;
  official_name: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_district: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip_code: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  max_students: number;
  current_students: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  subscription_plan_id: string | null;
  billing_period: 'semester' | 'annual' | null;
  subscription_plan: {
    id: string;
    name: string;
    price: number;
    annual_price: number;
    semester_price: number;
    max_students: number;
  } | null;
}

export const useCompaniesWithPlans = () => {
  return useQuery({
    queryKey: ['companies-with-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          official_name,
          cnpj,
          email,
          phone,
          logo_url,
          address_street,
          address_number,
          address_complement,
          address_district,
          address_city,
          address_state,
          address_zip_code,
          contact_name,
          contact_email,
          contact_phone,
          notes,
          max_students,
          current_students,
          is_active,
          created_at,
          updated_at,
          subscription_plan_id,
          billing_period,
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
        console.error('Error fetching companies with plans:', error);
        throw error;
      }

      return data as CompanyWithPlan[];
    }
  });
};
