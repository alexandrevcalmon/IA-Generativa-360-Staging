
import { useMemo } from "react";
import { CollaboratorStats } from "@/hooks/useCollaboratorAnalytics";

export const useCollaboratorAnalyticsFiltering = (
  analytics: CollaboratorStats[],
  searchTerm: string,
  sortBy: string,
  filterStatus: string
) => {
  return useMemo(() => {
    return analytics
      .filter(stat => {
        const matchesSearch = stat.collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             stat.collaborator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (stat.collaborator.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        
        const matchesStatus = filterStatus === "all" || 
                             (filterStatus === "active" && stat.collaborator.is_active) ||
                             (filterStatus === "inactive" && !stat.collaborator.is_active);
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.collaborator.name.localeCompare(b.collaborator.name);
          case "lessons_completed":
            return b.lessons_completed - a.lessons_completed;
          case "total_watch_time_minutes":
            return b.total_watch_time_minutes - a.total_watch_time_minutes;
          case "last_login_at":
            const aDate = a.last_login_at ? new Date(a.last_login_at) : new Date(0);
            const bDate = b.last_login_at ? new Date(b.last_login_at) : new Date(0);
            return bDate.getTime() - aDate.getTime();
          default:
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
      });
  }, [analytics, searchTerm, sortBy, filterStatus]);
};
