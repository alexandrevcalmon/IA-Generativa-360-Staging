
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
      // Busca o registro atual para obter o auth_user_id
      const { data: current, error: fetchError } = await supabase
        .from('company_users')
        .select('auth_user_id')
        .eq('id', collaboratorId)
        .single();
      if (fetchError || !current?.auth_user_id) {
        throw new Error('Não foi possível localizar o usuário autenticado do colaborador.');
      }
      // Se for alteração de e-mail, chama a Edge Function
      if (data.email) {
        const res = await fetch('/functions/v1/update-collaborator-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
          },
          body: JSON.stringify({
            auth_user_id: current.auth_user_id,
            new_email: data.email,
            company_id: companyId
          })
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Erro ao atualizar e-mail do colaborador.');
        }
        // Remove o campo email do update local, pois já foi sincronizado
        const { email, ...rest } = data;
        data = rest;
      }
      // Atualiza outros campos em company_users
      if (Object.keys(data).length > 0) {
        const { data: updatedData, error } = await supabase
          .from('company_users')
          .update(data)
          .eq('id', collaboratorId)
          .select()
          .single();
        if (error) {
          throw error;
        }
        return updatedData;
      }
      // Se só mudou o e-mail, retorna o registro atualizado
      return { id: collaboratorId };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companyCollaborators", variables.companyId] });
      toast({
        title: "Colaborador atualizado!",
        description: `Os dados foram atualizados com sucesso.`,
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
