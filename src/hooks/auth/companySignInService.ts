
import { supabase } from '@/integrations/supabase/client';
import { checkCompanyByEmail, createCompanyAuthUser, updateUserMetadata } from './authUtils';

export const createCompanySignInService = (toast: any) => {
  const signInCompany = async (email: string, password: string) => {
    console.log(`[CompanySignIn] Attempting company sign-in. Email: ${email}`);
    
    const { data: loginAttempt, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      console.error(`[CompanySignIn] Initial login attempt failed for ${email}. Error: ${loginError.message}`);
      
      if (loginError.message.includes('Invalid login credentials')) {
        console.log(`[CompanySignIn] Invalid credentials - checking if this is a company registration case.`);
        const { companies, companySearchError } = await checkCompanyByEmail(email);

        if (companySearchError) {
          console.error(`[CompanySignIn] Error checking company by email ${email}: ${companySearchError.message}`);
          toast({ title: "Erro no login", description: "Email ou senha incorretos.", variant: "destructive" });
          return { error: new Error("Invalid login credentials") };
        }

        if (companies && companies.length > 0) {
          const company = companies[0];
          console.log(`[CompanySignIn] Company ${company.name} found. Attempting to create/link auth user.`);
          const { data: createResult, error: createError } = await createCompanyAuthUser(email, company.id);

          if (createError || !createResult?.success) {
            console.error(`[CompanySignIn] Failed to create/link auth user for company ${company.id}. Error: ${createError?.message}`);
            toast({ title: "Falha ao vincular usuário à empresa", description: createError?.message || "Erro desconhecido na função Edge.", variant: "destructive" });
            return { error: createError || new Error("Failed Edge Function createCompanyAuthUser")};
          }

          console.log(`[CompanySignIn] Auth user created/linked for ${company.name}. Retrying login.`);
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({ email, password });
          if (retryError) {
            console.error(`[CompanySignIn] Retry login failed for ${email} after company link. Error: ${retryError.message}`);
            toast({ title: "Erro no Login", description: "Falha ao tentar login após vincular à empresa.", variant: "destructive" });
            return { error: retryError };
          }

          if (retryData.user) {
            console.log(`[CompanySignIn] Retry login successful for ${email}. Updating metadata to 'company'.`);
            await updateUserMetadata({ role: 'company', company_id: company.id, company_name: company.name });
            toast({ title: "Login de Empresa bem-sucedido!", description: "Bem-vindo! Sua senha precisa ser alterada." });
            return { error: null, user: retryData.user, session: retryData.session, needsPasswordChange: true };
          }
          console.error(`[CompanySignIn] Retry login for ${email} for company flow succeeded but user data is missing.`);
          return { error: new Error("User data not found on company retry.") };
        } else {
          console.log(`[CompanySignIn] No company found with email ${email}. Allowing general login attempt.`);
          toast({ title: "Credenciais inválidas", description: "Email ou senha incorretos.", variant: "destructive" });
          return { error: new Error("Invalid login credentials") };
        }
      }
      
      if (loginError.message.includes('Email not confirmed')) {
        toast({ title: "Email não confirmado", description: "Verifique seu email para confirmação.", variant: "destructive"});
      } else {
        toast({ title: "Credenciais Inválidas", description: "Email ou senha incorretos.", variant: "destructive"});
      }
      return { error: loginError };
    }

    // Login successful - check if user should have company role
    if (loginAttempt.user) {
      console.log(`[CompanySignIn] Login successful for ${email}. Checking company association.`);
      
      // Check if this user is associated with a company
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name')
        .eq('auth_user_id', loginAttempt.user.id)
        .maybeSingle();

      if (companyData) {
        console.log(`[CompanySignIn] User is associated with company: ${companyData.name}. Setting role to 'company'.`);
        
        // Update user metadata to company role
        await updateUserMetadata({ 
          role: 'company', 
          company_id: companyData.id, 
          company_name: companyData.name 
        });

        // Also update the profiles table to ensure consistency
        await supabase
          .from('profiles')
          .upsert({ 
            id: loginAttempt.user.id, 
            role: 'company' 
          });

        console.log(`[CompanySignIn] Company role set successfully for user ${email}`);
        return { user: loginAttempt.user, session: loginAttempt.session, error: null, isCompany: true };
      } else {
        console.log(`[CompanySignIn] No company association found for user ${email}`);
      }
    }

    return { user: loginAttempt.user, session: loginAttempt.session, error: null };
  };

  return { signInCompany };
};
