
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateCollaboratorData } from "./types";

// Mutation Hook: Add Company Collaborator using Edge Function (Simplified Flow)
export const useAddCompanyCollaborator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (collaboratorData: CreateCollaboratorData) => {
      console.log("Starting collaborator creation via Edge Function (simplified flow) for:", collaboratorData.email);

      // Validar apenas campos básicos obrigatórios
      if (!collaboratorData.company_id || !collaboratorData.name || !collaboratorData.email || 
          !collaboratorData.position) {
        throw new Error("Campos obrigatórios: Nome, E-mail e Cargo devem ser preenchidos");
      }

      try {
        // Call the Edge Function to create the collaborator (simplified payload)
        const { data, error } = await supabase.functions.invoke('create-collaborator-v2', {
          body: {
            company_id: collaboratorData.company_id,
            name: collaboratorData.name,
            email: collaboratorData.email,
            phone: collaboratorData.phone || null,
            position: collaboratorData.position,
            needs_complete_registration: true
          }
        });

        if (error) {
          console.error("Edge Function error:", error);
          throw new Error(error.message || "Erro ao chamar função de criação de colaborador");
        }

        if (!data) {
          throw new Error("Nenhum dado retornado da função de criação");
        }

        if (data.error) {
          throw new Error(data.error);
        }

        console.log("Successfully created collaborator via Edge Function (simplified):", data.data);
        return data;

      } catch (error) {
        console.error("Error in addCollaborator mutation:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companyCollaborators", variables.company_id] });
      queryClient.invalidateQueries({ queryKey: ["seat-limit", variables.company_id] });
      
      const isReactivation = data.isReactivation;
      const invitationSent = data.invitationSent;
      
      let description = `${variables.name} foi cadastrado com sucesso.`;
      if (isReactivation) {
        description = `${variables.name} foi reativado com sucesso.`;
      } else if (invitationSent) {
        description = `${variables.name} foi cadastrado e receberá um e-mail para completar o cadastro.`;
      }

      toast.success({
        title: isReactivation ? "Colaborador reativado!" : "Colaborador cadastrado!",
        description: description
      });
    },
    onError: (error: Error) => {
      console.error("Error adding collaborator:", error);
      toast.error({
        title: "Erro ao cadastrar colaborador",
        description: error.message || "Ocorreu um erro inesperado."
      });
    },
  });
};
