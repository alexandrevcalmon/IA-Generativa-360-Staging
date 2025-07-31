import { supabase } from '@/integrations/supabase/client';
import { createProducerSignInService } from './producerSignInService';
import { createCompanySignInService } from './companySignInService';
import { createDefaultSignInService } from './defaultSignInService';
import { createThrottlingService } from './throttlingService';
import { createAuditService } from './auditService';
import { validateEmail, validatePassword, formatErrorMessage, sanitizeUserData } from './commonAuthUtils';

export const createSignInService = (toast: any) => {
  const producerService = createProducerSignInService(toast);
  const companyService = createCompanySignInService(toast);
  const defaultService = createDefaultSignInService(toast);
  const throttlingService = createThrottlingService();
  const auditService = createAuditService();

  const signIn = async (email: string, password: string, role?: string) => {
    try {
      console.log(`🔐 [SignInService] Sign-in attempt - Email: ${email}, Role: ${role}`);

      // Validate inputs
      if (!email?.trim() || !password?.trim()) {
        console.error('❌ [SignInService] Missing email or password');
        await auditService.logAuthEvent('login_failure', null, email, {
          reason: 'missing_credentials',
          role: role || 'unknown'
        });
        return { error: { message: 'Email e senha são obrigatórios' } };
      }

      // Validate email format
      if (!validateEmail(email.trim())) {
        console.error('❌ [SignInService] Invalid email format');
        await auditService.logAuthEvent('login_failure', null, email, {
          reason: 'invalid_email_format',
          role: role || 'unknown'
        });
        return { error: { message: 'Formato de email inválido' } };
      }
      
      // Check throttling before attempting login
      const throttleCheck = await throttlingService.checkLoginAttempts(email.trim());
      if (!throttleCheck.allowed) {
        const minutesLeft = Math.ceil((throttleCheck.lockedUntil!.getTime() - new Date().getTime()) / 60000);
        console.error(`❌ [SignInService] Account locked due to too many attempts: ${email}`);
        
        // Log the blocked attempt
        await auditService.logAuthEvent('login_failure', null, email.trim(), {
          reason: 'account_locked',
          minutes_remaining: minutesLeft,
          role: role || 'unknown'
        });
        
        toast.error({ 
          title: "Acesso Temporariamente Bloqueado", 
          description: `Conta temporariamente bloqueada devido a muitas tentativas. Tente novamente em ${minutesLeft} minutos.`
        });
        
        return { 
          error: { 
            message: `Conta temporariamente bloqueada devido a muitas tentativas. Tente novamente em ${minutesLeft} minutos.` 
          } 
        };
      }

      // Show warning if approaching limit
      if (throttleCheck.remainingAttempts <= 2 && throttleCheck.remainingAttempts > 0) {
        toast.warning({ 
          title: "Atenção", 
          description: `Restam ${throttleCheck.remainingAttempts} tentativas antes do bloqueio temporário.`
        });
      }

      let loginResult: any;

      // Producer login path
      if (role === 'producer') {
        console.log(`🏭 [SignInService] Processing producer login for ${email}`);
        loginResult = await producerService.signInProducer(email.trim(), password.trim());
        
        if (loginResult.error) {
          // Registrar falha de login e obter tentativas restantes
          const { remainingAttempts, isLocked } = await throttlingService.recordFailedLogin(email.trim());
          
          // Registrar evento de auditoria
          await auditService.logAuthEvent('login_failure', null, email.trim(), {
            reason: 'producer_login_failed',
            error_message: loginResult.error.message,
            remaining_attempts: remainingAttempts,
            is_locked: isLocked,
            role: 'producer'
          });
          
          // Preparar mensagem de erro para o usuário
          let errorMessage = "Email ou senha incorretos.";
          
          // Adicionar informação sobre tentativas restantes
          if (remainingAttempts > 0) {
            errorMessage += ` Você tem mais ${remainingAttempts} tentativa${remainingAttempts !== 1 ? 's' : ''} antes do bloqueio temporário.`;
          } else if (isLocked) {
            errorMessage = "Conta temporariamente bloqueada devido a muitas tentativas. Tente novamente mais tarde.";
          }
          
          // Mostrar mensagem de erro para o usuário
          toast.error({
            title: "Falha no Login de Produtor",
            description: errorMessage
          });
          
          // Atualizar a mensagem de erro no resultado
          loginResult.error.message = errorMessage;
        } else if (loginResult.user) {
          await throttlingService.recordSuccessfulLogin(email.trim());
          await auditService.logAuthEvent('login_success', loginResult.user.id, email.trim(), {
            role: 'producer',
            user_data: sanitizeUserData(loginResult.user)
          });
        }
        
        return loginResult;
      }

      // Company login path (explicit role=company)
      if (role === 'company') {
        console.log(`🏢 [SignInService] Processing company login for ${email}`);
        const result = await companyService.signInCompany(email.trim(), password.trim());
        
        if (result.error) {
          // Registrar falha de login e obter tentativas restantes
          const { remainingAttempts, isLocked } = await throttlingService.recordFailedLogin(email.trim());
          
          // Registrar evento de auditoria
          await auditService.logAuthEvent('login_failure', null, email.trim(), {
            reason: 'company_login_failed',
            error_message: result.error.message,
            remaining_attempts: remainingAttempts,
            is_locked: isLocked,
            role: 'company'
          });
          
          // Preparar mensagem de erro para o usuário
          let errorMessage = "Email ou senha incorretos.";
          
          // Adicionar informação sobre tentativas restantes
          if (remainingAttempts > 0) {
            errorMessage += ` Você tem mais ${remainingAttempts} tentativa${remainingAttempts !== 1 ? 's' : ''} antes do bloqueio temporário.`;
          } else if (isLocked) {
            errorMessage = "Conta temporariamente bloqueada devido a muitas tentativas. Tente novamente mais tarde.";
          }
          
          // Mostrar mensagem de erro para o usuário
          toast.error({
            title: "Falha no Login de Empresa",
            description: errorMessage
          });
          
          // Atualizar a mensagem de erro no resultado
          return { ...result, error: { ...result.error, message: errorMessage } };
        }
        
        if (result.user) {
          await throttlingService.recordSuccessfulLogin(email.trim());
          
          if (result.isCompany) {
            console.log(`✅ [SignInService] Company login confirmed for ${email}`);
            await auditService.logAuthEvent('login_success', result.user.id, email.trim(), {
              role: 'company',
              user_data: sanitizeUserData(result.user),
              needs_password_change: result.needsPasswordChange || false
            });
            
            return { 
              error: null, 
              user: result.user, 
              session: result.session, 
              needsPasswordChange: result.needsPasswordChange || false
            };
          }
          
          const defaultResult = await defaultService.processDefaultSignIn(result.user, 'company');
          await auditService.logAuthEvent('login_success', result.user.id, email.trim(), {
            role: 'company',
            user_data: sanitizeUserData(result.user),
            needs_password_change: defaultResult.needsPasswordChange
          });
          
          return { 
            error: null, 
            user: result.user, 
            session: result.session, 
            needsPasswordChange: defaultResult.needsPasswordChange 
          };
        }
      }

      // Default login path - simplified
      console.log(`🔑 [SignInService] Default login for ${email}`);
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim() 
      });

      if (loginError) {
        console.error(`❌ [SignInService] Login failed: ${loginError.message}`);
        
        // Registrar falha de login e obter tentativas restantes
        const { remainingAttempts, isLocked } = await throttlingService.recordFailedLogin(email.trim());
        
        // Registrar evento de auditoria
        await auditService.logAuthEvent('login_failure', null, email.trim(), {
          reason: 'default_login_failed',
          error_message: loginError.message,
          remaining_attempts: remainingAttempts,
          is_locked: isLocked,
          role: role || 'student'
        });
        
        // Preparar mensagem de erro para o usuário
        let errorMessage = "Email ou senha incorretos.";
        
        // Adicionar informação sobre tentativas restantes
        if (remainingAttempts > 0) {
          errorMessage += ` Você tem mais ${remainingAttempts} tentativa${remainingAttempts !== 1 ? 's' : ''} antes do bloqueio temporário.`;
        } else if (isLocked) {
          errorMessage = "Conta temporariamente bloqueada devido a muitas tentativas. Tente novamente mais tarde.";
        }
        
        // Mostrar mensagem de erro para o usuário
        toast.error({
          title: "Falha no Login",
          description: errorMessage
        });
        
        console.log('Returning error message to form:', errorMessage);
        return { error: { ...loginError, message: errorMessage } };
      }

      if (loginData.user && loginData.session) {
        console.log(`✅ [SignInService] Login successful for ${loginData.user.email}`);
        await throttlingService.recordSuccessfulLogin(email.trim());
        
        const defaultResult = await defaultService.processDefaultSignIn(loginData.user, role);
        
        await auditService.logAuthEvent('login_success', loginData.user.id, email.trim(), {
          role: role || loginData.user.user_metadata?.role || 'student',
          user_data: sanitizeUserData(loginData.user),
          needs_password_change: defaultResult.needsPasswordChange
        });
        
        return { 
          error: null, 
          user: loginData.user, 
          session: loginData.session, 
          needsPasswordChange: defaultResult.needsPasswordChange || false
        };
      }

      console.error(`❌ [SignInService] No user data received for ${email}`);
      await throttlingService.recordFailedLogin(email.trim());
      await auditService.logAuthEvent('login_failure', null, email.trim(), {
        reason: 'no_user_data',
        role: role || 'unknown'
      });
      
      return { error: { message: "Falha na autenticação" } };

    } catch (e: any) {
      console.error(`💥 [SignInService] Critical error for ${email}:`, e);
      await throttlingService.recordFailedLogin(email.trim());
      await auditService.logAuthEvent('login_failure', null, email.trim(), {
        reason: 'critical_error',
        error_message: e.message,
        role: role || 'unknown'
      });
      
      return { error: { message: "Erro de conexão - tente novamente" } };
    }
  };

  return { signIn };
};
