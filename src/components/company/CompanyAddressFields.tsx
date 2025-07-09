
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyData } from "@/hooks/useCompanies";

interface CompanyAddressFieldsProps {
  formData: CompanyData;
  setFormData: React.Dispatch<React.SetStateAction<CompanyData>>;
}

export function CompanyAddressFields({ formData, setFormData }: CompanyAddressFieldsProps) {
  return (
    <fieldset className="border p-4 rounded-md">
      <legend className="text-lg font-medium text-gray-700 px-1">Endereço</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="edit-address_street">Logradouro</Label>
          <Input
            id="edit-address_street"
            placeholder="Rua, Av., etc."
            value={formData.address_street || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_street: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_number">Número</Label>
          <Input
            id="edit-address_number"
            placeholder="123"
            value={formData.address_number || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_number: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_complement">Complemento</Label>
          <Input
            id="edit-address_complement"
            placeholder="Apto, Bloco, Sala"
            value={formData.address_complement || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_complement: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_district">Bairro</Label>
          <Input
            id="edit-address_district"
            placeholder="Centro, etc."
            value={formData.address_district || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_district: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_city">Cidade</Label>
          <Input
            id="edit-address_city"
            placeholder="Sua Cidade"
            value={formData.address_city || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_city: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-3">
          <div className="space-y-2">
            <Label htmlFor="edit-address_state">Estado (UF)</Label>
            <Input
              id="edit-address_state"
              placeholder="SP"
              value={formData.address_state || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, address_state: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address_zip_code">CEP</Label>
            <Input
              id="edit-address_zip_code"
              placeholder="00000-000"
              value={formData.address_zip_code || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, address_zip_code: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
}
