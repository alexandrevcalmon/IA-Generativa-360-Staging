
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Collaborator } from "./types";

// Query Hook: Get Company Collaborators
export const useGetCompanyCollaborators = (companyId?: string | null) => {
  return useQuery<Collaborator[], Error>({
    queryKey: ["companyCollaborators", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID is required to fetch collaborators.");

      const { data, error } = await supabase
        .from("company_users")
        .select("*") // Select all fields defined in Collaborator interface
        .eq("company_id", companyId)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching company collaborators:", error);
        throw error;
      }
      return data as Collaborator[];
    },
    enabled: !!companyId, // Only run query if companyId is provided
  });
};
