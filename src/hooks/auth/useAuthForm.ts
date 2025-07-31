
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';

export function useAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { signIn } = useAuth();
  const [searchParams] = useSearchParams();

  // Set role from URL parameter
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['student', 'company', 'producer'].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação prévia
    console.log('🔍 Form submission - Current values:', { 
      email: email?.trim(), 
      password: password?.length > 0 ? '[PRESENT]' : '[EMPTY]', 
      role 
    });
    
    if (!email?.trim()) {
      console.error('❌ Email está vazio');
      setAuthError('Por favor, digite seu email');
      return;
    }
    
    if (!password?.trim()) {
      console.error('❌ Password está vazio');
      setAuthError('Por favor, digite sua senha');
      return;
    }
    
    setLoading(true);
    setAuthError(null);

    try {
      console.log('🔐 Attempting login for:', email.trim(), 'with role:', role);
      const { error } = await signIn(email.trim(), password.trim(), role);
      
      if (error) {
        console.error('❌ Login error:', error);
        // Set user-friendly error messages
        if (error.message?.includes('Invalid login credentials')) {
          setAuthError('Email ou senha incorretos. Verifique seus dados e tente novamente.');
        } else if (error.message?.includes('Email not confirmed')) {
          setAuthError('Email não confirmado. Verifique sua caixa de entrada.');
        } else if (error.message?.includes('Too many requests')) {
          setAuthError('Muitas tentativas de login. Aguarde alguns minutos.');
        } else if (error.message?.includes('missing email or phone')) {
          setAuthError('Erro interno: dados do formulário não foram enviados corretamente.');
        } else {
          setAuthError('Erro ao fazer login. Tente novamente.');
        }
      } else {
        console.log('✅ Login successful');
        setAuthError(null);
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      setAuthError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    loading,
    handleSubmit,
    authError,
    setAuthError
  };
}
