
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyData } from "@/hooks/useCompanies";
import { useState } from "react";

interface CompanyAddressFieldsProps {
  formData: CompanyData;
  setFormData: React.Dispatch<React.SetStateAction<CompanyData>>;
}

export function CompanyAddressFields({ formData, setFormData }: CompanyAddressFieldsProps) {
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const handleCepBlur = async () => {
    const cep = (formData.address_zip_code || '').replace(/\D/g, '');
    if (cep.length !== 8) return;
    setLoadingCep(true);
    setCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError('CEP não encontrado. Preencha manualmente.');
        return;
      }
      setFormData(prev => ({
        ...prev,
        address_street: data.logradouro || '',
        address_district: data.bairro || '',
        address_city: data.localidade || '',
        address_state: data.uf || '',
      }));
    } catch (e) {
      setCepError('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <fieldset className="!border-gray-600 !p-4 !rounded-md !bg-gray-800">
      <legend className="!text-lg !font-medium !text-white !px-1">Endereço</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {/* CEP primeiro */}
        <div className="space-y-2">
          <Label htmlFor="edit-address_zip_code" className="!text-gray-300">CEP</Label>
          <Input
            id="edit-address_zip_code"
            placeholder="00000-000"
            value={formData.address_zip_code || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_zip_code: e.target.value }))}
            onBlur={handleCepBlur}
            maxLength={9}
            required
            className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
          />
          {loadingCep && <span className="text-xs !text-gray-400">Buscando endereço...</span>}
          {cepError && <span className="text-xs !text-red-400">{cepError}</span>}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="edit-address_street" className="!text-gray-300">Logradouro</Label>
          <Input
            id="edit-address_street"
            placeholder="Rua, Av., etc."
            value={formData.address_street || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_street: e.target.value }))}
            required
            className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_number" className="!text-gray-300">Número</Label>
          <Input
            id="edit-address_number"
            placeholder="123"
            value={formData.address_number || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_number: e.target.value }))}
            required
            className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_complement" className="!text-gray-300">Complemento</Label>
          <Input
            id="edit-address_complement"
            placeholder="Apto, Bloco, Sala"
            value={formData.address_complement || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_complement: e.target.value }))}
            className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_district" className="!text-gray-300">Bairro</Label>
          <Input
            id="edit-address_district"
            placeholder="Centro, etc."
            value={formData.address_district || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_district: e.target.value }))}
            required
            className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_city" className="!text-gray-300">Cidade</Label>
          <Input
            id="edit-address_city"
            placeholder="Sua Cidade"
            value={formData.address_city || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_city: e.target.value }))}
            required
            className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_state" className="!text-gray-300">Estado (UF)</Label>
          <Input
            id="edit-address_state"
            placeholder="UF"
            value={formData.address_state || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_state: e.target.value.toUpperCase() }))}
            required
            maxLength={2}
            className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400 focus:!border-blue-500"
          />
        </div>
      </div>
    </fieldset>
  );
}
