import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Users, Calendar, CreditCard } from 'lucide-react';
import { STRIPE_PLANS } from '@/lib/stripe';

interface Plan {
  id: string;
  name: string;
  maxCollaborators: number;
  period: string;
  displayName: string;
  price?: number;
  currency?: string;
}

export default function Planos() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    // Converter planos do Stripe para formato da UI
    const planList = Object.entries(STRIPE_PLANS).map(([id, info]) => ({
      id,
      ...info,
    }));
    setPlans(planList);
    setLoading(false);
  }, []);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Redirecionar para formulário de dados da empresa
    window.location.href = `/checkout/company-data?plan=${planId}`;
  };

  const groupedPlans = plans.reduce((acc, plan) => {
    const baseName = plan.name;
    if (!acc[baseName]) {
      acc[baseName] = [];
    }
    acc[baseName].push(plan);
    return acc;
  }, {} as Record<string, Plan[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-calmon-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Escolha seu Plano
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Selecione o plano ideal para sua empresa e comece a transformar o aprendizado dos seus colaboradores
            </p>
          </div>
        </div>
      </div>

      {/* Planos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {Object.entries(groupedPlans).map(([baseName, planVariations]) => (
          <div key={baseName} className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{baseName}</h2>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>Até {planVariations[0].maxCollaborators} colaboradores</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {planVariations.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-200 hover:shadow-lg ${
                    plan.period === 'anual' ? 'border-calmon-500 ring-2 ring-calmon-500 ring-opacity-20' : 'border-gray-200'
                  }`}
                >
                  {plan.period === 'anual' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-calmon-500 text-white">
                        Mais Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {plan.period === 'semestral' ? 'Semestral' : 'Anual'}
                    </CardTitle>
                    <CardDescription>
                      Pagamento {plan.period === 'semestral' ? 'a cada 6 meses' : 'anual'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center pb-6">
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        Consulte valores
                      </div>
                      <p className="text-sm text-gray-600">
                        {plan.period === 'semestral' ? 'por semestre' : 'por ano'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Até {plan.maxCollaborators} colaboradores</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Cursos ilimitados</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Relatórios de progresso</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Suporte por email</span>
                      </div>
                      {plan.period === 'anual' && (
                        <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>2 meses grátis</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className={`w-full ${
                        plan.period === 'anual'
                          ? 'bg-calmon-500 hover:bg-calmon-600'
                          : 'bg-gray-600 hover:bg-gray-700'
                      } text-white`}
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={selectedPlan === plan.id}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {selectedPlan === plan.id ? 'Selecionado' : 'Assinar Agora'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Tem dúvidas sobre qual plano escolher?
            </p>
            <p className="text-sm">
              Entre em contato conosco: <a href="mailto:contato@exemplo.com" className="text-calmon-600 hover:underline">contato@exemplo.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 