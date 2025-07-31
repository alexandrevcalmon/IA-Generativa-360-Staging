import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyData } from "@/hooks/useCompanyData";

export interface SeatLimitInfo {
  maxCollaborators: number;
  activeCollaborators: number;
  availableSeats: number;
  isAtLimit: boolean;
  canAddMore: boolean;
}

export const useSeatLimit = () => {
  const { data: companyData } = useCompanyData();

  return useQuery<SeatLimitInfo>({
    queryKey: ['seat-limit', companyData?.id],
    queryFn: async () => {
      if (!companyData?.id) {
        throw new Error('Company data not available');
      }

      console.log('🪑 Checking seat limit for company:', companyData.id);

      // Get max collaborators from company data
      const maxCollaborators = companyData.max_collaborators || 5;

      // Count active collaborators
      const { count: activeCount, error } = await supabase
        .from('company_users')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyData.id)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error counting active collaborators:', error);
        throw error;
      }

      const activeCollaborators = activeCount || 0;
      const availableSeats = Math.max(0, maxCollaborators - activeCollaborators);
      const isAtLimit = activeCollaborators >= maxCollaborators;
      const canAddMore = !isAtLimit;

      console.log('📊 Seat limit info:', {
        maxCollaborators,
        activeCollaborators,
        availableSeats,
        isAtLimit,
        canAddMore
      });

      return {
        maxCollaborators,
        activeCollaborators,
        availableSeats,
        isAtLimit,
        canAddMore
      };
    },
    enabled: !!companyData?.id,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

// Hook para verificar se é possível adicionar N colaboradores
export const useCanAddCollaborators = (count: number = 1) => {
  const { data: seatInfo } = useSeatLimit();
  
  return {
    canAdd: seatInfo ? seatInfo.availableSeats >= count : false,
    availableSeats: seatInfo?.availableSeats || 0,
    needed: count,
    shortfall: seatInfo ? Math.max(0, count - seatInfo.availableSeats) : count
  };
}; 
