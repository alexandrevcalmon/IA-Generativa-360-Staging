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
    'Too many requests': 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
    'missing email or phone': 'Email é obrigatório.',
    'missing password': 'Senha é obrigatória.',
    'Email and password are required': 'Email e senha são obrigatórios.',
    'Invalid email format': 'Formato de email inválido.',
    'Password is too weak': 'Senha muito fraca. Use uma senha mais forte.',
    'Password must be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Password must contain at least one letter and one number': 'A senha deve conter pelo menos uma letra e um número.',
    'Password must be different from current password': 'A nova senha deve ser diferente da atual.',
    'Account already exists': 'Esta conta já existe.',
    'Email already in use': 'Este email já está em uso.',
    'Invalid recovery token': 'Token de recuperação inválido.',
    'Recovery token expired': 'Token de recuperação expirado.',
    'Invalid confirmation token': 'Token de confirmação inválido.',
    'Confirmation token expired': 'Token de confirmação expirado.',
    'Invalid invite token': 'Token de convite inválido.',
    'Invite token expired': 'Token de convite expirado.',
    'User is not confirmed': 'Usuário não confirmado.',
    'User is disabled': 'Usuário desabilitado.',
    'User is locked': 'Usuário bloqueado.',
    'Invalid phone number': 'Número de telefone inválido.',
    'Phone number already in use': 'Número de telefone já está em uso.',
    'Invalid OTP': 'Código OTP inválido.',
    'OTP expired': 'Código OTP expirado.',
    'Too many OTP attempts': 'Muitas tentativas de OTP. Aguarde alguns minutos.',
    'Invalid magic link': 'Link mágico inválido.',
    'Magic link expired': 'Link mágico expirado.',
    'Invalid signup token': 'Token de cadastro inválido.',
    'Signup token expired': 'Token de cadastro expirado.',
    'Invalid email change token': 'Token de alteração de email inválido.',
    'Email change token expired': 'Token de alteração de email expirado.',
    'Invalid password change token': 'Token de alteração de senha inválido.',
    'Password change token expired': 'Token de alteração de senha expirado.',
    'Invalid session': 'Sessão inválida.',
    'Session expired': 'Sessão expirada.',
    'Invalid refresh token': 'Token de atualização inválido.',
    'Refresh token expired': 'Token de atualização expirado.',
    'Refresh token revoked': 'Token de atualização revogado.',
    'Invalid access token': 'Token de acesso inválido.',
    'Access token expired': 'Token de acesso expirado.',
    'Access token revoked': 'Token de acesso revogado.',
    'Invalid API key': 'Chave da API inválida.',
    'API key expired': 'Chave da API expirada.',
    'API key revoked': 'Chave da API revogada.',
    'Rate limit exceeded': 'Limite de taxa excedido. Aguarde alguns minutos.',
    'Service temporarily unavailable': 'Serviço temporariamente indisponível.',
    'Internal server error': 'Erro interno do servidor.',
    'Bad request': 'Requisição inválida.',
    'Unauthorized': 'Não autorizado.',
    'Forbidden': 'Acesso negado.',
    'Not found': 'Não encontrado.',
    'Method not allowed': 'Método não permitido.',
    'Request timeout': 'Tempo limite da requisição.',
    'Conflict': 'Conflito de dados.',
    'Unprocessable entity': 'Entidade não processável.',
    'Request entity too large': 'Entidade da requisição muito grande.',
    'Unsupported media type': 'Tipo de mídia não suportado.',
    'Requested range not satisfiable': 'Faixa solicitada não satisfatória.',
    'Expectation failed': 'Expectativa falhou.',
    'I\'m a teapot': 'Erro inesperado.',
    'Locked': 'Recurso bloqueado.',
    'Failed dependency': 'Dependência falhou.',
    'Too early': 'Muito cedo.',
    'Upgrade required': 'Atualização necessária.',
    'Precondition required': 'Pré-condição necessária.',
    'Request header fields too large': 'Campos do cabeçalho da requisição muito grandes.',
    'Unavailable for legal reasons': 'Indisponível por razões legais.',
    'Not implemented': 'Não implementado.',
    'Bad gateway': 'Gateway inválido.',
    'Service unavailable': 'Serviço indisponível.',
    'Gateway timeout': 'Tempo limite do gateway.',
    'HTTP version not supported': 'Versão HTTP não suportada.',
    'Variant also negotiates': 'Variante também negocia.',
    'Insufficient storage': 'Armazenamento insuficiente.',
    'Loop detected': 'Loop detectado.',
    'Not extended': 'Não estendido.',
    'Network authentication required': 'Autenticação de rede necessária.',
  };

  // Check if the error message contains any of the keys in the map
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  return errorMessage;
};

