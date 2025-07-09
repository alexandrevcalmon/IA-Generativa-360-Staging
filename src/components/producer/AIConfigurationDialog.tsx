
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {config ? 'Editar Configuração de IA' : 'Nova Configuração de IA'}
            {userRole === 'producer' && (
              <span className="text-sm text-gray-500 ml-2">(Configuração Global)</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="provider">Provedor de IA</Label>
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
              <SelectTrigger>
                <SelectValue placeholder="Selecione um provedor" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProvider && (
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Select
                value={formData.model_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, model_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider.supported_models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedProvider?.requires_api_key && (
            <div className="space-y-2">
              <Label htmlFor="api_key">Chave da API</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key_encrypted}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key_encrypted: e.target.value }))}
                placeholder="Digite sua chave da API"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="system_prompt">Prompt do Sistema</Label>
            <Textarea
              id="system_prompt"
              value={formData.system_prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
              placeholder="Instruções para o assistente de IA"
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Temperatura: {formData.temperature}</Label>
              <Slider
                value={[formData.temperature]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, temperature: value }))}
                max={2}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Determinístico (0)</span>
                <span>Criativo (2)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_tokens">Máximo de Tokens</Label>
              <Input
                id="max_tokens"
                type="number"
                value={formData.max_tokens}
                onChange={(e) => setFormData(prev => ({ ...prev, max_tokens: Number(e.target.value) }))}
                min={1}
                max={8000}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {config ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
