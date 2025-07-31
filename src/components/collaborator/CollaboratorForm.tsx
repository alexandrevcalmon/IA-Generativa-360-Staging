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
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <User className="h-5 w-5 text-blue-400" />
          Cadastrar Novo Colaborador
        </CardTitle>
        <CardDescription className="text-slate-300">
          Preencha os dados básicos. O colaborador receberá um e-mail para definir senha e completar o cadastro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1 text-slate-200">
                <User className="h-4 w-4 text-blue-400" />
                Nome Completo *
              </Label>
              <Input
                id="name"
                placeholder="Digite o nome completo"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20 ${
                  errors.name ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20" : ""
                }`}
              />
              {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1 text-slate-200">
                <Mail className="h-4 w-4 text-blue-400" />
                E-mail *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite o e-mail"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20 ${
                  errors.email ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20" : ""
                }`}
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1 text-slate-200">
                <Phone className="h-4 w-4 text-green-400" />
                Telefone
              </Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 focus:border-green-500/50 focus:ring-green-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="flex items-center gap-1 text-slate-200">
                <Briefcase className="h-4 w-4 text-purple-400" />
                Cargo *
              </Label>
              <Input
                id="position"
                placeholder="Digite o cargo"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className={`bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 focus:border-purple-500/50 focus:ring-purple-500/20 ${
                  errors.position ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20" : ""
                }`}
              />
              {errors.position && <p className="text-sm text-red-400">{errors.position}</p>}
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
              className="bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-500/50 transition-all duration-300"
            >
              Limpar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white min-w-[140px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
