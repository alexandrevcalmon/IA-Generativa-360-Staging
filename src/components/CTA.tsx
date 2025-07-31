
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Users, Building, Zap, Star, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StripePlan {
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

type PeriodType = 'anual' | 'semestral';

export function CTA() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('anual');
  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('https://ldlxebhnkayiwksipvyc.supabase.co/functions/v1/get-stripe-prices', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkbHhlYmhua2F5aXdrc2lwdnljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDA2NTMsImV4cCI6MjA2NzIxNjY1M30.XTc1M64yGVGuY4FnOsy9D3q5Ov1HAoyuZAV8IPwYEZ0'}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar planos');
        }

        const data = await response.json();
        setPlans(data.plans || []);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Erro ao carregar planos');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPlanIcon = (maxCollaborators: number) => {
    if (maxCollaborators <= 5) return Users;
    if (maxCollaborators <= 10) return Building;
    if (maxCollaborators <= 25) return Zap;
    if (maxCollaborators <= 50) return Star;
    return Crown;
  };

  const getPlanGradient = (maxCollaborators: number) => {
    if (maxCollaborators <= 5) return 'from-blue-500 to-cyan-600';
    if (maxCollaborators <= 10) return 'from-emerald-500 to-teal-600';
    if (maxCollaborators <= 25) return 'from-purple-500 to-indigo-600';
    if (maxCollaborators <= 50) return 'from-amber-500 to-yellow-600';
    return 'from-red-500 to-pink-600';
  };

  const filteredPlans = plans.filter(plan => {
    if (selectedPeriod === 'semestral') {
      return plan.subscription_period_days === 180;
    } else {
      return plan.subscription_period_days === 365;
    }
  });

  if (loading) {
    return (
      <section id="plans-section" className="relative py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Pronto para começar sua{' '}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                jornada?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que já transformaram suas carreiras conosco.
            </p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="plans-section" className="relative py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Pronto para começar sua{' '}
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                jornada?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que já transformaram suas carreiras conosco.
            </p>
            <p className="text-red-600">{error}</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="plans-section" className="relative py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-amber-200/30 to-yellow-300/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-purple-300/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border border-amber-500/20 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Escolha Seu Plano
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Pronto para começar sua{' '}
            <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              jornada?
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Junte-se a milhares de profissionais que já transformaram suas carreiras conosco.
          </p>

          {/* Period Selector */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center mb-12"
          >
            <div className="bg-white rounded-2xl p-2 shadow-xl border border-gray-200">
              <Button
                variant={selectedPeriod === 'semestral' ? 'default' : 'ghost'}
                onClick={() => setSelectedPeriod('semestral')}
                className={`w-32 px-8 py-3 rounded-xl transition-all duration-300 ${
                  selectedPeriod === 'semestral' 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg' 
                    : 'hover:bg-gray-100'
                }`}
              >
                Semestral
              </Button>
              <Button
                variant={selectedPeriod === 'anual' ? 'default' : 'ghost'}
                onClick={() => setSelectedPeriod('anual')}
                className={`w-32 px-8 py-3 rounded-xl transition-all duration-300 relative ${
                  selectedPeriod === 'anual' 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg' 
                    : 'hover:bg-gray-100'
                }`}
              >
                Anual
                <span className="absolute -top-10 -right-2 text-[10px] text-white font-bold bg-gradient-to-r from-emerald-500 to-teal-600 px-2 py-1 rounded-full shadow-lg">
                  💰 -17% no anual
                </span>
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Plans Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16"
        >
          {filteredPlans.map((plan, index) => {
            const IconComponent = getPlanIcon(plan.max_collaborators)
            const gradient = getPlanGradient(plan.max_collaborators)
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group h-full"
              >
                <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border-0 shadow-xl bg-white/80 backdrop-blur-sm h-full flex flex-col">
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-r ${gradient} p-6 text-white text-center relative overflow-hidden flex-shrink-0`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center mb-4">
                        <IconComponent className="h-8 w-8 mr-3" />
                        <Badge variant="secondary" className="bg-white/20 text-white text-xs border-white/30">
                          {plan.max_collaborators} colaboradores
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-white/90 text-sm">
                        {selectedPeriod === 'semestral' ? '6 meses' : '12 meses'}
                      </p>
                    </div>
                  </div>

                  <CardContent className="text-center pb-6 pt-8 flex-grow flex flex-col justify-center">
                    <div className="mb-6">
                      <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {plan.price ? (
                          <>
                            R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </>
                        ) : (
                          'Preço não disponível'
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        por mês
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 pb-6 flex-shrink-0">
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                      onClick={() => {
                        window.location.href = `/checkout/company-data?plan=${plan.id}`
                      }}
                    >
                      <span>Escolher Este Plano</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Benefits Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-white to-slate-50 border border-gray-200 rounded-3xl p-8 max-w-6xl mx-auto shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border border-amber-500/20 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Benefícios Inclusos
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🧠 Todos os planos incluem:</h2>
              <p className="text-gray-600 text-lg">Recursos completos para transformar sua empresa</p>
            </div>
            <div className="flex justify-center">
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl ml-4">
                <div className="space-y-6">
                  <div className="flex items-start group">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-gray-900 font-semibold text-lg">Suporte via chat inteligente 24/7</span>
                      <p className="text-gray-600 mt-1">Atendimento automatizado e inteligente</p>
                    </div>
                  </div>
                  <div className="flex items-start group">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-gray-900 font-semibold text-lg">Workshop Online Gravado</span>
                      <p className="text-gray-600 mt-1">Atualizado continuamente com as últimas tendências</p>
                    </div>
                  </div>
                  <div className="flex items-start group">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-gray-900 font-semibold text-lg">2h Mentoria Plantão Tira-Dúvidas</span>
                      <p className="text-gray-600 mt-1">Coletiva mensal online</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start group">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-gray-900 font-semibold text-lg">1h Mentoria de Atualizações</span>
                      <p className="text-gray-600 mt-1">Coletiva mensal online</p>
                    </div>
                  </div>
                  <div className="flex items-start group">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-gray-900 font-semibold text-lg">Palestra "A Revolução da IA"</span>
                      <p className="text-gray-600 mt-1">Coletiva mensal online</p>
                    </div>
                  </div>
                  <div className="flex items-start group">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-gray-900 font-semibold text-lg">Certificado de Conclusão</span>
                      <p className="text-gray-600 mt-1">Reconhecido pelo mercado</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border border-amber-500/20 rounded-2xl px-8 py-4">
            <Star className="w-5 h-5 text-amber-600 mr-3" />
            <span className="text-amber-700 font-semibold text-lg">
              Transforme sua empresa hoje mesmo e garanta sua vantagem competitiva
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
