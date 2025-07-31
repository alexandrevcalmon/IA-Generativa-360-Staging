import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Users, Calendar, CreditCard, Star, Zap, Crown } from 'lucide-react'
import { useStripePrices } from '@/hooks/useStripePrices'

type PeriodType = 'anual' | 'semestral'

export default function Planos() {
  const { plans, loading, error, getPlansByPeriod } = useStripePrices()
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('anual')

  // Usar apenas dados reais do banco
  const filteredPlans = getPlansByPeriod(selectedPeriod)

  const getPlanIcon = (maxCollaborators: number) => {
    if (maxCollaborators <= 5) return Zap
    if (maxCollaborators <= 25) return Star
    return Crown
  }

  const getPlanGradient = (maxCollaborators: number) => {
    if (maxCollaborators <= 5) return 'from-blue-500 to-cyan-500'
    if (maxCollaborators <= 25) return 'from-purple-500 to-pink-500'
    return 'from-orange-500 to-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando planos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || filteredPlans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Escolha o Plano Ideal para sua Empresa
            </h1>
            <div className="mt-8 p-6 bg-red-100 border border-red-400 rounded-lg max-w-2xl mx-auto">
              <p className="text-red-800 font-medium mb-2">
                Erro ao carregar planos
              </p>
              <p className="text-red-700 text-sm">
                {error || 'Nenhum plano encontrado. Tente recarregar a página.'}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Recarregar Página
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para sua Empresa
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Planos flexíveis que crescem junto com sua equipe. Escolha entre pagamento semestral ou anual.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            <Button
              variant={selectedPeriod === 'semestral' ? 'default' : 'ghost'}
              onClick={() => setSelectedPeriod('semestral')}
              className="w-32 px-8 py-3 rounded-md transition-all duration-200"
            >
              Semestral
            </Button>
            <Button
              variant={selectedPeriod === 'anual' ? 'default' : 'ghost'}
              onClick={() => setSelectedPeriod('anual')}
              className="w-32 px-8 py-3 rounded-md transition-all duration-200 relative"
            >
              Anual
              <span className="absolute -top-5 -right-1 text-xs text-green-600 font-medium bg-white px-1 rounded">
                Economia de -17%
              </span>
            </Button>
          </div>
        </div>

        {/* Plans Grid - All 5 plans in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {filteredPlans.map((plan) => {
            const IconComponent = getPlanIcon(plan.max_collaborators)
            const gradient = getPlanGradient(plan.max_collaborators)
            
            return (
              <Card 
                key={plan.id} 
                className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${gradient} p-4 text-white text-center`}>
                  <div className="flex items-center justify-center mb-3">
                    <IconComponent className="h-6 w-6 mr-2" />
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      {plan.max_collaborators} colaboradores
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-white/80 mt-1 text-sm">
                    {selectedPeriod === 'semestral' ? '6 meses' : '12 meses'}
                  </p>
                </div>

                <CardContent className="text-center pb-6 pt-6">
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
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

                <CardFooter className="pt-0">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 text-sm"
                    onClick={() => {
                      // Redirecionar para checkout com o plano selecionado
                      window.location.href = `/checkout/company-data?plan=${plan.id}`
                    }}
                  >
                    Escolher Este Plano
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Benefits Section - Moved below plans */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-8 max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🧠 Todos os planos incluem:</h2>
              <p className="text-gray-600">Recursos completos para transformar sua empresa</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-medium">Suporte via chat inteligente 24/7</span>
                    <p className="text-sm text-gray-600 mt-1">Atendimento automatizado e inteligente</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-medium">Workshop Online Gravado</span>
                    <p className="text-sm text-gray-600 mt-1">Atualizado continuamente com as últimas tendências</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-medium">2h Mentoria Plantão Tira-Dúvidas</span>
                    <p className="text-sm text-gray-600 mt-1">Coletiva mensal online</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-medium">1h Mentoria de Atualizações</span>
                    <p className="text-sm text-gray-600 mt-1">Coletiva mensal online</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-medium">Palestra "A Revolução da IA"</span>
                    <p className="text-sm text-gray-600 mt-1">Coletiva mensal online</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-800 font-medium">Palestra "Gestão Emocional"</span>
                    <p className="text-sm text-gray-600 mt-1">Coletiva mensal online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Garantia de 7 Dias</h3>
            </div>
            <p className="text-gray-700 text-base leading-relaxed">
              Experimente por 7 dias com garantia total: se não ficar satisfeito, devolvemos seu investimento integralmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
