
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { useCreateCompany } from "@/hooks/useCompanies";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useCreateCompanyFormData } from "@/components/company/CreateCompanyFormData";
import { CompanyBasicFields } from "@/components/company/CompanyBasicFields";
import { CompanyAddressFields } from "@/components/company/CompanyAddressFields";
import { CompanyContactFields } from "@/components/company/CompanyContactFields";
import { CompanyAdditionalFields } from "@/components/company/CompanyAdditionalFields";
import { useToast } from "@/hooks/use-toast";

interface CreateCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCompanyDialog({ isOpen, onClose }: CreateCompanyDialogProps) {
  const { formData, setFormData } = useCreateCompanyFormData(isOpen);
  const createCompanyMutation = useCreateCompany();
  const { data: plans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans();
  const { toast } = useToast();

  console.log('🏢 CreateCompanyDialog render:', {
    isOpen,
    formData: {
      name: formData.name,
      contact_email: formData.contact_email,
      subscription_plan_id: formData.subscription_plan_id,
      billing_period: formData.billing_period
    },
    plansLoading,
    plansError,
    plansCount: plans?.length || 0,
    isCreating: createCompanyMutation.isPending
  });

  const validateForm = () => {
    // Validação do nome da empresa
    if (!formData.name || formData.name.trim() === '') {
      console.log('❌ Validation failed: Nome Fantasia is required');
      toast({
        title: "Erro de validação",
        description: "Nome Fantasia é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    // Validação do email de contato
    if (!formData.contact_email || formData.contact_email.trim() === '') {
      console.log('❌ Validation failed: Contact email is required');
      toast({
        title: "Erro de validação",
        description: "Email do contato é obrigatório para criar o acesso à plataforma.",
        variant: "destructive",
      });
      return false;
    }

    // Validação do formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      console.log('❌ Validation failed: Invalid email format');
      toast({
        title: "Erro de validação",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return false;
    }

    // Validação do plano de assinatura
    if (!formData.subscription_plan_id || !formData.billing_period) {
      console.log('❌ Validation failed: Subscription plan is required', {
        subscription_plan_id: formData.subscription_plan_id,
        billing_period: formData.billing_period
      });
      toast({
        title: "Erro de validação",
        description: "Por favor, selecione um plano de assinatura e período de cobrança.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submission started');
    console.log('📝 Form data:', formData);

    if (!validateForm()) {
      return;
    }

    console.log('✅ All validations passed, submitting...');

    try {
      await createCompanyMutation.mutateAsync(formData);
      console.log('✅ Company created successfully');
      
      // Clear form and close dialog
      onClose();
    } catch (error) {
      console.error('❌ Failed to create company from dialog:', error);
      
      // Show a user-friendly error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ocorreu um erro inesperado ao criar a empresa.';
        
      toast({
        title: "Erro ao criar empresa",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handlePlanChange = (planId: string, billingPeriod: 'semester' | 'annual') => {
    console.log('📋 Plan selection changed:', { planId, billingPeriod });
    setFormData(prev => ({ 
      ...prev, 
      subscription_plan_id: planId,
      billing_period: billingPeriod
    }));
  };

  // Verificar se o botão deve estar desabilitado
  const isSubmitDisabled = createCompanyMutation.isPending || plansLoading || !!plansError;
  
  console.log('🔘 Submit button state:', {
    isDisabled: isSubmitDisabled,
    reasons: {
      isPending: createCompanyMutation.isPending,
      plansLoading: plansLoading,
      plansError: !!plansError
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Building2 className="h-5 w-5 mr-2 text-calmon-600" />
            Cadastrar Nova Empresa
          </DialogTitle>
          <DialogDescription>
            Preencha as informações da empresa cliente. Um usuário de acesso será criado automaticamente 
            com o email do contato fornecido.
          </DialogDescription>
        </DialogHeader>

        {plansError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">
              Erro ao carregar planos de assinatura. Tente recarregar a página.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 py-4">
          <CompanyBasicFields formData={formData} setFormData={setFormData} />
          <CompanyAddressFields formData={formData} setFormData={setFormData} />
          <CompanyContactFields formData={formData} setFormData={setFormData} />
          <CompanyAdditionalFields
            formData={formData}
            setFormData={setFormData}
            plans={plans || []}
            plansLoading={plansLoading}
            plansError={plansError}
            onPlanChange={handlePlanChange}
          />

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={createCompanyMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white min-w-[150px]"
              disabled={isSubmitDisabled}
            >
              {createCompanyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {createCompanyMutation.isPending ? "Cadastrando..." : "Cadastrar Empresa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
