import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Trash2, Eye, EyeOff, Globe } from 'lucide-react';
import { AIConfiguration } from '@/hooks/useAIConfigurations';

interface AIConfigurationCardProps {
  config: AIConfiguration;
  onEdit: (config: AIConfiguration) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export const AIConfigurationCard = ({ 
  config, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: AIConfigurationCardProps) => {
  const isGlobalConfig = !config.company_id;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {config.ai_providers?.display_name || 'Provider'}
            {isGlobalConfig && (
              <Globe className="h-4 w-4 text-blue-600" />
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={config.is_active ? "default" : "secondary"}>
              {config.is_active ? "Ativo" : "Inativo"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(config.id, !config.is_active)}
            >
              {config.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {isGlobalConfig && (
          <p className="text-xs text-blue-600">Configuração disponível para todas as empresas</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Modelo:</span>
            <span className="font-medium">{config.model_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Temperatura:</span>
            <span className="font-medium">{config.temperature}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Max Tokens:</span>
            <span className="font-medium">{config.max_tokens}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">API Key:</span>
            <span className="font-medium">
              {config.api_key_encrypted ? "Configurada" : "Não configurada"}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <span className="text-sm text-gray-600">Prompt do Sistema:</span>
          <p className="text-xs text-gray-800 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
            {config.system_prompt}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(config)}
            className="flex-1"
          >
            <Settings className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(config.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
