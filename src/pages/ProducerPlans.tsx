
import { SidebarTrigger } from "@/components/ui/sidebar";
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
  Trash2
} from "lucide-react";
import { useState } from "react";
import { CreatePlanDialog } from "@/components/CreatePlanDialog";
import { EditPlanDialog } from "@/components/EditPlanDialog";
import { useSubscriptionPlans, useDeleteSubscriptionPlan, SubscriptionPlan } from "@/hooks/useSubscriptionPlans";
import { useCompaniesWithPlans } from "@/hooks/useCompaniesWithPlans";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProducerPlans = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const { data: plans = [], isLoading: plansLoading } = useSubscriptionPlans();
  const { data: companies = [], isLoading: companiesLoading } = useCompaniesWithPlans();
  const deletePlanMutation = useDeleteSubscriptionPlan();

  const getColorClasses = (index: number, variant: 'bg' | 'border' | 'text') => {
    const colors = ['gray', 'blue', 'purple'];
    const color = colors[index % colors.length];
    
    const colorMap = {
      gray: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-600"
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200", 
        text: "text-blue-600"
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-600"
      }
    };
    return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.gray[variant];
  };

  const totalCompanies = companies.length;
  const totalRevenue = companies.reduce((sum, company) => {
    return sum + ((company.subscription_plan?.annual_price || 0) / 12);
  }, 0);
  
  const planStats = plans.map(plan => ({
    ...plan,
    companies_count: companies.filter(company => company.subscription_plan?.id === plan.id).length
  }));

  const mostPopularPlan = planStats.reduce((max, plan) => 
    plan.companies_count > (max?.companies_count || 0) ? plan : max, planStats[0]);

  const stats = [
    {
      title: "Total de Empresas",
      value: totalCompanies,
      icon: Building2,
      color: "blue"
    },
    {
      title: "Receita Mensal",
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "green"
    },
    {
      title: "Plano Mais Popular",
      value: mostPopularPlan?.name || "N/A",
      icon: Star,
      color: "blue"
    },
    {
      title: "Planos Ativos",
      value: plans.filter(plan => plan.is_active).length,
      icon: Zap,
      color: "purple"
    }
  ];

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setEditDialogOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm("Tem certeza que deseja desativar este plano? Empresas com este plano não serão afetadas.")) {
      await deletePlanMutation.mutateAsync(planId);
    }
  };

  if (plansLoading || companiesLoading) {
    return (
      <div className="flex flex-col h-full">
        <header className="border-b bg-white px-6 py-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Planos</h1>
              <p className="text-gray-600">Carregando...</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map((i) => (
                <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Planos</h1>
              <p className="text-gray-600">Gerencie os planos de assinatura das empresas clientes</p>
            </div>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${
                      stat.color === 'blue' ? 'text-blue-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {planStats.map((plan, index) => (
              <Card 
                key={plan.id} 
                className={`relative hover-lift ${
                  plan.companies_count === mostPopularPlan?.companies_count && plan.companies_count > 0 
                    ? 'ring-2 ring-calmon-500 ring-opacity-50' : ''
                } ${!plan.is_active ? 'opacity-60' : ''}`}
              >
                {plan.companies_count === mostPopularPlan?.companies_count && plan.companies_count > 0 && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-calmon-500 to-calmon-700 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                {!plan.is_active && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="destructive">Inativo</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full ${getColorClasses(index, 'bg')} flex items-center justify-center`}>
                    {index === 0 ? <Building2 className={`h-8 w-8 ${getColorClasses(index, 'text')}`} /> :
                     index === 1 ? <Star className={`h-8 w-8 ${getColorClasses(index, 'text')}`} /> :
                     <Crown className={`h-8 w-8 ${getColorClasses(index, 'text')}`} />}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-gray-600 mt-2">{plan.description}</p>
                  </div>
                  
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">R$ {plan.annual_price.toFixed(2)}</span>
                    <span className="text-gray-600 ml-1">/ano</span>
                  </div>
                  <p className="text-md text-gray-500 mt-1">
                    Semestral: R$ {plan.semester_price.toFixed(2)}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Até {plan.max_students} colaboradores</span>
                    </div>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className={`p-4 rounded-lg ${getColorClasses(index, 'bg')} ${getColorClasses(index, 'border')} border`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Empresas no plano</p>
                        <p className="text-2xl font-bold">{plan.companies_count}</p>
                      </div>
                      <Users className={`h-8 w-8 ${getColorClasses(index, 'text')}`} />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={!plan.is_active}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Plan Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-calmon-600" />
                Comparativo de Planos
              </CardTitle>
              <CardDescription>
                Visão detalhada das diferenças entre os planos disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plano</TableHead>
                      <TableHead>Preço Semestral</TableHead>
                      <TableHead>Preço Anual</TableHead>
                      <TableHead>Colaboradores</TableHead>
                      <TableHead>Empresas</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planStats.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>R$ {plan.semester_price.toFixed(2)}</TableCell>
                        <TableCell>R$ {plan.annual_price.toFixed(2)}</TableCell>
                        <TableCell>{plan.max_students}</TableCell>
                        <TableCell>{plan.companies_count}</TableCell>
                        <TableCell>
                          <Badge variant={plan.is_active ? "default" : "destructive"}>
                            {plan.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
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
    </div>
  );
};

export default ProducerPlans;
