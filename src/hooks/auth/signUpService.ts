
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getRedirectUrl } from './authUtils';
import { createAuditService } from './auditService';
import { validateEmail, validatePassword, translateSupabaseError } from './commonAuthUtils';

export const createSignUpService = (toast: ReturnType<typeof useToast>['toast']) => {
  const auditService = createAuditService();
  const signUp = async (email: string, password: string, role?: string) => {
    try {
      console.log('🔐 SignUp attempt:', email, 'Role:', role);
      
      // Validate email format
      if (!validateEmail(email.trim())) {
        console.error('❌ [SignUpService] Invalid email format');
        await auditService.logAuthEvent('signup', null, email, {
          success: false,
          reason: 'invalid_email_format',
          role: role || 'student'
        });
        toast.error({
          title: "Formato de email inválido",
          description: "Por favor, forneça um endereço de email válido."
        });
        return { error: { message: 'Formato de email inválido' } };
      }
      
      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        console.error('❌ [SignUpService] Invalid password format');
        await auditService.logAuthEvent('signup', null, email, {
          success: false,
          reason: 'invalid_password',
          role: role || 'student'
        });
        toast.error({
          title: "Senha inválida",
          description: passwordValidation.message || "A senha não atende aos requisitos mínimos."
        });
        return { error: { message: passwordValidation.message || 'Senha inválida' } };
      }
      
      const redirectUrl = getRedirectUrl();
      console.log('🔄 Using redirect URL:', redirectUrl);

      // Log signup attempt
      await auditService.logAuthEvent('signup', null, email, {
        attempt: true,
        role: role || 'student'
      });

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
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
        
        // Log signup failure
        await auditService.logAuthEvent('signup', null, email, {
          success: false,
          reason: error.message.includes('User already registered') ? 'user_already_exists' : 'signup_error',
          error_message: error.message,
          role: role || 'student'
        });
        
        if (error.message.includes('User already registered')) {
          toast.info({
            title: "Usuário já cadastrado",
            description: "Este email já está em uso. Tente fazer login."
          });
        } else {
          toast.error({
            title: "Erro no cadastro",
            description: translateSupabaseError(error)
          });
        }
        return { error };
      }

      if (data?.user && !data.session) {
        console.log('✅ SignUp successful - confirmation required');
        
        // Log successful signup with confirmation required
        await auditService.logAuthEvent('signup', data.user.id, email, {
          success: true,
          confirmation_required: true,
          role: role || 'student',
          user_id: data.user.id
        });
        
        toast.success({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta."
        });
      } else if (data?.user && data.session) {
        console.log('✅ SignUp successful - auto confirmed');
        
        // Log successful signup with auto confirmation
        await auditService.logAuthEvent('signup', data.user.id, email, {
          success: true,
          confirmation_required: false,
          auto_confirmed: true,
          role: role || 'student',
          user_id: data.user.id
        });
        
        toast.success({
          title: "Cadastro realizado!",
          description: "Bem-vindo à plataforma!"
        });
      }

      return { error: null, user: data.user, session: data.session };
    } catch (e: any) {
      console.error('💥 SignUp unexpected error:', e);
      toast.error({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o cadastro."
      });
      return { error: e };
    }
  };

  return { signUp };
};
