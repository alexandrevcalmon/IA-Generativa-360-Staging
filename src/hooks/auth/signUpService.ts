
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getRedirectUrl } from './authUtils';

export const createSignUpService = (toast: ReturnType<typeof useToast>['toast']) => {
  const signUp = async (email: string, password: string, role?: string) => {
    try {
      console.log('🔐 SignUp attempt:', email, 'Role:', role);
      
      const redirectUrl = getRedirectUrl();
      console.log('🔄 Using redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: role || 'student'
          }
        }
      });

      if (error) {
        console.error('❌ SignUp error:', error);
        if (error.message.includes('User already registered')) {
          toast({
            title: "Usuário já cadastrado",
            description: "Este email já está em uso. Tente fazer login.",
            variant: "default" 
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive"
          });
        }
        return { error };
      }

      if (data?.user && !data.session) {
        console.log('✅ SignUp successful - confirmation required');
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta.",
          variant: "default"
        });
      } else if (data?.user && data.session) {
        console.log('✅ SignUp successful - auto confirmed');
        toast({
          title: "Cadastro realizado!",
          description: "Bem-vindo à plataforma!",
          variant: "default"
        });
      }

      return { error: null, user: data.user, session: data.session };
    } catch (e: any) {
      console.error('💥 SignUp unexpected error:', e);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o cadastro.",
        variant: "destructive"
      });
      return { error: e };
    }
  };

  return { signUp };
};
