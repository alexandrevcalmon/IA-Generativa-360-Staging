
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyData } from "@/hooks/useCompanies";

interface CompanyBasicFieldsProps {
  formData: CompanyData;
  setFormData: React.Dispatch<React.SetStateAction<CompanyData>>;
}

export function CompanyBasicFields({ formData, setFormData }: CompanyBasicFieldsProps) {
  return (
    <fieldset className="border p-4 rounded-md">
      <legend className="text-lg font-medium text-gray-700 px-1">Dados da Empresa</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Nome Fantasia *</Label>
          <Input
            id="edit-name"
            placeholder="Nome Fantasia da Empresa"
            value={formData.name || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-official_name">Razão Social</Label>
          <Input
            id="edit-official_name"
            placeholder="Razão Social da Empresa"
            value={formData.official_name || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, official_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-cnpj">CNPJ</Label>
          <Input
            id="edit-cnpj"
            placeholder="00.000.000/0000-00"
            value={formData.cnpj || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-company_email">Email da Empresa</Label>
          <Input
            id="edit-company_email"
            type="email"
            placeholder="contato@empresa.com"
            value={formData.email || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="edit-company_phone">Telefone da Empresa</Label>
          <Input
            id="edit-company_phone"
            placeholder="(00) 00000-0000"
            value={formData.phone || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>
    </fieldset>
  );
}
