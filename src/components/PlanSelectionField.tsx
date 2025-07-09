
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubscriptionPlan } from "@/hooks/useSubscriptionPlans";

interface PlanSelectionFieldProps {
  plans: SubscriptionPlan[];
  selectedPlanId: string | null;
  selectedBillingPeriod: 'semester' | 'annual' | null;
  onPlanChange: (planId: string, billingPeriod: 'semester' | 'annual') => void;
  isLoading?: boolean;
  error?: Error | null;
  required?: boolean;
}

export function PlanSelectionField({ 
  plans, 
  selectedPlanId, 
  selectedBillingPeriod,
  onPlanChange, 
  isLoading, 
  error, 
  required = false 
}: PlanSelectionFieldProps) {
  
  console.log('📋 PlanSelectionField render:', {
    plansCount: plans?.length || 0,
    selectedPlanId,
    selectedBillingPeriod,
    isLoading,
    error: !!error,
    required
  });

  // Criar opções combinando plano e período de cobrança
  const planOptions = plans?.filter(p => p.is_active).flatMap(plan => {
    const options = [];
    
    // Adicionar opção semestral se disponível
    if (plan.semester_price && plan.semester_price > 0) {
      options.push({
        value: `${plan.id}:semester`,
        label: `${plan.name} (Semestral: R$${plan.semester_price.toFixed(2)}) - Máx: ${plan.max_students} alunos`,
        planId: plan.id,
        billingPeriod: 'semester' as const,
        price: plan.semester_price
      });
    }
    
    // Adicionar opção anual se disponível
    if (plan.annual_price && plan.annual_price > 0) {
      options.push({
        value: `${plan.id}:annual`,
        label: `${plan.name} (Anual: R$${plan.annual_price.toFixed(2)}) - Máx: ${plan.max_students} alunos`,
        planId: plan.id,
        billingPeriod: 'annual' as const,
        price: plan.annual_price
      });
    }
    
    return options;
  }) || [];

  console.log('📋 Plan options generated:', planOptions);

  const currentValue = selectedPlanId && selectedBillingPeriod 
    ? `${selectedPlanId}:${selectedBillingPeriod}` 
    : "";

  console.log('📋 Current value:', currentValue);

  const handleSelectionChange = (value: string) => {
    console.log('📋 Selection changing to:', value);
    
    if (!value) {
      console.log('❌ Empty value received');
      return;
    }
    
    const [planId, billingPeriod] = value.split(':');
    
    if (!planId || !billingPeriod) {
      console.log('❌ Invalid value format:', { planId, billingPeriod });
      return;
    }
    
    if (billingPeriod !== 'semester' && billingPeriod !== 'annual') {
      console.log('❌ Invalid billing period:', billingPeriod);
      return;
    }
    
    console.log('✅ Calling onPlanChange with:', { planId, billingPeriod });
    onPlanChange(planId, billingPeriod as 'semester' | 'annual');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="plan">Plano de Assinatura {required && '*'}</Label>
      <Select
        onValueChange={handleSelectionChange}
        required={required}
        value={currentValue}
        disabled={isLoading || !!error}
      >
        <SelectTrigger>
          <SelectValue placeholder={
            isLoading 
              ? "Carregando planos..." 
              : (error ? "Erro ao carregar planos" : "Selecione um plano e período de cobrança")
          } />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {planOptions.length > 0 ? (
            planOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-plans" disabled>
              {error ? "Erro ao carregar planos" : "Nenhum plano disponível"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-red-500">
          Erro ao carregar planos. Tente recarregar a página.
        </p>
      )}
      {!isLoading && !error && planOptions.length === 0 && (
        <p className="text-xs text-orange-500">
          Nenhum plano de assinatura disponível no momento.
        </p>
      )}
    </div>
  );
}
