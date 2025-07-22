
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
import { Company, useUpdateCompany } from "@/hooks/useCompanies";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useEditCompanyFormData } from "@/components/company/EditCompanyFormData";
import { CompanyBasicFields } from "@/components/company/CompanyBasicFields";
import { CompanyAddressFields } from "@/components/company/CompanyAddressFields";
import { CompanyContactFields } from "@/components/company/CompanyContactFields";
import { CompanyAdditionalFields } from "@/components/company/CompanyAdditionalFields";
import { useToast } from "@/hooks/use-toast";

interface EditCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

export function EditCompanyDialog({ isOpen, onClose, company }: EditCompanyDialogProps) {
  const { formData, setFormData } = useEditCompanyFormData(company, isOpen);
  const updateCompanyMutation = useUpdateCompany();
  const { toast } = useToast();
  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError
  } = useSubscriptionPlans();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    if (!formData.name) {
        toast.error({
          title: "Erro",
          description: "Nome Fantasia é obrigatório."
        });
        return;
    }

    try {
      console.log('Submitting company update:', { id: company.id, formData });
      
      await updateCompanyMutation.mutateAsync({ 
        id: company.id, 
        ...formData
      });
      onClose();
    } catch (error) {
      console.error("Failed to update company from dialog:", error);
      toast.error({
        title: "Erro",
        description: `Erro ao atualizar empresa: ${error.message}`
      });
    }
  };

  const handlePlanChange = (planId: string, billingPeriod: 'semester' | 'annual') => {
    setFormData(prev => ({ 
      ...prev, 
      subscription_plan_id: planId,
      billing_period: billingPeriod
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Building2 className="h-5 w-5 mr-2 text-calmon-600" />
            Editar Empresa: {company?.name}
          </DialogTitle>
          <DialogDescription>
            Atualize as informações da empresa cliente.
          </DialogDescription>
        </DialogHeader>

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
            <Button type="button" variant="outline" onClick={onClose} disabled={updateCompanyMutation.isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white min-w-[150px]"
              disabled={updateCompanyMutation.isPending || plansLoading || !!plansError}
            >
              {updateCompanyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {updateCompanyMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
