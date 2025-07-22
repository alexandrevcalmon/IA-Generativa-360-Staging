import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Mutation Hook: Resend Activation Email
export const useResendActivationEmail = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      collaboratorId,
      companyId
    }: {
      collaboratorId: string;
      companyId: string;
    }) => {
      console.log('Resending activation email for:', { collaboratorId, companyId });

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      // Call the Edge Function to resend activation email
      const { data, error } = await supabase.functions.invoke('resend-activation-email', {
        body: {
          collaboratorId,
          companyId
        }
      });

      if (error) {
        console.error("Edge Function error:", error);
        throw new Error(error.message || "Erro ao chamar função de reenvio de e-mail");
      }

      if (!data) {
        throw new Error("Nenhum dado retornado da função de reenvio");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log("Successfully resent activation email:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('🔄 Invalidating queries after resend email...');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["companyCollaborators", variables.companyId] });
      
      // Invalidate collaborator analytics queries (for producer page)
      queryClient.invalidateQueries({ queryKey: ["collaborator-analytics"] });
      
      console.log('✅ Queries invalidated successfully');
      
      toast.success({
        title: "E-mail reenviado!",
        description: data.message || "E-mail de ativação foi reenviado com sucesso."
      });
    },
    onError: (error: any) => {
      console.error("Error in resend activation email mutation:", error);
      toast.error({
        title: "Erro ao reenviar e-mail",
        description: error.message || "Ocorreu um erro inesperado ao reenviar o e-mail."
      });
    }
  });
}; 