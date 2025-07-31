import React, { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { PageSection } from '@/components/PageSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bot, Settings } from 'lucide-react';
import { useAIConfigurations, useCreateAIConfiguration, useUpdateAIConfiguration, useDeleteAIConfiguration, AIConfiguration } from '@/hooks/useAIConfigurations';
import { AIConfigurationCard } from '@/components/producer/AIConfigurationCard';
import { AIConfigurationDialog } from '@/components/producer/AIConfigurationDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const ProducerAIConfigurations = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfiguration | null>(null);
  const [deletingConfigId, setDeletingConfigId] = useState<string | null>(null);

  const { data: configurations = [], isLoading } = useAIConfigurations();
  const createMutation = useCreateAIConfiguration();
  const updateMutation = useUpdateAIConfiguration();
  const deleteMutation = useDeleteAIConfiguration();

  const handleSave = (configData: Partial<AIConfiguration>) => {
    if (editingConfig) {
      updateMutation.mutate(configData as AIConfiguration & { id: string });
    } else {
      createMutation.mutate(configData as Omit<AIConfiguration, 'id' | 'created_at' | 'updated_at'>);
    }
    setEditingConfig(null);
  };

  const handleEdit = (config: AIConfiguration) => {
    setEditingConfig(config);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingConfigId(id);
  };

  const confirmDelete = () => {
    if (deletingConfigId) {
      deleteMutation.mutate(deletingConfigId);
      setDeletingConfigId(null);
    }
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    updateMutation.mutate({ id, is_active: isActive });
  };

  const handleCreateNew = () => {
    setEditingConfig(null);
    setIsDialogOpen(true);
  };

  // Header content com botão de criar nova configuração
  const headerContent = (
    <Button 
      onClick={handleCreateNew}
      className="!bg-gray-800 !text-white hover:!bg-gray-700 !border-gray-600"
    >
      <Plus className="h-4 w-4 mr-2" />
      Nova Configuração
    </Button>
  );

  return (
    <PageLayout
      title="Configurações de IA"
      subtitle="Gerencie os provedores de IA e suas configurações para chatbots de lições"
      headerContent={headerContent}
      background="dark"
      className="dark-theme-override"
    >
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 !border-blue-400 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold !text-white mb-2">Carregando Configurações</h3>
              <p className="!text-gray-300">Buscando configurações de IA...</p>
            </div>
          </div>
        ) : configurations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configurations.map((config) => (
              <AIConfigurationCard
                key={config.id}
                config={config}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <Card className="!bg-gray-800 !border-gray-700 max-w-md w-full">
              <CardHeader className="text-center py-12">
                <Bot className="h-16 w-16 !text-gray-400 mx-auto mb-4" />
                <CardTitle className="!text-white">Nenhuma configuração de IA encontrada</CardTitle>
                <CardDescription className="!text-gray-300">
                  Crie sua primeira configuração de IA para habilitar chatbots inteligentes nas lições
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-12">
                <Button 
                  onClick={handleCreateNew}
                  className="!bg-blue-600 hover:!bg-blue-700 !text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira configuração
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Configuration Dialog */}
        <AIConfigurationDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          config={editingConfig}
          onSave={handleSave}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingConfigId} onOpenChange={() => setDeletingConfigId(null)}>
          <AlertDialogContent className="!bg-gray-800 !border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="!text-white">Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription className="!text-gray-300">
                Tem certeza que deseja excluir esta configuração de IA? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="!bg-gray-700 !text-gray-300 hover:!bg-gray-600 !border-gray-600">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="!bg-red-600 hover:!bg-red-700 !text-white"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
};

export default ProducerAIConfigurations;
