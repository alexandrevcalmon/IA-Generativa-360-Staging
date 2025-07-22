
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
      console.log('Toggling collaborator status:', { collaboratorId, companyId, currentStatus });

      // Get current session for debugging
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session?.user?.id);

      // Update the collaborator status
      const { data, error } = await supabase
        .from("company_users")
        .update({ is_active: !currentStatus })
        .eq("id", collaboratorId)
        .select("id, name, is_active")
        .single();

      if (error) {
        console.error("Error toggling collaborator status:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(error.message || "Erro ao alterar status do colaborador");
      }

      console.log('Successfully updated collaborator:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('🔄 Invalidating queries after toggle status...');
      
      // Invalidate company collaborators query
      queryClient.invalidateQueries({ queryKey: ["companyCollaborators", variables.companyId] });
      
      // Invalidate collaborator analytics queries (for producer page)
      queryClient.invalidateQueries({ queryKey: ["collaborator-analytics"] });
      
      console.log('✅ Queries invalidated successfully');
      
      toast.success({
        title: "Status do colaborador alterado!",
        description: `${data.name} foi ${data.is_active ? "desbloqueado(a)" : "bloqueado(a)"}.`
      });
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast.error({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro inesperado."
      });
    },
  });
};
