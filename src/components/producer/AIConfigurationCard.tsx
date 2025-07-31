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
    <Card className="h-full !bg-gray-800 !border-gray-700 shadow-lg hover:!shadow-xl transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 !text-white">
            {config.ai_providers?.display_name || 'Provider'}
            {isGlobalConfig && (
              <Globe className="h-4 w-4 !text-blue-400" />
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={config.is_active ? "default" : "secondary"}
              className={config.is_active 
                ? "!bg-green-500/20 !text-green-300 !border-green-500/30" 
                : "!bg-gray-500/20 !text-gray-300 !border-gray-500/30"
              }
            >
              {config.is_active ? "Ativo" : "Inativo"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(config.id, !config.is_active)}
              className="!text-gray-300 hover:!bg-gray-700 hover:!text-white"
            >
              {config.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {isGlobalConfig && (
          <p className="text-xs !text-blue-300">Configuração disponível para todas as empresas</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="!text-gray-400">Modelo:</span>
            <span className="font-medium !text-white">{config.model_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="!text-gray-400">Temperatura:</span>
            <span className="font-medium !text-white">{config.temperature}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="!text-gray-400">Max Tokens:</span>
            <span className="font-medium !text-white">{config.max_tokens}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="!text-gray-400">API Key:</span>
            <span className="font-medium !text-white">
              {config.api_key_encrypted ? "Configurada" : "Não configurada"}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <span className="text-sm !text-gray-400">Prompt do Sistema:</span>
          <p className="text-xs !text-gray-300 !bg-gray-700 p-3 rounded-lg max-h-20 overflow-y-auto !border !border-gray-600">
            {config.system_prompt}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(config)}
            className="flex-1 !border-gray-600 !text-gray-300 hover:!bg-gray-700 hover:!text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(config.id)}
            className="!border-red-500/30 !text-red-400 hover:!bg-red-500/10 hover:!text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
