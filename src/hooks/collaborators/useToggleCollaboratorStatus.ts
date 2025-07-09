
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Mutation Hook: Toggle Collaborator Status
export const useToggleCollaboratorStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      collaboratorId,
      companyId,
      currentStatus
    }: {
      collaboratorId: string;
      companyId: string;
      currentStatus: boolean
    }) => {
      const { data, error } = await supabase
        .from("company_users")
        .update({ is_active: !currentStatus })
        .eq("id", collaboratorId)
        .select()
        .single();

      if (error) {
        console.error("Error toggling collaborator status:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companyCollaborators", variables.companyId] });
      toast({
        title: "Status do colaborador alterado!",
        description: `${data.name} foi ${data.is_active ? "desbloqueado(a)" : "bloqueado(a)"}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });
};
