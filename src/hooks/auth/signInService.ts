
import { supabase } from '@/integrations/supabase/client';
import { createProducerSignInService } from './producerSignInService';
import { createCompanySignInService } from './companySignInService';
import { createDefaultSignInService } from './defaultSignInService';

export const createSignInService = (toast: any) => {
  const producerService = createProducerSignInService(toast);
  const companyService = createCompanySignInService(toast);
  const defaultService = createDefaultSignInService(toast);

  const signIn = async (email: string, password: string, role?: string) => {
    try {
      console.log(`🔐 [SignInService] Sign-in attempt - Email: ${email}, Role: ${role}`);

      // Validate inputs
      if (!email?.trim() || !password?.trim()) {
        console.error('❌ [SignInService] Missing email or password');
        return { error: { message: 'Email e senha são obrigatórios' } };
      }

      // Producer login path
      if (role === 'producer') {
        console.log(`🏭 [SignInService] Processing producer login for ${email}`);
        return await producerService.signInProducer(email, password);
      }

      // Company login path (explicit role=company)
      if (role === 'company') {
        console.log(`🏢 [SignInService] Processing company login for ${email}`);
        const result = await companyService.signInCompany(email, password);
        
        if (result.error) {
          return result;
        }
        
        if (result.user) {
          if (result.isCompany) {
            console.log(`✅ [SignInService] Company login confirmed for ${email}`);
            return { 
              error: null, 
              user: result.user, 
              session: result.session, 
              needsPasswordChange: result.needsPasswordChange || false
            };
          }
          
          const defaultResult = await defaultService.processDefaultSignIn(result.user, 'company');
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
        return { error: loginError };
      }

      if (loginData.user && loginData.session) {
        console.log(`✅ [SignInService] Login successful for ${loginData.user.email}`);
        const defaultResult = await defaultService.processDefaultSignIn(loginData.user, role);
        return { 
          error: null, 
          user: loginData.user, 
          session: loginData.session, 
          needsPasswordChange: defaultResult.needsPasswordChange || false
        };
      }

      console.error(`❌ [SignInService] No user data received for ${email}`);
      return { error: { message: "Falha na autenticação" } };

    } catch (e: any) {
      console.error(`💥 [SignInService] Critical error for ${email}:`, e);
      return { error: { message: "Erro de conexão - tente novamente" } };
    }
  };

  return { signIn };
};
