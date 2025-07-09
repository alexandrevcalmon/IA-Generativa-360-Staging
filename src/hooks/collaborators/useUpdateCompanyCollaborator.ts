
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UpdateCollaboratorData } from "./types";

// Mutation Hook: Update Company Collaborator
export const useUpdateCompanyCollaborator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      collaboratorId,
      companyId,
      data
    }: {
      collaboratorId: string;
      companyId: string;
      data: UpdateCollaboratorData
    }) => {
      // TODO: Implement email change in auth.users (requires admin privileges or specific flow).
      if (data.email) {
        console.warn("Attempting to change email in company_users. Auth.users email update is not yet implemented.");
        // Consider if you want to prevent email changes from here or allow them only in company_users table.
      }

      const { data: updatedData, error } = await supabase
        .from("company_users")
        .update(data)
        .eq("id", collaboratorId)
        .select()
        .single();

      if (error) {
        console.error("Error updating company collaborator:", error);
        throw error;
      }
      return updatedData;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companyCollaborators", variables.companyId] });
      toast({
        title: "Colaborador atualizado!",
        description: `Os dados de ${data.name} foram atualizados.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar colaborador",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
};
