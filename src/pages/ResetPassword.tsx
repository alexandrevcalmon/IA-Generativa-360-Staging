import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { translateSupabaseError } from '@/hooks/auth/commonAuthUtils';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>('');

  // Função para processar token de recuperação
  const processRecoveryToken = async (token?: string, hash?: string) => {
    console.log('🔍 Processing recovery token:', { hasToken: !!token, hasHash: !!hash });

    try {
      // Método 1: Tentar verifyOtp para tokens diretos (recovery)
      if (token) {
        console.log('📧 Attempting verifyOtp with recovery token...');
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        });

        if (!error && data?.user) {
          console.log('✅ Recovery token verified successfully');
          return { user: data.user, session: data.session, method: 'verifyOtp' };
        }

        if (error) {
          console.log('⚠️ verifyOtp failed:', error.message);
          // Não throw error aqui, tentar outros métodos
        }
      }

      // Método 2: Tentar verifyOtp para tokens de convite (caso seja um convite)
      if (token) {
        console.log('📧 Attempting verifyOtp with invite token...');
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'invite',
        });

        if (!error && data?.user) {
          console.log('✅ Invite token verified successfully');
          return { user: data.user, session: data.session, method: 'verifyOtp_invite' };
        }

        if (error) {
          console.log('⚠️ verifyOtp invite failed:', error.message);
        }
      }

      // Método 3: Tentar getSessionFromUrl
      if (hash && typeof supabase.auth.getSessionFromUrl === 'function') {
        console.log('🔗 Attempting getSessionFromUrl for recovery...');
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

        if (!error && data?.session?.user) {
          console.log('✅ getSessionFromUrl successful for recovery');
          return { user: data.session.user, session: data.session, method: 'getSessionFromUrl' };
        }

        if (error) {
          console.log('⚠️ getSessionFromUrl failed:', error.message);
        }
      }

      // Método 4: Tentar getSession após detectar URL
      if (hash) {
        console.log('🔄 Attempting getSession fallback for recovery...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data, error } = await supabase.auth.getSession();

        if (!error && data?.session?.user) {
          console.log('✅ getSession fallback successful for recovery');
          return { user: data.session.user, session: data.session, method: 'getSession' };
        }

        if (error) {
          console.log('⚠️ getSession fallback failed:', error.message);
        }
      }

      // Método 5: Tentar processar manualmente o hash (último recurso)
      if (hash) {
        console.log('🔧 Attempting manual hash processing for recovery...');
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          console.log('🔑 Found tokens in hash, attempting setSession...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error && data?.session?.user) {
            console.log('✅ Manual hash processing successful for recovery');
            return { user: data.session.user, session: data.session, method: 'setSession' };
          }

          if (error) {
            console.log('⚠️ Manual hash processing failed:', error.message);
          }
        }
      }

      throw new Error('Nenhum token ou hash válido encontrado para recuperação');
    } catch (error) {
      console.error('❌ Recovery token processing failed:', error);
      throw error;
    }
  };

  // Validar token ao carregar a página
  useEffect(() => {
    const validateToken = async () => {
      setIsValidating(true);
      try {
        console.log('[ResetPassword] Iniciando validação do token de recuperação...');
        
        // Verificar parâmetros da URL
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const hash = window.location.hash;

        console.log('📋 Recovery token validation params:', {
          hasToken: !!token,
          type,
          hasHash: !!hash,
          hashPreview: hash ? hash.substring(0, 50) + '...' : 'none',
          fullUrl: window.location.href
        });

        // Verificar se há um redirecionamento incorreto
        if (window.location.pathname === '/' && (token || hash)) {
          console.log('⚠️ Detectado redirecionamento incorreto para a página principal com token de recuperação');
          console.log('🔄 Redirecionando para a página de redefinição...');

          const redirectUrl = `/reset-password${token ? `?token=${token}&type=${type || 'recovery'}` : ''}${hash || ''}`;
          navigate(redirectUrl, { replace: true });
          return;
        }

        if (!token && !hash) {
          console.log('❌ No recovery token or hash found');
          console.log('🔍 URL completa:', window.location.href);
          console.log('🔍 Search params:', Object.fromEntries(searchParams.entries()));
          console.log('🔍 Hash:', window.location.hash);
          
          // Tentar extrair token de outras formas
          const urlParams = new URLSearchParams(window.location.search);
          const allParams = Object.fromEntries(urlParams.entries());
          console.log('🔍 Todos os parâmetros da URL:', allParams);
          
          if (Object.keys(allParams).length > 0) {
            console.log('💡 Encontrados parâmetros na URL, tentando processar...');
            // Continuar com o processamento mesmo sem token/hash específicos
          } else {
            setError('Link de recuperação inválido. Token não encontrado.');
            return;
          }
        }

        const result = await processRecoveryToken(token || undefined, hash || undefined);
        console.log('[ResetPassword] Recovery token processado:', result);
        console.log('[ResetPassword] User email:', result.user.email);
        console.log('[ResetPassword] User metadata:', result.user.user_metadata);
        console.log('[ResetPassword] User role:', result.user.user_metadata?.role);
        
        // Determinar tipo de usuário
        const role = result.user.user_metadata?.role || 'unknown';
        setUserType(role);
        console.log('[ResetPassword] User type determined:', role);
        
        setUser(result.user);
        setIsValidating(false);
      } catch (error: any) {
        console.error('[ResetPassword] Erro ao validar token:', error);
        setError(error.message || 'Erro ao processar link de recuperação');
        setIsValidating(false);
      }
    };

    validateToken();
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não encontrado. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'As senhas digitadas não são iguais.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Atualizando senha para usuário:', user.email);
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        toast({
          title: 'Erro ao atualizar senha',
          description: translateSupabaseError(error),
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Senha atualizada com sucesso');
      toast({
        title: 'Senha atualizada!',
        description: 'Sua senha foi redefinida com sucesso. Você será redirecionado para o login.',
      });

      // Aguardar um pouco antes de redirecionar
      setTimeout(() => {
        navigate('/auth?message=password_updated');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao atualizar sua senha. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-blue-400 mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2 text-white">Validando Link</h3>
            <p className="text-gray-300">
              Verificando o link de recuperação...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-medium mb-2 text-white">Link Inválido</h3>
            <p className="text-gray-300 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white"
              >
                Voltar para o Login
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white mb-2">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-gray-300">
            {userType === 'collaborator' && 'Crie uma nova senha para sua conta de colaborador'}
            {userType === 'company' && 'Crie uma nova senha para sua conta de empresa'}
            {userType === 'student' && 'Crie uma nova senha para sua conta de estudante'}
            {(!userType || userType === 'unknown') && 'Crie uma nova senha para sua conta'}
          </CardDescription>
          {user && (
            <div className="mt-2 space-y-1">
              <div className="text-sm text-gray-400">
                Conta: <span className="text-blue-400">{user.email}</span>
              </div>
              {userType && userType !== 'unknown' && (
                <div className="text-xs text-gray-500 bg-gray-700/30 px-2 py-1 rounded">
                  Tipo: {userType === 'collaborator' ? 'Colaborador' : 
                         userType === 'company' ? 'Empresa' : 
                         userType === 'student' ? 'Estudante' : userType}
                </div>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white font-medium">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white font-medium">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {password && confirmPassword && (
              <div className={`p-3 rounded-lg border ${
                password === confirmPassword && password.length >= 6
                  ? 'bg-green-900/20 border-green-500/30 text-green-300'
                  : 'bg-red-900/20 border-red-500/30 text-red-300'
              }`}>
                <div className="flex items-center space-x-2">
                  {password === confirmPassword && password.length >= 6 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {password === confirmPassword && password.length >= 6
                      ? 'Senhas válidas!'
                      : password !== confirmPassword
                      ? 'As senhas não coincidem'
                      : 'A senha deve ter pelo menos 6 caracteres'
                    }
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword || password.length < 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Redefinir Senha
                  </>
                )}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => navigate('/auth')}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 