import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Utilitários comuns para autenticação, reduzindo código duplicado
 * entre os diferentes serviços de autenticação
 */
export const ensureUserProfile = async (userId: string, role: string = 'student'): Promise<void> => {
  try {
    const { error } = await supabase.rpc('ensure_user_profile', {
      user_id: userId,
      user_role: role
    });

    if (error) {
      console.error(`[CommonAuthUtils] Error ensuring profile for ${userId}:`, error.message);
    }
  } catch (error) {
    console.error(`[CommonAuthUtils] Exception ensuring profile:`, error);
  }
};

export const updateUserMetadata = async (metadata: Record<string, any>): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: metadata
    });

    if (error) {
      console.error(`[CommonAuthUtils] Error updating user metadata:`, error.message);
    }
  } catch (error) {
    console.error(`[CommonAuthUtils] Exception updating metadata:`, error);
  }
};

export const updateProfileRole = async (userId: string, role: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error(`[CommonAuthUtils] Error updating profile role:`, error.message);
    }
  } catch (error) {
    console.error(`[CommonAuthUtils] Exception updating profile role:`, error);
  }
};

export const getCompanyForUser = async (userId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, needs_password_change')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (error) {
      console.error(`[CommonAuthUtils] Error getting company for user:`, error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`[CommonAuthUtils] Exception getting company:`, error);
    return null;
  }
};

export const getCollaboratorForUser = async (userId: string): Promise<any> => {
  try {
    const { data: collaborator, error } = await supabase
      .from('company_users')
      .select('id, company_id, name, needs_password_change')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (error || !collaborator) {
      return null;
    }

    // Get company name separately
    const { data: companyInfo } = await supabase
      .from('companies')
      .select('name')
      .eq('id', collaborator.company_id)
      .maybeSingle();

    return {
      ...collaborator,
      company_name: companyInfo?.name || 'Unknown Company'
    };
  } catch (error) {
    console.error(`[CommonAuthUtils] Exception getting collaborator:`, error);
    return null;
  }
};

export const formatErrorMessage = (error: any): string => {
  const errorMessage = error?.message || 'Erro desconhecido';
  
  // Map common error messages to user-friendly messages
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos.',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
    'User already registered': 'Este email já está em uso. Tente fazer login.',
    'For security purposes': 'Por segurança, aguarde alguns minutos antes de solicitar outro email.',
    'Password should be at least': 'A senha deve ter pelo menos 6 caracteres.',
    'New password should be different': 'A nova senha deve ser diferente da atual.',
    'User not found': 'Usuário não encontrado.',
    'JWT expired': 'Sua sessão expirou. Faça login novamente.',
    'Invalid JWT': 'Sessão inválida. Faça login novamente.',
  };

  // Check if the error message contains any of the keys in the map
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  return errorMessage;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'A senha deve ter pelo menos 6 caracteres.' };
  }
  
  return { valid: true };
};

export const sanitizeUserData = (user: User | null): Record<string, any> => {
  if (!user) return {};
  
  // Return only safe user data for logging
  return {
    id: user.id,
    email: user.email,
    role: user.user_metadata?.role || 'unknown',
    lastSignIn: user.last_sign_in_at,
    createdAt: user.created_at
  };
};