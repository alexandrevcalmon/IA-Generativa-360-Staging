
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { useCompanyData } from "./useCompanyData";

export interface CompanyMentorship {
  id: string;
  company_id?: string;
  producer_id?: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  participants_count: number;
  status: string;
  meet_url?: string;
  google_meet_url?: string;
  created_at: string;
  type: 'company' | 'collective' | 'exclusive';
  is_enrolled?: boolean;
}

export const useCompanyMentorships = () => {
  const { user, userRole } = useAuth();
  const { data: companyData } = useCompanyData();

  return useQuery({
    queryKey: ['company-mentorships', user?.id, companyData?.id],
    queryFn: async () => {
      if (!user?.id || !companyData?.id) {
        throw new Error('User not authenticated or company not found');
      }

      console.log('🎯 Fetching mentorships for company:', companyData.id);

      // Fetch company-specific mentorship sessions
      const { data: companyMentorships, error: companyError } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .eq('company_id', companyData.id)
        .order('scheduled_at', { ascending: false });

      if (companyError) {
        console.error('❌ Error fetching company mentorships:', companyError);
        throw companyError;
      }

      // Fetch collective mentorship sessions (producer-created) - agora usando RLS policies
      const { data: collectiveMentorships, error: collectiveError } = await supabase
        .from('producer_mentorship_sessions')
        .select('*')
        .eq('is_active', true)
        .in('status', ['scheduled', 'live'])
        .order('scheduled_at', { ascending: false });

      if (collectiveError) {
        console.error('❌ Error fetching collective mentorships:', collectiveError);
        throw collectiveError;
      }

      console.log('✅ Found company mentorships:', companyMentorships?.length || 0);
      console.log('✅ Found collective mentorships:', collectiveMentorships?.length || 0);

      // Process company mentorships with participant counts
      const companyMentorshipsWithCounts = await Promise.all(
        (companyMentorships || []).map(async (mentorship) => {
          try {
            const { count } = await supabase
              .from('mentorship_attendees')
              .select('*', { count: 'exact', head: true })
              .eq('mentorship_session_id', mentorship.id);

            return {
              ...mentorship,
              participants_count: count || 0,
              type: 'company' as const,
              meet_url: mentorship.meet_url
            };
          } catch (error) {
            console.warn('⚠️ Error fetching participants for company mentorship:', mentorship.id, error);
            return {
              ...mentorship,
              participants_count: 0,
              type: 'company' as const,
              meet_url: mentorship.meet_url
            };
          }
        })
      );

      // Process collective mentorships with participant counts and enrollment status
      const collectiveMentorshipsWithCounts = await Promise.all(
        (collectiveMentorships || []).map(async (mentorship) => {
          try {
            // Get participant count
            const { count } = await supabase
              .from('producer_mentorship_participants')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', mentorship.id);

            // Check if current user is enrolled
            const { data: enrollment } = await supabase
              .from('producer_mentorship_participants')
              .select('id')
              .eq('session_id', mentorship.id)
              .eq('participant_id', user.id)
              .maybeSingle();

            return {
              id: mentorship.id,
              company_id: undefined,
              producer_id: mentorship.producer_id,
              title: mentorship.title,
              description: mentorship.description,
              scheduled_at: mentorship.scheduled_at,
              duration_minutes: mentorship.duration_minutes,
              max_participants: mentorship.max_participants || 100,
              participants_count: count || 0,
              status: mentorship.status,
              meet_url: mentorship.google_meet_url,
              google_meet_url: mentorship.google_meet_url,
              created_at: mentorship.created_at,
              type: mentorship.is_collective ? 'collective' : 'exclusive' as const,
              is_enrolled: !!enrollment
            };
          } catch (error) {
            console.warn('⚠️ Error fetching participants for collective mentorship:', mentorship.id, error);
            return {
              id: mentorship.id,
              company_id: undefined,
              producer_id: mentorship.producer_id,
              title: mentorship.title,
              description: mentorship.description,
              scheduled_at: mentorship.scheduled_at,
              duration_minutes: mentorship.duration_minutes,
              max_participants: mentorship.max_participants || 100,
              participants_count: 0,
              status: mentorship.status,
              meet_url: mentorship.google_meet_url,
              google_meet_url: mentorship.google_meet_url,
              created_at: mentorship.created_at,
              type: mentorship.is_collective ? 'collective' : 'exclusive' as const,
              is_enrolled: false
            };
          }
        })
      );

      // Combine and sort all mentorships by scheduled date
      const allMentorships = [
        ...companyMentorshipsWithCounts,
        ...collectiveMentorshipsWithCounts
      ].sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

      return allMentorships as CompanyMentorship[];
    },
    enabled: !!user?.id && !!companyData?.id && userRole === 'company',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
