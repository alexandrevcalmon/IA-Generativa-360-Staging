
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyData } from "@/hooks/useCompanies";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface CompanyContactFieldsProps {
  formData: CompanyData;
  setFormData: React.Dispatch<React.SetStateAction<CompanyData>>;
}

export function CompanyContactFields({ formData, setFormData }: CompanyContactFieldsProps) {
  return (
    <fieldset className="border p-4 rounded-md">
      <legend className="text-lg font-medium text-gray-700 px-1">Contato Principal</legend>
      
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          O email do contato será usado para criar o usuário de acesso da empresa à plataforma. 
          Certifique-se de que seja um email válido e acessível.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-2">
          <Label htmlFor="edit-contact_name">Nome do Contato</Label>
          <Input
            id="edit-contact_name"
            placeholder="Nome Completo"
            value={formData.contact_name || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-contact_email" className="text-blue-700 font-medium">
            Email do Contato *
          </Label>
          <Input
            id="edit-contact_email"
            type="email"
            placeholder="contato@exemplo.com"
            value={formData.contact_email || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
            className="border-blue-300 focus:border-blue-500"
            required
          />
          <p className="text-xs text-blue-600">
            Este email será usado para criar o acesso à plataforma
          </p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="edit-contact_phone">Telefone do Contato</Label>
          <Input
            id="edit-contact_phone"
            placeholder="(00) 00000-0000"
            value={formData.contact_phone || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
          />
        </div>
      </div>
    </fieldset>
  );
}
