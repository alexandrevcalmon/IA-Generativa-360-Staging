import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCompanyData } from '@/hooks/useCompanyData';
import { useCompanies } from '@/hooks/useCompanies';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Headphones, 
  Send,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  Wrench,
  CreditCard,
  FileText
} from 'lucide-react';

export default function CreateSupportTicket() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { data: company } = useCompanyData();
  const { data: companies, isLoading: isLoadingCompanies } = useCompanies();
  const { createTicket, isCreatingTicket } = useSupportTickets();
  
  console.log('🏢 CreateSupportTicket - userRole:', userRole, 'companies:', companies?.length || 0);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const,
    company_id: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar company_id quando os dados da empresa estiverem disponíveis
  useEffect(() => {
    console.log('🔍 useEffect triggered:', { userRole, companyId: company?.id, company });
    if (userRole === 'company' && company?.id) {
      console.log('✅ Setting company_id:', company.id);
      setFormData(prev => ({ ...prev, company_id: company.id }));
    }
  }, [company?.id, userRole, company]);

  const categories = [
    { value: 'bug', label: 'Bug', icon: '🐛', description: 'Problema ou erro na plataforma' },
    { value: 'feature_request', label: 'Solicitação', icon: '💡', description: 'Nova funcionalidade ou melhoria' },
    { value: 'question', label: 'Dúvida', icon: '❓', description: 'Pergunta sobre como usar a plataforma' },
    { value: 'technical_issue', label: 'Problema Técnico', icon: '🔧', description: 'Problema técnico ou configuração' },
    { value: 'billing', label: 'Faturamento', icon: '💰', description: 'Questões relacionadas a pagamentos' },
    { value: 'general', label: 'Geral', icon: '📋', description: 'Outros assuntos' }
  ];

  const priorities = [
    { value: 'low', label: 'Baixa', color: 'text-green-400' },
    { value: 'medium', label: 'Média', color: 'text-yellow-400' },
    { value: 'high', label: 'Alta', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgente', color: 'text-red-400' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Título deve ter pelo menos 5 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    if (userRole === 'producer' && !formData.company_id) {
      newErrors.company_id = 'Empresa é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Submitting form with data:', formData);
    
    if (!validateForm()) return;

    try {
      await createTicket(formData);
      navigate(userRole === 'producer' ? '/producer/support' : '/company/support');
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'feature_request':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'question':
        return <HelpCircle className="h-5 w-5 text-blue-500" />;
      case 'technical_issue':
        return <Wrench className="h-5 w-5 text-purple-500" />;
      case 'billing':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'general':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <PageLayout
      title="Novo Chamado de Suporte"
      subtitle="Descreva seu problema ou solicitação para que possamos ajudá-lo"
      background="dark"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
                      <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(userRole === 'producer' ? '/producer/support' : '/company/support')}
              className="text-gray-400 hover:text-white"
            >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Detalhes do Chamado</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título */}
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-white">
                      Título *
                    </label>
                    <Input
                      id="title"
                      placeholder="Descreva brevemente o problema ou solicitação"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 ${
                        errors.title ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-400">{errors.title}</p>
                    )}
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium text-white">
                      Descrição *
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Descreva detalhadamente o problema, incluindo passos para reproduzir, se aplicável..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={`min-h-[120px] bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 ${
                        errors.description ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-400">{errors.description}</p>
                    )}
                  </div>

                  {/* Categoria */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Categoria *
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <div>
                                <div className="font-medium text-white">{cat.label}</div>
                                <div className="text-xs text-gray-300">{cat.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prioridade */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Prioridade *
                    </label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                            <span className={priority.color}>{priority.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Empresa (apenas para produtores) */}
                  {userRole === 'producer' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Empresa *
                      </label>
                      <Select
                        value={formData.company_id}
                        onValueChange={(value) => handleInputChange('company_id', value)}
                      >
                        <SelectTrigger className={`bg-gray-700/50 border-gray-600/50 text-white ${
                          errors.company_id ? 'border-red-500' : ''
                        }`}>
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {companies?.map((comp) => (
                            <SelectItem key={comp.id} value={comp.id} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                              {comp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.company_id && (
                        <p className="text-sm text-red-400">{errors.company_id}</p>
                      )}
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex gap-4 pt-4">
                                  <Button
                type="button"
                variant="outline"
                onClick={() => navigate(userRole === 'producer' ? '/producer/support' : '/company/support')}
                className="flex-1"
              >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreatingTicket}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isCreatingTicket ? 'Criando...' : 'Criar Chamado'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com informações */}
          <div className="space-y-6">
            {/* Categoria selecionada */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Categoria Selecionada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                  {getCategoryIcon(formData.category)}
                  <div>
                    <p className="font-medium text-white">
                      {categories.find(c => c.value === formData.category)?.label}
                    </p>
                    <p className="text-sm text-gray-400">
                      {categories.find(c => c.value === formData.category)?.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dicas */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Dicas para um Chamado Eficaz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-300 space-y-2">
                  <p>• <strong>Título claro:</strong> Descreva o problema em poucas palavras</p>
                  <p>• <strong>Descrição detalhada:</strong> Inclua passos para reproduzir o problema</p>
                  <p>• <strong>Categoria correta:</strong> Ajude-nos a direcionar para o time certo</p>
                  <p>• <strong>Prioridade adequada:</strong> Use "Urgente" apenas para problemas críticos</p>
                  <p>• <strong>Screenshots:</strong> Se possível, anexe imagens do problema</p>
                </div>
              </CardContent>
            </Card>

            {/* Tempo de resposta */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Tempo de Resposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Urgente:</span>
                    <span className="text-red-400">2-4 horas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Alta:</span>
                    <span className="text-orange-400">4-8 horas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Média:</span>
                    <span className="text-yellow-400">24 horas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Baixa:</span>
                    <span className="text-green-400">48 horas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 
