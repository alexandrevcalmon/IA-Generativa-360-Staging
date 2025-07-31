import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, User, Calendar, MapPin, Globe, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GenderOptions, GenderType } from '@/hooks/collaborators/types';

// Função auxiliar para processar token de ativação com fallbacks
const processActivationToken = async (token?: string, hash?: string) => {
  console.log('🔍 Processing activation token:', { hasToken: !!token, hasHash: !!hash });

  const errors: string[] = [];

  try {
    // Método 1: Tentar verifyOtp para tokens diretos
    if (token) {
      console.log('📧 Attempting verifyOtp with token...');
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'invite',
      });

      if (!error && data?.user) {
        console.log('✅ verifyOtp successful');
        return { user: data.user, session: data.session, method: 'verifyOtp' };
      }

      if (error) {
        console.log('⚠️ verifyOtp failed:', error.message);
        errors.push(`verifyOtp: ${error.message}`);
      }
    }

    // Método 2: Tentar getSessionFromUrl (versão 2.x)
    if (hash && typeof supabase.auth.getSessionFromUrl === 'function') {
      console.log('🔗 Attempting getSessionFromUrl...');
      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

      if (!error && data?.session?.user) {
        console.log('✅ getSessionFromUrl successful');
        return { user: data.session.user, session: data.session, method: 'getSessionFromUrl' };
      }

      if (error) {
        console.log('⚠️ getSessionFromUrl failed:', error.message);
        errors.push(`getSessionFromUrl: ${error.message}`);
      }
    }

    // Método 3: Tentar getSession após detectar URL (fallback)
    if (hash) {
      console.log('🔄 Attempting getSession fallback...');
      // Aguardar um pouco para o Supabase processar a URL
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data, error } = await supabase.auth.getSession();

      if (!error && data?.session?.user) {
        console.log('✅ getSession fallback successful');
        return { user: data.session.user, session: data.session, method: 'getSession' };
      }

      if (error) {
        console.log('⚠️ getSession fallback failed:', error.message);
        errors.push(`getSession: ${error.message}`);
      }
    }

    // Método 4: Tentar processar manualmente o hash (último recurso)
    if (hash) {
      console.log('🔧 Attempting manual hash processing...');
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
          console.log('✅ Manual hash processing successful');
          return { user: data.session.user, session: data.session, method: 'setSession' };
        }

        if (error) {
          console.log('⚠️ Manual hash processing failed:', error.message);
          errors.push(`setSession: ${error.message}`);
        }
      } else {
        errors.push('No access_token or refresh_token found in hash');
      }
    }

    // Se chegou até aqui, nenhum método funcionou
    const errorMessage = errors.length > 0
      ? `Todos os métodos de ativação falharam: ${errors.join(', ')}`
      : 'Nenhum token ou hash válido encontrado';

    throw new Error(errorMessage);

  } catch (error: any) {
    console.error('❌ Token processing error:', error);
    throw error;
  }
};

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activationMethod, setActivationMethod] = useState<string>('');
  const [needsCompleteRegistration, setNeedsCompleteRegistration] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  // Campos adicionais para colaboradores
  const [birthDate, setBirthDate] = useState('');
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [gender, setGender] = useState<GenderType | ''>('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Brasil');

  // IBGE estados/cidades
  const [estados, setEstados] = useState<{ sigla: string; nome: string }[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);

  // Buscar estados do IBGE ao carregar
  useEffect(() => {
    setLoadingEstados(true);
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then((data) => {
        setEstados(data.map((uf: any) => ({ sigla: uf.sigla, nome: uf.nome })));
      })
      .catch(() => {
        setEstados([
          { sigla: 'SP', nome: 'São Paulo' },
          { sigla: 'RJ', nome: 'Rio de Janeiro' },
          { sigla: 'MG', nome: 'Minas Gerais' },
          { sigla: 'RS', nome: 'Rio Grande do Sul' },
          { sigla: 'BA', nome: 'Bahia' },
        ]);
      })
      .finally(() => setLoadingEstados(false));
  }, []);

  // Buscar cidades do IBGE ao selecionar estado
  useEffect(() => {
    if (!state) {
      setCidades([]);
      return;
    }
    setLoadingCidades(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`)
      .then(res => res.json())
      .then((data) => {
        setCidades(data.map((c: any) => c.nome));
      })
      .catch(() => {
        setCidades([]);
      })
      .finally(() => setLoadingCidades(false));
  }, [state]);

  // Validar token ao carregar a página
  useEffect(() => {
    const validateToken = async () => {
      setIsValidating(true);
      try {
        console.log('[ActivateAccount] Iniciando validação do token...');
        // 1) Caso venha no formato ?token=xxx&type=invite
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        // 2) Caso venha por hash (#access_token=xxx&...)
        const hash = window.location.hash;

        console.log('📋 Token validation params:', {
          hasToken: !!token,
          type,
          hasHash: !!hash,
          hashPreview: hash ? hash.substring(0, 50) + '...' : 'none',
          fullUrl: window.location.href
        });

        // Verificar se há um redirecionamento automático em andamento
        if (window.location.pathname === '/' && (token || hash)) {
          console.log('⚠️ Detectado redirecionamento incorreto para a página principal com token presente');
          console.log('🔄 Redirecionando para a página de ativação...');

          // Construir URL de ativação correta
          const redirectUrl = `/activate-account${token ? `?token=${token}&type=${type || 'invite'}` : ''}${hash || ''}`;
          navigate(redirectUrl, { replace: true });
          return;
        }

        if (!token && !hash) {
          console.log('❌ No token or hash found');
          toast({
            title: 'Link inválido',
            description: 'Token de ativação não encontrado.',
            variant: 'destructive',
          });
          navigate('/auth');
          return;
        }

        const result = await processActivationToken(token || undefined, hash || undefined);
        console.log('[ActivateAccount] Token processado:', result);
        console.log('[ActivateAccount] User email:', result.user.email);
        console.log('[ActivateAccount] User metadata:', result.user.user_metadata);
        console.log('[ActivateAccount] User role from metadata:', result.user.user_metadata?.role);
        setUserEmail(result.user.email || '');
        setActivationMethod(result.method);
        setIsValidToken(true);

        // Verificar se é colaborador que precisa completar cadastro
        console.log('[ActivateAccount] Buscando dados do colaborador no banco...');
        const { data: collaborator, error: collaboratorError } = await supabase
          .from('company_users')
          .select('*')
          .eq('auth_user_id', result.user.id)
          .maybeSingle();
        if (collaboratorError) {
          console.error('[ActivateAccount] Erro ao buscar colaborador:', collaboratorError);
        }
        console.log('[ActivateAccount] Dados do colaborador:', collaborator);
        if (collaborator && collaborator.needs_complete_registration) {
          setNeedsCompleteRegistration(true);
          setUserData(collaborator);
          toast({
            title: 'Bem-vindo!',
            description: 'Complete seu cadastro definindo sua senha e informações pessoais.',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Link válido!',
            description: `Ativação processada via ${result.method}. Defina sua senha para continuar.`,
            variant: 'default',
          });
        }
      } catch (error: any) {
        console.error('[ActivateAccount] Erro ao validar token:', error);
        setIsValidToken(false);
        toast({
          title: 'Erro ao validar link',
          description: error.message || 'Ocorreu um erro ao validar o link de ativação.',
          variant: 'destructive',
        });
      } finally {
        setIsValidating(false);
      }
    };
    validateToken();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setConfirmPasswordError(null);
    console.log('[ActivateAccount] handleSubmit chamado');
    let hasError = false;
    if (password.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres.');
      hasError = true;
    } else if (/^\d+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
      setPasswordError('A senha deve conter letras e números.');
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem.');
      hasError = true;
    }
    if (hasError) return;
    if (needsCompleteRegistration) {
      if (!birthDate) {
        toast({
          title: "Campo obrigatório",
          description: "Data de nascimento é obrigatória.",
          variant: "destructive",
        });
        return;
      }
      if (birthDateError) {
        toast({
          title: "Data de nascimento inválida",
          description: birthDateError,
          variant: "destructive",
        });
        return;
      }
      if (!gender) {
        toast({
          title: "Campo obrigatório",
          description: "Sexo é obrigatório.",
          variant: "destructive",
        });
        return;
      }
      if (!state) {
        toast({
          title: "Campo obrigatório",
          description: "Estado é obrigatório.",
          variant: "destructive",
        });
        return;
      }
      if (!city) {
        toast({
          title: "Campo obrigatório",
          description: "Cidade é obrigatória.",
          variant: "destructive",
        });
        return;
      }
      if (!country.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "País é obrigatório.",
          variant: "destructive",
        });
        return;
      }
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDateObj.getFullYear();
      if (age < 16 || age > 100) {
        toast({
          title: "Idade inválida",
          description: "Idade deve estar entre 16 e 100 anos.",
          variant: "destructive",
        });
        return;
      }
    }
    setLoading(true);
    try {
      console.log('[ActivateAccount] Atualizando senha do usuário...');
      const { error: passwordError } = await supabase.auth.updateUser({ password });
      if (passwordError) throw new Error(passwordError.message || 'Erro ao definir a senha.');

      if (needsCompleteRegistration && userData) {
        console.log('[ActivateAccount] Atualizando dados do colaborador no banco...');
        const { error: updateError } = await supabase
          .from('company_users')
          .update({
            birth_date: birthDate || null,
            gender: gender || null,
            cidade: city.trim(),
            estado: state.trim(),
            pais: country.trim(),
            needs_complete_registration: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userData.id);

        if (updateError) throw new Error(updateError.message || 'Erro ao completar o cadastro.');
      }

      toast({
        title: "Conta ativada com sucesso!",
        description: needsCompleteRegistration
          ? "Seu cadastro foi completado. Redirecionando para o dashboard..."
          : "Sua senha foi definida. Redirecionando...",
      });

      // A sessão é atualizada automaticamente pelo updateUser.
      // Agora, buscamos o usuário e seu role para fazer o redirecionamento correto e imediato.
      const { data: { user } } = await supabase.auth.getUser(); // Pega o usuário da sessão recém-criada

      if (user) {
        let userRole = user?.user_metadata?.role;

        // Fallback para buscar o role na tabela 'profiles' se não estiver nos metadados
        if (!userRole && user?.id) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

          if (profileError) console.error("Erro ao buscar perfil para redirecionamento:", profileError.message);
          if (profile) userRole = profile.role;
        }

        // Verificar se a empresa existe antes de redirecionar para company dashboard
        if (userRole === 'company') {
          console.log('🏢🏢🏢 REDIRECIONAMENTO COMPANY DETECTADO 🏢🏢🏢');
          console.log('userRole:', userRole);
          console.log('user metadata:', user?.user_metadata);
          console.log('company_id from metadata:', user?.user_metadata?.company_id);

          const companyId = user?.user_metadata?.company_id;
          if (companyId) {
            console.log('🔍🔍🔍 VERIFICANDO SE EMPRESA EXISTE 🔍🔍🔍');
            const { data: company, error: companyError } = await supabase
              .from('companies')
              .select('id, name, is_active')
              .eq('id', companyId)
              .maybeSingle();

            console.log('Empresa encontrada:', company);
            console.log('Erro ao buscar empresa:', companyError);

            if (companyError || !company || !company.is_active) {
              console.log('⚠️ Empresa não encontrada ou inativa, redirecionando para login');
              toast({
                title: "Empresa não encontrada",
                description: "Sua empresa não foi encontrada ou está inativa. Entre em contato com o suporte.",
                variant: "destructive"
              });
              navigate('/auth');
              return;
            }
          }
        }

        console.log('🎯🎯🎯 INICIANDO REDIRECIONAMENTO 🎯🎯🎯');
        console.log('userRole final:', userRole);

        switch (userRole) {
          case 'producer':
            console.log('🚀 Redirecionando para producer dashboard');
            navigate('/producer/dashboard');
            break;
          case 'company':
            console.log('🏢 Redirecionando para company dashboard');
            navigate('/company/dashboard');
            break;
          default:
            console.log('👨‍🎓 Redirecionando para student dashboard');
            navigate('/student/dashboard');
        }
      } else {
        // Se por algum motivo o usuário não for encontrado, redireciona para o login.
        toast({ title: "Sessão não encontrada", description: "Por favor, faça o login.", variant: "destructive" });
        navigate('/auth');
      }

    } catch (error: any) {
      console.error('[useActivationForm] Erro ao submeter:', error);
      toast({
        title: "Erro na ativação",
        description: error.message.includes('JWT') ? 'Sua sessão de ativação expirou. Por favor, use o link novamente.' : (error.message || "Ocorreu um erro ao processar sua solicitação."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Validando link de ativação...</p>
            <p className="text-sm text-gray-400 mt-2">Processando com múltiplos métodos de compatibilidade</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Link Inválido</h2>
            <p className="text-gray-300 mb-4">
              Este link de ativação expirou ou é inválido.
            </p>
            <Button onClick={() => navigate('/auth')} variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white mb-2">
            {needsCompleteRegistration ? 'Complete seu Cadastro' : 'Ativar Conta'}
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            {needsCompleteRegistration
              ? 'Defina sua senha e complete suas informações pessoais para acessar a plataforma'
              : `Olá, ${userEmail}! Defina sua senha para ativar sua conta`
            }
          </CardDescription>
          <p className="text-xs text-gray-400 mt-3 bg-slate-700 rounded-lg p-2 border border-slate-600">
            Observação: Por questões de conformidade, apenas usuários com idade entre 16 e 100 anos podem criar contas.
          </p>
          {userEmail && (
            <p className="text-sm text-blue-400 font-medium mt-3 bg-slate-700 rounded-lg p-2 border border-slate-600">
              {userEmail}
            </p>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-white font-medium">Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(null); }}
                  placeholder="Crie uma senha"
                  className={`bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 ${passwordError ? "border-red-500" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordError && <p className="text-sm text-red-400 mt-1">{passwordError}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-white font-medium">Confirmar Senha *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(null); }}
                  placeholder="Repita a senha"
                  className={`bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 ${confirmPasswordError ? "border-red-500" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-400 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPasswordError && <p className="text-sm text-red-400 mt-1">{confirmPasswordError}</p>}
            </div>

            {needsCompleteRegistration && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="birthDate" className="text-white font-medium flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Data de Nascimento
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => { setBirthDate(e.target.value); setBirthDateError(null); }}
                    onBlur={() => {
                      if (!birthDate) return;
                      const birth = new Date(birthDate);
                      const today = new Date();
                      const ageCalc = today.getFullYear() - birth.getFullYear();
                      if (ageCalc < 16 || ageCalc > 100) {
                        setBirthDateError('Idade deve estar entre 16 e 100 anos.');
                      }
                    }}
                    placeholder="DD/MM/AAAA"
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                  {birthDateError && <p className="text-sm text-red-400 mt-1">{birthDateError}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="gender" className="text-white font-medium flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-400" />
                    Sexo
                  </Label>
                  <Select onValueChange={(value) => setGender(value as GenderType)} defaultValue={gender} required>
                    <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder="Selecione seu sexo" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {Object.entries(GenderOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="text-white hover:bg-slate-700">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="state" className="text-white font-medium flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-400" />
                    Estado
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setState(value);
                      setCity(''); // Limpa cidade ao trocar estado
                    }}
                    value={state}
                    required
                  >
                    <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder={loadingEstados ? "Carregando estados..." : "Selecione seu estado"} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {loadingEstados ? (
                        <div className="flex items-center justify-center p-4 text-white">
                          <Loader2 className="animate-spin mr-2" />Carregando...
                        </div>
                      ) : (
                        estados.map((uf) => (
                          <SelectItem key={uf.sigla} value={uf.sigla} className="text-white hover:bg-slate-700">
                            {uf.nome} ({uf.sigla})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="city" className="text-white font-medium flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-400" />
                    Cidade
                  </Label>
                  <Select
                    onValueChange={(value) => setCity(value)}
                    value={city}
                    required
                    disabled={!state || loadingCidades}
                  >
                    <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20 disabled:opacity-50">
                      <SelectValue placeholder={state ? (loadingCidades ? "Carregando cidades..." : "Selecione sua cidade") : "Selecione o estado primeiro"} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {loadingCidades ? (
                        <div className="flex items-center justify-center p-4 text-white">
                          <Loader2 className="animate-spin mr-2" />Carregando...
                        </div>
                      ) : (
                        cidades.map((cidade) => (
                          <SelectItem key={cidade} value={cidade} className="text-white hover:bg-slate-700">
                            {cidade}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="country" className="text-white font-medium flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    País
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Digite seu país"
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </>
            )}

            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
              <p className="text-sm text-blue-300 font-medium mb-2">
                <strong>Requisitos da senha:</strong>
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Mínimo de 8 caracteres</li>
                <li>• Recomendado: letras, números e símbolos</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Ativando conta...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-3" />
                  Ativar Conta
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
