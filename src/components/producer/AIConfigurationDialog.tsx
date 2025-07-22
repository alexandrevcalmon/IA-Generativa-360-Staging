
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAIProviders } from '@/hooks/useAIProviders';
import { AIConfiguration } from '@/hooks/useAIConfigurations';
import { useAuth } from '@/hooks/useAuth';

interface AIConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: AIConfiguration | null;
  onSave: (config: Partial<AIConfiguration>) => void;
}

export const AIConfigurationDialog = ({
  open,
  onOpenChange,
  config,
  onSave,
}: AIConfigurationDialogProps) => {
  const { data: providers = [] } = useAIProviders();
  const { userRole } = useAuth();
  const [formData, setFormData] = useState({
    provider_id: '',
    model_name: '',
    api_key_encrypted: '',
    system_prompt: 'Você é um assistente especializado em responder perguntas sobre o conteúdo das lições. Use apenas as informações fornecidas no contexto para responder.',
    temperature: 0.7,
    max_tokens: 1000,
    is_active: true,
  });

  const selectedProvider = providers.find(p => p.id === formData.provider_id);

  useEffect(() => {
    if (config) {
      setFormData({
        provider_id: config.provider_id,
        model_name: config.model_name,
        api_key_encrypted: config.api_key_encrypted || '',
        system_prompt: config.system_prompt,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        is_active: config.is_active,
      });
    } else {
      setFormData({
        provider_id: '',
        model_name: '',
        api_key_encrypted: '',
        system_prompt: 'Você é um assistente especializado em responder perguntas sobre o conteúdo das lições. Use apenas as informações fornecidas no contexto para responder.',
        temperature: 0.7,
        max_tokens: 1000,
        is_active: true,
      });
    }
  }, [config]);

  const handleSave = () => {
    const configData = {
      ...formData,
      // For producers, company_id will be set to null in the mutation hook
      // For companies, this would be handled by the company-specific hook
      ...(config ? { id: config.id } : {}),
    };
    onSave(configData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto !bg-gray-800 !border-gray-700">
        <DialogHeader>
          <DialogTitle className="!text-white">
            {config ? 'Editar Configuração de IA' : 'Nova Configuração de IA'}
            {userRole === 'producer' && (
              <span className="text-sm !text-gray-400 ml-2">(Configuração Global)</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="provider" className="!text-gray-300">Provedor de IA</Label>
            <Select
              value={formData.provider_id}
              onValueChange={(value) => {
                const provider = providers.find(p => p.id === value);
                setFormData(prev => ({
                  ...prev,
                  provider_id: value,
                  model_name: provider?.default_model || '',
                }));
              }}
            >
              <SelectTrigger className="!bg-gray-700 !border-gray-600 !text-white">
                <SelectValue placeholder="Selecione um provedor" />
              </SelectTrigger>
              <SelectContent className="!bg-gray-700 !border-gray-600">
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id} className="!text-gray-300 hover:!bg-gray-600">
                    {provider.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProvider && (
            <div className="space-y-2">
              <Label htmlFor="model" className="!text-gray-300">Modelo</Label>
              <Select
                value={formData.model_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, model_name: value }))}
              >
                <SelectTrigger className="!bg-gray-700 !border-gray-600 !text-white">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent className="!bg-gray-700 !border-gray-600">
                  {selectedProvider.supported_models.map((model) => (
                    <SelectItem key={model} value={model} className="!text-gray-300 hover:!bg-gray-600">
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedProvider?.requires_api_key && (
            <div className="space-y-2">
              <Label htmlFor="api_key" className="!text-gray-300">Chave da API</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key_encrypted}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key_encrypted: e.target.value }))}
                placeholder="Digite sua chave da API"
                className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="system_prompt" className="!text-gray-300">Prompt do Sistema</Label>
            <Textarea
              id="system_prompt"
              value={formData.system_prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
              placeholder="Instruções para o assistente de IA"
              rows={4}
              className="!bg-gray-700 !border-gray-600 !text-white placeholder:!text-gray-400"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="!text-gray-300">Temperatura: {formData.temperature}</Label>
              <Slider
                value={[formData.temperature]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, temperature: value }))}
                max={2}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs !text-gray-400">
                <span>Determinístico (0)</span>
                <span>Criativo (2)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_tokens" className="!text-gray-300">Máximo de Tokens</Label>
              <Input
                id="max_tokens"
                type="number"
                value={formData.max_tokens}
                onChange={(e) => setFormData(prev => ({ ...prev, max_tokens: Number(e.target.value) }))}
                min={1}
                max={8000}
                className="!bg-gray-700 !border-gray-600 !text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="!bg-gray-700 !border-gray-600 !text-gray-300 hover:!bg-gray-600 hover:!text-white transition-colors duration-200"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="!bg-gradient-to-r !from-blue-600 !to-blue-700 hover:!from-blue-700 hover:!to-blue-800 !text-white !border-0 shadow-lg hover:!shadow-xl transition-all duration-200"
            >
              {config ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
