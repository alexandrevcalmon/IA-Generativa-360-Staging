import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Building2, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CompanyAddressFields } from '@/components/company/CompanyAddressFields';

interface CompanyData {
  name: string;
  official_name: string;
  cnpj: string;
  email: string;
  phone: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_district: string;
  address_city: string;
  address_state: string;
  address_zip_code: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}

interface PlanData {
  id: string;
  name: string;
  max_collaborators: number;
  subscription_period_days: number;
  stripe_product_id: string;
  stripe_price_id: string;
  price?: number;
  currency?: string;
  features?: any[];
  created_at: string;
  updated_at: string;
}

export default function CompanyData() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const planId = searchParams.get('plan');
  const [loading, setLoading] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanData | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const [formData, setFormData] = useState<CompanyData>({
    name: '',
    official_name: '',
    cnpj: '',
    email: '',
    phone: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_district: '',
    address_city: '',
    address_state: '',
    address_zip_code: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!planId) {
        toast({
          title: "Plano não especificado",
          description: "Nenhum plano foi selecionado.",
          variant: "destructive",
        });
        navigate('/planos');
        return;
      }

      try {
        const response = await fetch('https://ldlxebhnkayiwksipvyc.supabase.co/functions/v1/get-stripe-prices', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbHhlYmhua2F5aXdrc2lwdnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDA2NTMsImV4cCI6MjA2NzIxNjY1M30.XTc1M64yGVGuY4FnOsy9D3q5Ov1HAoyuZAV8IPwYEZ0'}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar dados do plano');
        }

        const data = await response.json();
        const plan = data.plans.find((p: PlanData) => p.id === planId);

        if (!plan) {
          toast({
            title: "Plano não encontrado",
            description: "O plano selecionado não foi encontrado.",
            variant: "destructive",
          });
          navigate('/planos');
          return;
        }

        setPlanInfo(plan);
      } catch (error) {
        console.error('Error fetching plan data:', error);
        toast({
          title: "Erro ao carregar plano",
          description: "Erro ao buscar informações do plano selecionado.",
          variant: "destructive",
        });
        navigate('/planos');
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchPlanData();
  }, [planId, navigate, toast]);

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função para auto-preenchimento do Nome Fantasia para Nome da Empresa
  const handleNameBlur = (value: string) => {
    if (value.trim()) {
      setFormData(prev => ({ ...prev, contact_name: value.trim() }));
    }
  };

  // Função para auto-preenchimento do Email da Empresa para Email da Empresa na seção de contato
  const handleEmailBlur = (value: string) => {
    if (value.trim()) {
      setFormData(prev => ({ ...prev, contact_email: value.trim() }));
    }
  };

  // Função utilitária para formatar CNPJ
  function formatCNPJ(value: string) {
    // Remove tudo que não for dígito
    value = value.replace(/\D/g, "");
    // Aplica a máscara
    value = value.replace(/(\d{2})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1/$2");
    value = value.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    return value;
  }

  const validateForm = () => {
    const requiredFields = [
      'name',
      'official_name', 
      'cnpj',
      'contact_email',
      'contact_name'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof CompanyData]?.trim()) {
        toast({
          title: "Campos obrigatórios",
          description: `Por favor, preencha todos os campos obrigatórios.`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !planInfo) return;

    setLoading(true);

    try {
      const requestData = {
        planId: planInfo.id,
        companyData: formData,
      };
      
      console.log('Enviando dados para create-stripe-checkout:', requestData);
      
      const response = await fetch('https://ldlxebhnkayiwksipvyc.supabase.co/functions/v1/create-stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbHhlYmhua2F5aXdrc2lwdnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDA2NTMsImV4cCI6MjA2NzIxNjY1M30.XTc1M64yGVGuY4FnOsy9D3q5Ov1HAoyuZAV8IPwYEZ0'}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Resposta da função create-stripe-checkout:', data);

      if (!response.ok) {
        console.error('Erro na resposta:', data);
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }

      // Redirecionar para o Stripe Checkout
      if (data.checkout_url) {
        console.log('Redirecionando para:', data.checkout_url);
        window.location.href = data.checkout_url;
      } else {
        console.error('URL de checkout não encontrada na resposta:', data);
        throw new Error('URL de checkout não encontrada na resposta');
      }

    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erro no checkout",
        description: error instanceof Error ? error.message : "Erro inesperado ao processar pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingPlan) {
    return (
      <div className="min-h-screen !bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin !text-blue-400 mx-auto mb-4" />
          <p className="!text-gray-300">Carregando dados do plano...</p>
        </div>
      </div>
    );
  }

  if (!planInfo) {
    return (
      <div className="min-h-screen !bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin !text-blue-400 mx-auto mb-4" />
          <p className="!text-gray-300">Plano não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen !bg-gray-900">
      {/* Header */}
      <div className="!bg-gray-800 shadow-sm border-b !border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/planos')}
              className="flex items-center gap-2 !bg-gray-700 !border-gray-600 !text-gray-300 hover:!bg-gray-600 hover:!text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold !text-white">
                Dados da Empresa
              </h1>
              <p className="!text-gray-300">
                Plano selecionado: {planInfo.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="!bg-gray-800 !border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 !text-white">
                  <Building2 className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados Básicos */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="!text-gray-300">Nome Fantasia *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={(e) => handleNameBlur(e.target.value)}
                        placeholder="Nome Fantasia da Empresa"
                        className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="official_name" className="!text-gray-300">Razão Social *</Label>
                      <Input
                        id="official_name"
                        value={formData.official_name}
                        onChange={(e) => handleInputChange('official_name', e.target.value)}
                        placeholder="Razão Social da Empresa"
                        className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cnpj" className="!text-gray-300">CNPJ *</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => {
                          const formatted = formatCNPJ(e.target.value);
                          setFormData(prev => ({ ...prev, cnpj: formatted }));
                        }}
                        placeholder="00.000.000/0000-00"
                        className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
                        required
                        maxLength={18}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="!text-gray-300">Email da Empresa *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={(e) => handleEmailBlur(e.target.value)}
                        placeholder="contato@empresa.com"
                        className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <CompanyAddressFields formData={formData} setFormData={setFormData} />

                  {/* Contato */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium !text-white">Contato Principal</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_name" className="!text-gray-300">Nome da Empresa *</Label>
                        <Input
                          id="contact_name"
                          value={formData.contact_name}
                          onChange={(e) => handleInputChange('contact_name', e.target.value)}
                          placeholder="Nome completo"
                          className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_email" className="!text-gray-300">Email da Empresa *</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => handleInputChange('contact_email', e.target.value)}
                          placeholder="contato@exemplo.com"
                          className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
                          required
                        />
                        <p className="text-xs !text-blue-400">
                          Este email será usado para criar o acesso à plataforma
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Processando...' : 'Continuar para Pagamento'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Resumo do Plano */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 !bg-gray-800 !border-gray-700">
              <CardHeader>
                <CardTitle className="!text-white">Resumo do Plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium !text-white">{planInfo.name}</h3>
                  <p className="text-sm !text-gray-300">
                    Até {planInfo.max_collaborators} colaboradores
                  </p>
                </div>
                
                <div className="border-t !border-gray-600 pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="!text-gray-300">Período:</span>
                      <span className="font-medium !text-white">
                        {planInfo.subscription_period_days === 180 ? 'Semestral' : 
                         planInfo.subscription_period_days === 365 ? 'Anual' : 
                         `${planInfo.subscription_period_days} dias`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="!text-gray-300">Colaboradores:</span>
                      <span className="font-medium !text-white">Até {planInfo.max_collaborators}</span>
                    </div>
                    {planInfo.price && (
                      <div className="flex justify-between">
                        <span className="!text-gray-300">Preço:</span>
                        <span className="font-medium !text-white">
                          R$ {planInfo.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t !border-gray-600 pt-4">
                  <p className="text-xs !text-gray-400">
                    O pagamento será processado de forma segura pelo Stripe.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
