
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './auth';

export interface StudentProfileData {
  id: string;
  auth_user_id: string;
  company_id: string;
  name: string;
  email: string;
  position?: string;
  phone?: string;
  is_active: boolean;
  companies?: {
    id: string;
    name: string;
  };
}

export const useStudentProfile = () => {
  const { user } = useAuth();

  return useQuery<StudentProfileData | null>({
    queryKey: ['student-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('🔍 Fetching student profile for user:', user.id);

      const { data, error } = await supabase
        .from('company_users')
        .select(`
          *,
          companies (
            id,
            name
          )
        `)
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching student profile:', error);
        throw error;
      }

      console.log('✅ Student profile data:', data);
      return data as StudentProfileData | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
