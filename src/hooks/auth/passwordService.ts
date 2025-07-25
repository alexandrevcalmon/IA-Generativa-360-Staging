
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getResetPasswordRedirectUrl } from './authUtils';
import { createAuditService } from './auditService';
import { validateEmail, validatePassword, translateSupabaseError } from './commonAuthUtils';

export const createPasswordService = (toast: ReturnType<typeof useToast>['toast']) => {
  const auditService = createAuditService();
  const resetPassword = async (email: string) => {
    try {
      console.log('🔄 [PasswordService] Reset password attempt for:', email);
      
      // Validate email format
      if (!validateEmail(email.trim())) {
        console.error('❌ [PasswordService] Invalid email format');
        await auditService.logAuthEvent('password_reset', null, email, {
          success: false,
          reason: 'invalid_email_format'
        });
        toast({
          title: "Formato de email inválido",
          description: "Por favor, forneça um endereço de email válido.",
          variant: "destructive"
        });
        return { error: { message: 'Formato de email inválido' } };
      }
      
      // Log password reset attempt
      await auditService.logAuthEvent('password_reset', null, email.trim(), {
        attempt: true
      });
      
      const redirectUrl = getResetPasswordRedirectUrl();
      
      // Use Supabase's built-in reset password system
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('Reset password error:', error);
        
        // Log password reset failure
        await auditService.logAuthEvent('password_reset', null, email.trim(), {
          success: false,
          reason: error.message.includes('User not found') ? 'user_not_found' : 
                 error.message.includes('For security purposes') ? 'rate_limited' : 'reset_error',
          error_message: error.message
        });
        
        if (error.message.includes('User not found')) {
          toast({
            title: "Email não encontrado",
            description: "Não encontramos uma conta com este email. Verifique o endereço ou crie uma nova conta.",
            variant: "destructive",
          });
        } else if (error.message.includes('For security purposes')) {
          toast({
            title: "Limite de tentativas atingido",
            description: "Por segurança, aguarde alguns minutos antes de solicitar outro email de redefinição.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao enviar email",
            description: translateSupabaseError(error),
            variant: "destructive",
          });
        }
        
        return { error };
      } else {
        // Log successful password reset request
        await auditService.logAuthEvent('password_reset', null, email.trim(), {
          success: true,
          email_sent: true
        });
        
        toast({
          title: "Email enviado com sucesso!",
          description: "Verifique sua caixa de entrada e spam para as instruções de redefinição de senha.",
        });
        return { error: null };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível enviar o email. Verifique sua conexão com a internet.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const changePassword = async (newPassword: string, userId?: string, companyUserData?: any) => {
    try {
      console.log('🔐 [PasswordService] Changing password for user:', userId);
      
      // Validate password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        console.error('❌ [PasswordService] Invalid password format');
        await auditService.logAuthEvent('password_change', userId || null, null, {
          success: false,
          reason: 'invalid_password',
          error_message: passwordValidation.message
        });
        toast({
          title: "Senha inválida",
          description: passwordValidation.message || "A senha não atende aos requisitos mínimos.",
          variant: "destructive"
        });
        return { error: { message: passwordValidation.message || 'Senha inválida' } };
      }
      
      // Log password change attempt
      await auditService.logAuthEvent('password_change', userId || null, null, {
        attempt: true
      });
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (!error) {
        console.log('✅ Password changed successfully, updating flags...');
        
        // Get current user to ensure we have the right ID
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id;
        
        // Log successful password change
        await auditService.logAuthEvent('password_change', currentUserId || userId || null, user?.email || null, {
          success: true,
          role: user?.user_metadata?.role || 'unknown'
        });
        
        if (!currentUserId) {
          console.warn('⚠️ No current user found after password change');
          return { error: null };
        }
        
        // Check if it's a company user and update their password change flag
        console.log('📊 Checking for company record...');
        const { data: company, error: companyQueryError } = await supabase
          .from('companies')
          .select('id, needs_password_change')
          .eq('auth_user_id', currentUserId)
          .maybeSingle();
        
        if (!companyQueryError && company) {
          console.log('📊 Found company record, updating password change flag...');
          const { error: updateError } = await supabase
            .from('companies')
            .update({ 
              needs_password_change: false,
              updated_at: new Date().toISOString() 
            })
            .eq('auth_user_id', currentUserId);
          
          if (updateError) {
            console.error('⚠️ Could not update company password change flag:', updateError);
          } else {
            console.log('✅ Company password change flag updated successfully');
          }
        } else {
          console.log('📊 No company record found, checking for collaborator...');
          
          // Check if it's a collaborator
          const { data: collaborator, error: collaboratorQueryError } = await supabase
            .from('company_users')
            .select('id, needs_password_change')
            .eq('auth_user_id', currentUserId)
            .maybeSingle();
          
          if (!collaboratorQueryError && collaborator) {
            console.log('📊 Found collaborator record, updating password change flag...');
            const { error: updateError } = await supabase
              .from('company_users')
              .update({ 
                needs_password_change: false,
                updated_at: new Date().toISOString() 
              })
              .eq('auth_user_id', currentUserId);
            
            if (updateError) {
              console.error('⚠️ Could not update collaborator password change flag:', updateError);
            } else {
              console.log('✅ Collaborator password change flag updated successfully');
            }
          } else {
            console.log('📊 No collaborator record found either');
          }
        }
        
        // Force a small delay to ensure database updates are committed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Senha alterada com sucesso!",
          description: "Sua nova senha foi definida.",
        });
      } else {
        console.error('❌ Password change failed:', error);
        
        // Log password change failure
        await auditService.logAuthEvent('password_change', userId || null, null, {
          success: false,
          reason: error.message.includes('New password should be different') ? 'same_password' :
                 error.message.includes('Password should be at least') ? 'weak_password' : 'change_error',
          error_message: error.message
        });
        
        if (error.message.includes('New password should be different')) {
          toast({
            title: "Senha inválida",
            description: "A nova senha deve ser diferente da atual.",
            variant: "destructive",
          });
        } else if (error.message.includes('Password should be at least')) {
          toast({
            title: "Senha muito fraca",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao alterar senha",
            description: translateSupabaseError(error),
            variant: "destructive",
          });
        }
      }

      return { error };
    } catch (error) {
      console.error('Change password error:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível alterar a senha. Verifique sua conexão com a internet.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return { resetPassword, changePassword };
};
