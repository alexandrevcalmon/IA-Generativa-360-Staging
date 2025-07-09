
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCalendarEvents = () => {
  return useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useUpcomingEvents = (limit = 5) => {
  return useQuery({
    queryKey: ['upcoming-events', limit],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_date', now)
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
};
