
import { supabase } from '@/integrations/supabase/client';

export const getRedirectUrl = () => `${window.location.origin}/`;

export const getResetPasswordRedirectUrl = () => `${window.location.origin}/reset-password`;

export const checkCompanyUser = async (userId: string) => {
  const { data: collaborator, error: collaboratorError } = await supabase
    .from('company_users')
    .select('id, company_id, name')
    .eq('auth_user_id', userId)
    .maybeSingle();
  
  if (collaboratorError || !collaborator) {
    return { collaborator: null, collaboratorError };
  }

  // Get company name separately to avoid join issues
  const { data: companyInfo } = await supabase
    .from('companies')
    .select('name')
    .eq('id', collaborator.company_id)
    .maybeSingle();
  
  // Transform the data to include company_name at the root level
  const transformedCollaborator = {
    ...collaborator,
    company_name: companyInfo?.name || 'Unknown Company'
  };
  
  return { collaborator: transformedCollaborator, collaboratorError: null };
};

export const checkCompanyByEmail = async (email: string) => {
  const { data: companies, error: companySearchError } = await supabase
    .from('companies')
    .select('id, contact_email, auth_user_id, name')
    .eq('contact_email', email);
  
  return { companies, companySearchError };
};

export const updateUserMetadata = async (metadata: Record<string, any>) => {
  return await supabase.auth.updateUser({
    data: metadata
  });
};

export const createCompanyAuthUser = async (email: string, companyId: string) => {
  return await supabase.functions.invoke(
    'create-company-auth-user',
    {
      body: { email, companyId }
    }
  );
};
