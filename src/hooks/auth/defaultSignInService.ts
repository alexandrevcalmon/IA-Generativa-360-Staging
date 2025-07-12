
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const createDefaultSignInService = (toast: any) => {
  const processDefaultSignIn = async (user: User, role?: string) => {
    console.log(`[DefaultSignIn] Processing user ${user.id}. Current metadata role: ${user.user_metadata?.role}. Intended role from URL: ${role}`);

    try {
      // Ensure user has a profile first
      const { error: ensureError } = await supabase.rpc('ensure_user_profile', {
        user_id: user.id,
        user_role: role || user.user_metadata?.role || 'student'
      });

      if (ensureError) {
        console.error(`[DefaultSignIn] Error ensuring profile:`, ensureError.message);
      }

      // Handle explicit 'company' role from URL (existing company user)
      if (role === 'company') {
        console.log(`[DefaultSignIn] Handling explicit 'company' role for user ${user.id}`);

        const { data: companyRecord, error: companyRecordError } = await supabase
          .from('companies')
          .select('id, name, auth_user_id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (companyRecordError) {
          console.error(`[DefaultSignIn] Error fetching company record:`, companyRecordError.message);
        }

        if (companyRecord && companyRecord.auth_user_id === user.id) {
          console.log(`[DefaultSignIn] User ${user.id} confirmed as owner of company ${companyRecord.name}`);
          
          // Update user metadata
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              role: 'company',
              company_id: companyRecord.id,
              company_name: companyRecord.name,
              name: user.user_metadata?.name || user.email
            }
          });

          if (updateError) {
            console.warn(`[DefaultSignIn] Error updating user metadata:`, updateError.message);
          }

          // Update profile
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ role: 'company' })
            .eq('id', user.id);

          if (profileUpdateError) {
            console.warn(`[DefaultSignIn] Error updating profile:`, profileUpdateError.message);
          }

          toast({ 
            title: "Login de Empresa bem-sucedido!", 
            description: "Bem-vindo!" 
          });
          return { needsPasswordChange: false };
        }
      }

      // Default path - check for collaborator or student
      let userFinalRole = role || user.user_metadata?.role || 'student';
      let needsPwdChange = false;
      console.log(`[DefaultSignIn] Entering default path for user ${user.id}. Role: ${userFinalRole}`);

      // Check if user is a collaborator
      const { data: collaborator, error: collaboratorError } = await supabase
        .from('company_users')
        .select(`
          id, 
          company_id, 
          name,
          companies:company_id(name)
        `)
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!collaboratorError && collaborator) {
        console.log(`[DefaultSignIn] User ${user.id} identified as collaborator for company ID: ${collaborator.company_id}`);
        userFinalRole = 'collaborator';
        needsPwdChange = collaborator.needs_password_change || false;

        // Update user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            role: 'collaborator',
            company_id: collaborator.company_id,
            name: user.user_metadata?.name || collaborator.name,
            company_name: collaborator.companies?.name || 'Unknown Company'
          }
        });

        if (updateError) {
          console.warn(`[DefaultSignIn] Error updating collaborator metadata:`, updateError.message);
        }

        // Update profile
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ role: 'collaborator' })
          .eq('id', user.id);

        if (profileUpdateError) {
          console.warn(`[DefaultSignIn] Error updating collaborator profile:`, profileUpdateError.message);
        }

        toast({ 
          title: "Login de Colaborador bem-sucedido!", 
          description: needsPwdChange ? "Bem-vindo! Sua senha precisa ser alterada." : "Bem-vindo!" 
        });
      } else {
        if (collaboratorError) {
          console.error(`[DefaultSignIn] Error checking collaborator status:`, collaboratorError.message);
        }

        // Default to student role
        if (userFinalRole !== 'producer' && userFinalRole !== 'collaborator') {
          userFinalRole = 'collaborator';
        }

        // Update user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            role: userFinalRole,
            name: user.user_metadata?.name || user.email,
            company_id: null,
            company_name: null
          }
        });

        if (updateError) {
          console.warn(`[DefaultSignIn] Error updating student metadata:`, updateError.message);
        }

        // Update profile
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ role: userFinalRole })
          .eq('id', user.id);

        if (profileUpdateError) {
          console.warn(`[DefaultSignIn] Error updating student profile:`, profileUpdateError.message);
        }

        toast({ 
          title: `Login de ${userFinalRole.charAt(0).toUpperCase() + userFinalRole.slice(1)} bem-sucedido!`, 
          description: "Bem-vindo!" 
        });
      }

      return { needsPasswordChange: needsPwdChange };

    } catch (error: any) {
      console.error(`[DefaultSignIn] Critical error processing sign-in:`, error.message);
      toast({ 
        title: "Erro no Login", 
        description: "Ocorreu um erro durante o login. Tente novamente.", 
        variant: "destructive" 
      });
      return { needsPasswordChange: false };
    }
  };

  return { processDefaultSignIn };
};
