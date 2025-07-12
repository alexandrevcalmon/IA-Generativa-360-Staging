import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Briefcase, Loader2 } from "lucide-react";
import { CreateCollaboratorData } from "@/hooks/collaborators/types";

interface CollaboratorFormProps {
  onSubmit: (data: CreateCollaboratorData) => Promise<void>;
  isLoading: boolean;
  companyId: string;
}

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  position: ""
};

export const CollaboratorForm: React.FC<CollaboratorFormProps> = ({
  onSubmit,
  isLoading,
  companyId
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }
    if (!formData.position.trim()) newErrors.position = "Cargo é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData: CreateCollaboratorData = {
      company_id: companyId,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || null,
      position: formData.position.trim(),
      needs_complete_registration: true
    };

    try {
      await onSubmit(submitData);
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Cadastrar Novo Colaborador
        </CardTitle>
        <CardDescription>
          Preencha os dados básicos. O colaborador receberá um e-mail para definir senha e completar o cadastro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                id="name"
                placeholder="Digite o nome completo"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite o e-mail"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                Cargo *
              </Label>
              <Input
                id="position"
                placeholder="Digite o cargo"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className={errors.position ? "border-red-500" : ""}
              />
              {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(initialFormData);
                setErrors({});
              }}
              disabled={isLoading}
            >
              Limpar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-calmon-500 to-calmon-700 hover:from-calmon-600 hover:to-calmon-800 text-white min-w-[140px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isLoading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 