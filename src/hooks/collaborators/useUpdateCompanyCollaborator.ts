
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
      console.log('Updating collaborator:', { collaboratorId, companyId, data });

      // Separar email dos outros campos
      const { email, ...otherFields } = data;
      
      let updatedData = null;

      // Tentar atualizar campos básicos diretamente primeiro
      if (Object.keys(otherFields).length > 0) {
        console.log('Attempting direct update for basic fields:', otherFields);
        
        const { data: directUpdateResult, error: directError } = await supabase
          .from('company_users')
          .update({
            ...otherFields,
            updated_at: new Date().toISOString()
          })
          .eq('id', collaboratorId)
          .eq('company_id', companyId)
          .select()
          .single();
        
        if (directError) {
          console.error('Direct update failed:', directError);
          throw new Error(`Erro ao atualizar dados básicos: ${directError.message}`);
        }
        
        updatedData = directUpdateResult;
        console.log('Direct update successful:', updatedData);
      }

      // Se houver mudança de email, usar Edge Function
      if (email) {
        console.log('Email change detected, using Edge Function');
        
        try {
          // Buscar auth_user_id do colaborador
          const { data: collaboratorData, error: fetchError } = await supabase
            .from('company_users')
            .select('auth_user_id')
            .eq('id', collaboratorId)
            .single();
          
          if (fetchError || !collaboratorData?.auth_user_id) {
            throw new Error('Não foi possível localizar o usuário autenticado do colaborador.');
          }

          const { data: emailUpdateResult, error: emailError } = await supabase.functions.invoke('update-collaborator-email', {
            body: {
              auth_user_id: collaboratorData.auth_user_id,
              new_email: email,
              company_id: companyId
            }
          });

          if (emailError) {
            console.error('Edge Function error:', emailError);
            throw new Error(`Erro ao atualizar e-mail: ${emailError.message}`);
          }

          if (!emailUpdateResult || !emailUpdateResult.success) {
            throw new Error(emailUpdateResult?.error || 'Erro ao atualizar e-mail do colaborador.');
          }

          console.log('Email updated successfully via Edge Function');
        } catch (error) {
          console.error('Email update failed:', error);
          throw new Error(`Erro ao atualizar e-mail: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      // Se não temos dados atualizados ainda, buscar os dados finais
      if (!updatedData) {
        const { data: finalData, error: finalError } = await supabase
          .from('company_users')
          .select('*')
          .eq('id', collaboratorId)
          .single();

        if (finalError) {
          throw new Error(`Erro ao buscar dados atualizados: ${finalError.message}`);
        }

        updatedData = finalData;
      }

      return updatedData;
    },
    onSuccess: (data, variables) => {
      console.log('🔄 Invalidating queries after update collaborator...');
      
      queryClient.invalidateQueries({ queryKey: ["companyCollaborators", variables.companyId] });
      
      // Invalidate collaborator analytics queries (for producer page)
      queryClient.invalidateQueries({ queryKey: ["collaborator-analytics"] });
      
      console.log('✅ Queries invalidated successfully');
      
      toast.success({
        title: "Colaborador atualizado!",
        description: `Os dados foram atualizados com sucesso.`
      });
    },
    onError: (error: Error) => {
      console.error('Update collaborator error:', error);
      toast.error({
        title: "Erro ao atualizar colaborador",
        description: error.message || "Ocorreu um erro inesperado."
      });
    },
  });
};
