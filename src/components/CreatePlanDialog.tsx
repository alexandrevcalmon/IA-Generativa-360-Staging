
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useCreateSubscriptionPlan, CreatePlanData } from "@/hooks/useSubscriptionPlans";

interface CreatePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePlanDialog({ isOpen, onClose }: CreatePlanDialogProps) {
  const [formData, setFormData] = useState<CreatePlanData>({
    name: "",
    description: "",
    semester_price: 0,
    annual_price: 0,
    max_students: 50,
    features: [""]
  });

  const createPlanMutation = useCreateSubscriptionPlan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanFeatures = formData.features.filter(feature => feature.trim() !== "");
    
    await createPlanMutation.mutateAsync({
      ...formData,
      features: cleanFeatures
    });
    
    onClose();
    setFormData({
      name: "",
      description: "",
      semester_price: 0,
      annual_price: 0,
      max_students: 50,
      features: [""]
    });
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Plus className="h-5 w-5 mr-2 text-calmon-600" />
            Criar Novo Plano
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do novo plano de assinatura.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Plano *</Label>
            <Input
              id="name"
              placeholder="Ex: Business Pro"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o plano..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester_price">Preço Semestral (R$) *</Label>
              <Input
                id="semester_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="299.00"
                value={formData.semester_price}
                onChange={(e) => setFormData(prev => ({ ...prev, semester_price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual_price">Preço Anual (R$) *</Label>
              <Input
                id="annual_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="499.00"
                value={formData.annual_price}
                onChange={(e) => setFormData(prev => ({ ...prev, annual_price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_students">Máx. Colaboradores *</Label>
              <Input
                id="max_students"
                type="number"
                min="1"
                placeholder="50"
                value={formData.max_students}
                onChange={(e) => setFormData(prev => ({ ...prev, max_students: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recursos do Plano *</Label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Ex: Suporte 24/7"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    required={index === 0}
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Recurso
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white"
              disabled={createPlanMutation.isPending}
            >
              {createPlanMutation.isPending ? "Criando..." : "Criar Plano"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
