import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CompanyData, UpdateCompanyData } from "./types";

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (companyData: CompanyData) => {
      console.log('🏢 Starting company creation process...');
      console.log('📝 Company data received:', companyData);
      
      if (!user) {
        console.log('❌ User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('👤 Creating company with user:', user.id);

      // Preparar dados da empresa para inserção
      const companyInsertData = {
        ...companyData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('💾 Inserting company data:', companyInsertData);

      // Criar a empresa
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([companyInsertData])
        .select()
        .single();

      if (companyError) {
        console.error('❌ Error creating company:', companyError);
        
        // Provide more specific error messages based on the error
        let errorMessage = 'Falha ao criar empresa';
        
        if (companyError.code === '42501') {
          errorMessage = 'Permissão negada. Verifique se você tem permissões para criar empresas.';
        } else if (companyError.code === '23505') {
          errorMessage = 'Já existe uma empresa com essas informações.';
        } else if (companyError.message) {
          errorMessage = `Erro: ${companyError.message}`;
        }
        
        throw new Error(errorMessage);
      }

      console.log('✅ Company created successfully:', company);

      // Tentar criar o usuário de acesso se o email de contato foi fornecido
      if (company.contact_email) {
        console.log('👤 Creating auth user for company contact email:', company.contact_email);
        
        try {
          const { data: authResult, error: authError } = await supabase.functions.invoke(
            'create-company-auth-user',
            {
              body: { 
                email: company.contact_email,
                companyId: company.id,
                companyName: company.name,
                contactName: company.contact_name
              }
            }
          );

          console.log('📧 Auth user creation result:', { authResult, authError });

          if (authError) {
            console.error('❌ Error creating auth user:', authError);
            // Não falhar todo o processo de criação da empresa
            toast({
              title: "Empresa criada com aviso!",
              description: "A empresa foi criada, mas houve um problema ao criar o usuário de acesso. Isso pode ser configurado posteriormente.",
              variant: "default",
            });
          } else if (authResult?.success) {
            console.log('✅ Auth user created successfully:', authResult);
            toast({
              title: "Empresa e usuário criados com sucesso!",
              description: "A empresa foi criada e o usuário de acesso foi configurado. Um email com instruções de login foi enviado.",
            });
          } else {
            console.log('⚠️ Auth user creation returned unexpected result:', authResult);
            toast({
              title: "Empresa criada com sucesso!",
              description: "A empresa foi criada. O usuário de acesso pode precisar ser configurado manualmente.",
              variant: "default",
            });
          }
        } catch (authFunctionError) {
          console.error('❌ Error calling auth function:', authFunctionError);
          // Não falhar todo o processo
          toast({
            title: "Empresa criada com sucesso!",
            description: "A empresa foi criada, mas houve um problema ao configurar o usuário de acesso.",
            variant: "default",
          });
        }
      } else {
        console.log('📧 No contact email provided, skipping auth user creation');
        toast({
          title: "Empresa criada com sucesso!",
          description: "A nova empresa foi adicionada à plataforma.",
        });
      }

      return company;
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries after successful company creation');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies-with-plans'] });
    },
    onError: (error) => {
      console.error('❌ Error in company creation process:', error);
      // Error handling is now done in the component for better UX
    }
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (companyData: UpdateCompanyData) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { id, ...updateData } = companyData;

      console.log('Updating company:', id);
      console.log('Update data:', updateData);
      console.log('Current user:', user.id);

      const { data, error } = await supabase
        .from('companies')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        throw new Error(`Failed to update company: ${error.message}`);
      }

      console.log('Company updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies-with-plans'] });
      queryClient.invalidateQueries({ queryKey: ['company', data.id] });
      toast({
        title: "Empresa atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
    },
    onError: (error) => {
      console.error('Error updating company:', error);
      toast({
        title: "Erro ao atualizar empresa",
        description: `Ocorreu um erro ao atualizar a empresa: ${error.message}`,
        variant: "destructive",
      });
    }
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase
        .from('companies')
        .update({ is_active: false })
        .eq('id', companyId);

      if (error) {
        console.error('Error deactivating company:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies-with-plans'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast({
        title: "Empresa desativada com sucesso!",
        description: "A empresa foi desativada.",
      });
    },
    onError: (error) => {
      console.error('Error deactivating company:', error);
      toast({
        title: "Erro ao desativar empresa",
        description: "Ocorreu um erro ao desativar a empresa.",
        variant: "destructive",
      });
    }
  });
};

export const useToggleCompanyStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: boolean }) => {
      const { error } = await supabase
        .from('companies')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error('Error toggling company status:', error);
        throw error;
      }
    },
    onSuccess: (_, { currentStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies-with-plans'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast({
        title: currentStatus ? "Empresa bloqueada com sucesso!" : "Empresa desbloqueada com sucesso!",
        description: currentStatus ? "A empresa foi bloqueada." : "A empresa foi desbloqueada.",
      });
    },
    onError: (error) => {
      console.error('Error toggling company status:', error);
      toast({
        title: "Erro ao alterar status da empresa",
        description: "Ocorreu um erro ao alterar o status da empresa.",
        variant: "destructive",
      });
    }
  });
};
