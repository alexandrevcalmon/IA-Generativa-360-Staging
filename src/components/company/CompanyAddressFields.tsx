
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
  const [ufReadOnly, setUfReadOnly] = useState(false);

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
        setUfReadOnly(false);
        return;
      }
      setFormData(prev => ({
        ...prev,
        address_street: data.logradouro || '',
        address_district: data.bairro || '',
        address_city: data.localidade || '',
        address_state: data.uf || '',
      }));
      setUfReadOnly(true);
    } catch (e) {
      setCepError('Erro ao buscar CEP. Tente novamente.');
      setUfReadOnly(false);
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <fieldset className="border p-4 rounded-md">
      <legend className="text-lg font-medium text-gray-700 px-1">Endereço</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {/* CEP primeiro */}
        <div className="space-y-2">
          <Label htmlFor="edit-address_zip_code">CEP</Label>
          <Input
            id="edit-address_zip_code"
            placeholder="00000-000"
            value={formData.address_zip_code || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_zip_code: e.target.value }))}
            onBlur={handleCepBlur}
            maxLength={9}
            required
          />
          {loadingCep && <span className="text-xs text-gray-500">Buscando endereço...</span>}
          {cepError && <span className="text-xs text-red-500">{cepError}</span>}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="edit-address_street">Logradouro</Label>
          <Input
            id="edit-address_street"
            placeholder="Rua, Av., etc."
            value={formData.address_street || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_street: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_number">Número</Label>
          <Input
            id="edit-address_number"
            placeholder="123"
            value={formData.address_number || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_number: e.target.value }))}
            required
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
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_city">Cidade</Label>
          <Input
            id="edit-address_city"
            placeholder="Sua Cidade"
            value={formData.address_city || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address_city: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address_state">Estado (UF)</Label>
          <div className="flex items-center gap-2">
            <select
              id="edit-address_state"
              value={formData.address_state || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, address_state: e.target.value }))}
              required
              className="flex-grow border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
              disabled={ufReadOnly}
            >
              <option value="">Selecione o estado</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
            {ufReadOnly && (
              <button
                type="button"
                className="text-xs text-blue-600 underline whitespace-nowrap ml-2"
                onClick={() => setUfReadOnly(false)}
                style={{ flexShrink: 0 }}
              >
                Editar manualmente
              </button>
            )}
          </div>
        </div>
      </div>
    </fieldset>
  );
}
