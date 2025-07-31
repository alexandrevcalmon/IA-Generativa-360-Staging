import { PageLayout } from "@/components/PageLayout";
import { PageSection } from "@/components/PageSection";
import { StatsGrid, type StatItem } from "@/components/StatsGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Crown,
  Star,
  Users,
  Check,
  Zap,
  Building2,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  DollarSign,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { CreatePlanDialog } from "@/components/CreatePlanDialog";
import { EditPlanDialog } from "@/components/EditPlanDialog";
import { useStripePrices } from "@/hooks/useStripePrices";
import { useCompaniesWithPlans } from "@/hooks/useCompaniesWithPlans";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  // Campos adicionais que podem estar presentes
  description?: string | null;
  max_students?: number;
  semester_price?: number;
  annual_price?: number;
  is_active?: boolean;
}

const ProducerPlans = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StripePlan | null>(null);

  const { plans, loading: plansLoading, error: plansError } = useStripePrices();
  const { data: companies = [], isLoading: companiesLoading, refetch: refetchCompanies } = useCompaniesWithPlans();

  // Buscar dados de contagem diretamente do banco
  const [planCounts, setPlanCounts] = useState<{[key: string]: number}>({});
  
  useEffect(() => {
    const fetchPlanCounts = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_plan_companies_count');
        
        if (error) {
          console.error('Error fetching plan counts:', error);
          return;
        }
        
        const counts: {[key: string]: number} = {};
        data?.forEach((item: any) => {
          counts[item.plan_id] = item.companies_count;
        });
        
        setPlanCounts(counts);
      } catch (error) {
        console.error('Error in fetchPlanCounts:', error);
      }
    };
    
    fetchPlanCounts();
  }, []);

  const handleRefresh = async () => {
    await refetchCompanies();
    window.location.reload();
  };

  const handleSyncPrices = async () => {
    try {
      // Chamar a Edge Function get-stripe-analytics que agora sincroniza preços
      const { data, error } = await supabase.functions.invoke('get-stripe-analytics', {
        body: {}
      });

      if (error) {
        console.error('Erro ao sincronizar preços:', error);
        toast.error('Erro ao sincronizar preços do Stripe');
        return;
      }

      if (data?.success) {
        console.log('✅ Preços sincronizados com sucesso');
        toast.success('Preços sincronizados com o Stripe!');
        // Recarregar os dados dos planos
        window.location.reload();
      } else {
        toast.error('Erro na sincronização de preços');
      }
    } catch (error) {
      console.error('Erro ao sincronizar preços:', error);
      toast.error('Erro ao sincronizar preços do Stripe');
    }
  };

  const getColorClasses = (index: number, variant: 'bg' | 'border' | 'text') => {
    const colors = ['gray', 'blue', 'purple'];
    const color = colors[index % colors.length];
    
    const colorMap = {
      gray: {
        bg: "!bg-gray-700",
        border: "!border-gray-600",
        text: "!text-gray-300"
      },
      blue: {
        bg: "!bg-blue-500/20",
        border: "!border-blue-500/30", 
        text: "!text-blue-400"
      },
      purple: {
        bg: "!bg-purple-500/20",
        border: "!border-purple-500/30",
        text: "!text-purple-400"
      }
    };
    return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.gray[variant];
  };

  const getPlanIcon = (maxCollaborators: number) => {
    if (maxCollaborators <= 5) return Zap;
    if (maxCollaborators <= 25) return Star;
    return Crown;
  };

  const totalCompanies = companies.length;
  
  const totalRevenue = companies.length > 0 ? companies.reduce((sum, company) => {
    // Encontrar o plano correspondente usando o subscription_plan_id da empresa
    const plan = plans.find(p => p.id === company.subscription_plan_id);
    
    if (plan && plan.price) {
      let planPrice = Number(plan.price);
      
      // Calcular receita baseada no período de cobrança
      if (company.billing_period === 'annual' && plan.annual_price) {
        planPrice = Number(plan.annual_price);
        return sum + (planPrice / 12); // Receita mensal
      } else if (company.billing_period === 'semester' && plan.semester_price) {
        planPrice = Number(plan.semester_price);
        return sum + (planPrice / 6); // Receita mensal
      } else {
        // Se não especificado, usar o preço padrão
        return sum + planPrice;
      }
    }
    return sum;
  }, 0) : 0;
  
  // Contagem de empresas por plano usando dados do banco
  const planStats = plans.map(plan => ({
    ...plan,
    companies_count: planCounts[plan.id] || 0
  }));

  const mostPopularPlan = planStats.reduce((max, plan) => 
    plan.companies_count > (max?.companies_count || 0) ? plan : max, planStats[0]);

  // Stats para o StatsGrid - CORRIGIDO para mostrar dados reais e úteis
  const statsItems: StatItem[] = [
    {
      title: "Total de Empresas",
      value: companies.length,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Empresas com Planos",
      value: companies.filter(company => company.subscription_plan_id).length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Planos Disponíveis",
      value: plans.length,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Receita Mensal",
      value: companies.length > 0 
        ? `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : "R$ 0,00",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    }
  ];

  // Debug: Log dos dados reais
  console.log('📊 Dados reais:', {
    total_empresas: companies.length,
    empresas_com_planos: companies.filter(company => company.subscription_plan_id).length,
    planos_disponiveis: plans.length,
    receita_total: totalRevenue
  });

  const handleEditPlan = (plan: StripePlan) => {
    setSelectedPlan(plan);
    setEditDialogOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm("Tem certeza que deseja desativar este plano? Empresas com este plano não serão afetadas.")) {
      // Implementar lógica de desativação do plano no Stripe
      console.log('Desativando plano:', planId);
    }
  };

  // Header content com botão de criar plano
  const headerContent = (
    <div className="flex space-x-2">
      <Button 
        onClick={handleRefresh}
        variant="outline"
        className="flex items-center !border-gray-600 !text-gray-300 hover:!bg-gray-700 hover:!text-white"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Atualizar
      </Button>
      <Button 
        onClick={handleSyncPrices}
        variant="outline"
        className="flex items-center !border-green-600 !text-green-300 hover:!bg-green-700 hover:!text-white"
      >
        <DollarSign className="h-4 w-4 mr-2" />
        Sincronizar Preços
      </Button>
      <Button 
        onClick={() => setCreateDialogOpen(true)}
        className="!bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Novo Plano
      </Button>
    </div>
  );

  if (plansLoading || companiesLoading) {
    return (
      <PageLayout
        title="Gerenciar Planos"
        subtitle="Carregando dados..."
        background="dark"
      >
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map((i) => (
              <div key={i} className="!bg-gray-700 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  // Verificar se há planos
  if (!plansLoading && plans.length === 0) {
    return (
      <PageLayout
        title="Gerenciar Planos"
        subtitle="Nenhum plano encontrado"
        headerContent={headerContent}
        background="dark"
        className="dark-theme-override"
      >
        <div className="text-center py-12">
          <div className="!text-gray-400 mb-4">
            <CreditCard className="h-16 w-16 mx-auto mb-4 !text-gray-500" />
            <h3 className="text-lg font-medium !text-white mb-2">Nenhum plano cadastrado</h3>
            <p className="!text-gray-300">
              Não foram encontrados planos de assinatura cadastrados no Stripe.
            </p>
            {plansError && (
              <div className="mt-4 p-4 !bg-red-500/10 !border !border-red-500/30 rounded-lg">
                <p className="!text-red-300 font-medium">Erro ao carregar planos:</p>
                <p className="!text-red-200 text-sm">{plansError}</p>
              </div>
            )}
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="!bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Plano
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Gerenciar Planos"
      subtitle="Gerencie os planos de assinatura das empresas clientes"
      headerContent={headerContent}
      background="dark"
      className="dark-theme-override"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <StatsGrid stats={statsItems} />

        {/* Plans Grid */}
        <PageSection transparent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {planStats.map((plan, index) => {
              const IconComponent = getPlanIcon(plan.max_collaborators);
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative hover-lift !bg-gray-800 !border-gray-700 ${
                    plan.companies_count === mostPopularPlan?.companies_count && plan.companies_count > 0 
                      ? '!ring-2 !ring-blue-500 !ring-opacity-50' : ''
                  }`}
                >
                  {plan.companies_count === mostPopularPlan?.companies_count && plan.companies_count > 0 && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white px-4 py-1">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-full ${getColorClasses(index, 'bg')} flex items-center justify-center`}>
                      <IconComponent className={`h-8 w-8 ${getColorClasses(index, 'text')}`} />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold !text-white">{plan.name}</h3>
                      <p className="!text-gray-300 mt-2">
                        {plan.subscription_period_days === 180 ? 'Plano Semestral' : 'Plano Anual'}
                      </p>
                    </div>
                    
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold !text-white">
                        {plan.price ? `R$ ${Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                      </span>
                      <span className="!text-gray-300 ml-1">
                        /{plan.subscription_period_days === 180 ? 'semestre' : 'ano'}
                      </span>
                    </div>
                    <p className="text-md !text-gray-400 mt-1">
                      {plan.subscription_period_days === 180 ? '6 meses' : '12 meses'}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Check className="h-4 w-4 !text-green-400 flex-shrink-0" />
                        <span className="text-sm !text-gray-300">Até {plan.max_collaborators} colaboradores</span>
                      </div>
                      {Array.isArray(plan.features) && plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Check className="h-4 w-4 !text-green-400 flex-shrink-0" />
                          <span className="text-sm !text-gray-300">
                            {typeof feature === 'string' ? feature : feature.title || 'Recurso'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className={`p-4 rounded-lg ${getColorClasses(index, 'bg')} ${getColorClasses(index, 'border')} !border`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium !text-gray-300">Empresas no plano</p>
                          <p className="text-2xl font-bold !text-white">{plan.companies_count}</p>
                        </div>
                        <Users className={`h-8 w-8 ${getColorClasses(index, 'text')}`} />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                        className="flex-1 !border-gray-600 !text-gray-300 hover:!bg-gray-700 hover:!text-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="!text-red-400 hover:!text-red-300 !border-red-500/30 hover:!bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </PageSection>

        {/* Plan Comparison */}
        <PageSection>
          <Card className="!bg-gray-800 !border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center !text-white">
                <CreditCard className="h-5 w-5 mr-2 !text-blue-400" />
                Comparativo de Planos
              </CardTitle>
              <CardDescription className="!text-gray-300">
                Visão detalhada das diferenças entre os planos disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="!border-gray-700">
                      <TableHead className="!text-gray-300">Plano</TableHead>
                      <TableHead className="!text-gray-300">Período</TableHead>
                      <TableHead className="!text-gray-300">Preço</TableHead>
                      <TableHead className="!text-gray-300">Colaboradores</TableHead>
                      <TableHead className="!text-gray-300">Empresas</TableHead>
                      <TableHead className="!text-gray-300">Receita do Plano</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planStats.map((plan) => {
                      // Calcular receita do plano: empresas × valor do plano
                      let planRevenue = 0;
                      
                      if (plan.companies_count > 0 && plan.price) {
                        const basePrice = Number(plan.price);
                        
                        // Ajustar receita baseado no período
                        if (plan.subscription_period_days === 180) {
                          // Plano semestral: receita por 6 meses
                          planRevenue = plan.companies_count * basePrice;
                        } else {
                          // Plano anual: receita por 12 meses
                          planRevenue = plan.companies_count * basePrice;
                        }
                      }
                      
                      return (
                        <TableRow key={plan.id} className="!border-gray-700">
                          <TableCell className="font-medium !text-white">{plan.name}</TableCell>
                          <TableCell className="!text-gray-300">
                            {plan.subscription_period_days === 180 ? 'Semestral' : 'Anual'}
                          </TableCell>
                          <TableCell className="!text-gray-300">
                            {plan.price ? `R$ ${Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                          </TableCell>
                          <TableCell className="!text-gray-300">{plan.max_collaborators}</TableCell>
                          <TableCell className="!text-gray-300">{plan.companies_count}</TableCell>
                          <TableCell className="!text-gray-300">
                            {planRevenue > 0 
                              ? `R$ ${planRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                              : 'R$ 0,00'
                            }
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {/* Total da receita */}
                <div className="mt-6 p-4 !bg-gradient-to-r !from-green-500/20 !to-blue-500/20 rounded-lg !border !border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold !text-white">Receita Total dos Planos</h4>
                      <p className="!text-gray-300 text-sm">Soma da receita de todos os planos ativos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold !text-green-300">
                        R$ {planStats.reduce((total, plan) => {
                          const planRevenue = (plan.companies_count || 0) * (Number(plan.price) || 0);
                          return total + planRevenue;
                        }, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="!text-gray-300 text-sm">
                        {planStats.reduce((total, plan) => total + (plan.companies_count || 0), 0)} empresas ativas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageSection>
      </div>

      <CreatePlanDialog 
        isOpen={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
      />
      
      <EditPlanDialog 
        isOpen={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        plan={selectedPlan}
      />
    </PageLayout>
  );
};

export default ProducerPlans;