// Função para traduzir mensagens de erro do Supabase especificamente
export const translateSupabaseError = (error: any): string => {
  if (!error) return 'Erro desconhecido';
  
  const errorMessage = error.message || error.toString();
  
  // Mapeamento específico para erros do Supabase
  const supabaseErrorMap: Record<string, string> = {
    // Erros de autenticação
    'Invalid login credentials': 'Email ou senha incorretos.',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
    'User already registered': 'Este email já está em uso. Tente fazer login.',
    'For security purposes': 'Por segurança, aguarde alguns minutos antes de solicitar outro email.',
    'User not found': 'Usuário não encontrado.',
    
    // Erros de senha
    'Password should be at least': 'A senha deve ter pelo menos 6 caracteres.',
    'New password should be different': 'A nova senha deve ser diferente da atual.',
    'Password is too weak': 'Senha muito fraca. Use uma senha mais forte.',
    'Password must be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Password must contain at least one letter and one number': 'A senha deve conter pelo menos uma letra e um número.',
    'Password must be different from current password': 'A nova senha deve ser diferente da atual.',
    
    // Erros de tokens
    'Invalid recovery token': 'Token de recuperação inválido.',
    'Recovery token expired': 'Token de recuperação expirado.',
    'Invalid confirmation token': 'Token de confirmação inválido.',
    'Confirmation token expired': 'Token de confirmação expirado.',
    'Invalid invite token': 'Token de convite inválido.',
    'Invite token expired': 'Token de convite expirado.',
    'Invalid JWT': 'Sessão inválida. Faça login novamente.',
    'JWT expired': 'Sua sessão expirou. Faça login novamente.',
    
    // Erros de sessão
    'Invalid session': 'Sessão inválida.',
    'Session expired': 'Sessão expirada.',
    'Invalid refresh token': 'Token de atualização inválido.',
    'Refresh token expired': 'Token de atualização expirado.',
    'Refresh token revoked': 'Token de atualização revogado.',
    
    // Erros de rate limiting
    'Too many requests': 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
    'Rate limit exceeded': 'Limite de taxa excedido. Aguarde alguns minutos.',
    
    // Erros de validação
    'missing email or phone': 'Email é obrigatório.',
    'missing password': 'Senha é obrigatória.',
    'Email and password are required': 'Email e senha são obrigatórios.',
    'Invalid email format': 'Formato de email inválido.',
    
    // Erros de conta
    'Account already exists': 'Esta conta já existe.',
    'Email already in use': 'Este email já está em uso.',
    'User is not confirmed': 'Usuário não confirmado.',
    'User is disabled': 'Usuário desabilitado.',
    'User is locked': 'Usuário bloqueado.',
    
    // Erros de banco de dados
    'duplicate key value violates unique constraint': 'Este registro já existe.',
    'relation "table_name" does not exist': 'Tabela não encontrada.',
    'column "column_name" does not exist': 'Coluna não encontrada.',
    'permission denied': 'Permissão negada.',
    'row-level security policy violation': 'Política de segurança violada.',
    
    // Erros de rede
    'fetch failed': 'Erro de conexão. Verifique sua internet.',
    'network error': 'Erro de rede. Verifique sua conexão.',
    'timeout': 'Tempo limite excedido. Tente novamente.',
    'connection refused': 'Conexão recusada.',
    'host unreachable': 'Host inacessível.',
    
    // Erros genéricos
    'Bad request': 'Requisição inválida.',
    'Unauthorized': 'Não autorizado.',
    'Forbidden': 'Acesso negado.',
    'Not found': 'Não encontrado.',
    'Service temporarily unavailable': 'Serviço temporariamente indisponível.',
  };

  // Verificar se a mensagem de erro contém alguma das chaves do mapeamento
  for (const [key, value] of Object.entries(supabaseErrorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Se não encontrar uma tradução específica, usar a função genérica
  return formatErrorMessage(error);
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
