
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { PlanSelectionField } from "@/components/PlanSelectionField";
import { CompanyData } from "@/hooks/useCompanies";
import { SubscriptionPlan } from "@/hooks/useSubscriptionPlans";

interface CompanyAdditionalFieldsProps {
  formData: CompanyData;
  setFormData: React.Dispatch<React.SetStateAction<CompanyData>>;
  plans: SubscriptionPlan[];
  plansLoading: boolean;
  plansError: Error | null;
  onPlanChange: (planId: string, billingPeriod: 'semester' | 'annual') => void;
}

export function CompanyAdditionalFields({ 
  formData, 
  setFormData, 
  plans, 
  plansLoading, 
  plansError, 
  onPlanChange 
}: CompanyAdditionalFieldsProps) {
  return (
    <>
      <PlanSelectionField
        plans={plans || []}
        selectedPlanId={formData.subscription_plan_id}
        selectedBillingPeriod={formData.billing_period || null}
        onPlanChange={onPlanChange}
        isLoading={plansLoading}
        error={plansError}
        required={false}
      />

      <div className="space-y-2">
        <Label htmlFor="edit-notes">Observações</Label>
        <Textarea
          id="edit-notes"
          placeholder="Alguma observação sobre a empresa..."
          value={formData.notes || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-logo">Logo da Empresa (Opcional - Funcionalidade pendente)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-not-allowed bg-gray-50">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Upload do logo ainda não implementado</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG até 2MB</p>
        </div>
      </div>
    </>
  );
}
