import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Building2, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_PLANS, getPlanInfo } from '@/lib/stripe';
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

export default function CompanyData() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const plan = searchParams.get('plan');
  const [loading, setLoading] = useState(false);
  const [planInfo, setPlanInfo] = useState<any>(null);

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
    if (plan && typeof plan === 'string') {
      const info = getPlanInfo(plan);
      if (info) {
        setPlanInfo({ id: plan, ...info });
      } else {
        toast({
          title: "Plano inválido",
          description: "O plano selecionado não foi encontrado.",
          variant: "destructive",
        });
        navigate('/planos');
      }
    }
  }, [plan, navigate, toast]);

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const response = await fetch('https://ldlxebhnkayiwksipvyc.supabase.co/functions/v1/create-stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbHhlYmhua2F5aXdrc2lwdnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDA2NTMsImV4cCI6MjA2NzIxNjY1M30.XTc1M64yGVGuY4FnOsy9D3q5Ov1HAoyuZAV8IPwYEZ0'}`,
        },
        body: JSON.stringify({
          planId: planInfo.id,
          companyData: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }

      // Redirecionar para o Stripe Checkout
      window.location.href = data.url;

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

  if (!planInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-calmon-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/planos')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dados da Empresa
              </h1>
              <p className="text-gray-600">
                Plano selecionado: {planInfo.displayName}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados Básicos */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Fantasia *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Nome Fantasia da Empresa"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="official_name">Razão Social *</Label>
                      <Input
                        id="official_name"
                        value={formData.official_name}
                        onChange={(e) => handleInputChange('official_name', e.target.value)}
                        placeholder="Razão Social da Empresa"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ *</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => {
                          const formatted = formatCNPJ(e.target.value);
                          setFormData(prev => ({ ...prev, cnpj: formatted }));
                        }}
                        placeholder="00.000.000/0000-00"
                        required
                        maxLength={18}
                        inputMode="numeric"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email da Empresa</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="contato@empresa.com"
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <CompanyAddressFields formData={formData} setFormData={setFormData} />

                  {/* Contato */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Contato Principal</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_name">Nome do Contato *</Label>
                        <Input
                          id="contact_name"
                          value={formData.contact_name}
                          onChange={(e) => handleInputChange('contact_name', e.target.value)}
                          placeholder="Nome completo"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Email do Contato *</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => handleInputChange('contact_email', e.target.value)}
                          placeholder="contato@exemplo.com"
                          required
                        />
                        <p className="text-xs text-blue-600">
                          Este email será usado para criar o acesso à plataforma
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-calmon-500 hover:bg-calmon-600 text-white"
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
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumo do Plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{planInfo.displayName}</h3>
                  <p className="text-sm text-gray-600">
                    Até {planInfo.maxCollaborators} colaboradores
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Período:</span>
                      <span className="font-medium">{planInfo.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Colaboradores:</span>
                      <span className="font-medium">Até {planInfo.maxCollaborators}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-gray-500">
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