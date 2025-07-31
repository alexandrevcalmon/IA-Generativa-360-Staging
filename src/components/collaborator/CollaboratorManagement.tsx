import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  UserPlus, 
  Upload, 
  Search, 
  Users, 
  Edit, 
  UserX, 
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Crown,
  Target,
  TrendingUp,
  Zap,
  Clock,
  BookOpen,
  Trophy,
  Award,
  Send
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollaboratorForm } from "./CollaboratorForm";
import { BulkUpload } from "./BulkUpload";
import { EditCollaboratorDialog } from "../EditCollaboratorDialog";
import { useAddCompanyCollaborator } from "@/hooks/collaborators/useAddCompanyCollaborator";
import { useGetCompanyCollaborators, useToggleCollaboratorStatus } from "@/hooks/useCompanyCollaborators";
import { useResendActivationEmail } from "@/hooks/collaborators/useResendActivationEmail";
import { useSeatLimit } from "@/hooks/collaborators/useSeatLimit";
import { useCompanyData } from "@/hooks/useCompanyData";
import { useCollaboratorAnalytics } from "@/hooks/useCollaboratorAnalytics";
import { useToast } from "@/hooks/use-toast";
import { CreateCollaboratorData, Collaborator } from "@/hooks/collaborators/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const CollaboratorManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  
  const { data: companyData } = useCompanyData();
  const { data: seatInfo } = useSeatLimit();
  const { data: collaborators = [], isLoading: collaboratorsLoading } = useGetCompanyCollaborators(companyData?.id);
  const { data: analyticsData = [], isLoading: analyticsLoading } = useCollaboratorAnalytics();
  
  const addCollaboratorMutation = useAddCompanyCollaborator();
  const toggleStatusMutation = useToggleCollaboratorStatus();
  const resendActivationEmailMutation = useResendActivationEmail();
  const { toast } = useToast();

  // Função para obter dados de analytics de um colaborador
  const getCollaboratorAnalytics = (collaboratorId: string) => {
    const analytics = analyticsData.find(analytics => analytics.collaborator.id === collaboratorId);
    if (analytics) {
    }
    return analytics;
  };

  // Função para formatar tempo de estudo
  const formatStudyTime = (minutes: number) => {
    if (minutes === 0) return "0min";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  // Função para formatar última atividade
  const formatLastActivity = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Hoje";
    if (diffInDays === 1) return "Ontem";
    if (diffInDays < 7) return `${diffInDays} dias`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas`;
    return `${Math.floor(diffInDays / 30)} meses`;
  };

  // Calcular indicador de engajamento
  const calculateEngagementRate = () => {
    if (collaborators.length === 0) return 0;
    
    // Contar colaboradores ativos nos últimos 7 dias
    const recentlyActive = analyticsData.filter(analytics => {
      if (!analytics.last_login_at) return false;
      const lastLogin = new Date(analytics.last_login_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return lastLogin > sevenDaysAgo;
    }).length;
    
    return Math.round((recentlyActive / collaborators.length) * 100);
  };

  const engagementRate = calculateEngagementRate();

  const filteredCollaborators = collaborators.filter(collaborator =>
    collaborator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaborator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collaborator.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCollaborators = collaborators.filter(c => c.is_active);
  const inactiveCollaborators = collaborators.filter(c => !c.is_active);

  const handleAddCollaborator = async (data: CreateCollaboratorData) => {
    try {
      await addCollaboratorMutation.mutateAsync(data);
      toast.success({
        title: "Colaborador cadastrado!",
        description: `${data.name} foi cadastrado e receberá um e-mail de ativação.`
      });
      setActiveTab("list");
    } catch (error: any) {
      toast.error({
        title: "Erro ao cadastrar colaborador",
        description: error.message || "Ocorreu um erro inesperado."
      });
    }
  };

  const handleBulkUpload = async (collaborators: CreateCollaboratorData[]) => {
    setIsBulkUploading(true);
    try {
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const collaborator of collaborators) {
        try {
          await addCollaboratorMutation.mutateAsync(collaborator);
          results.push({ name: collaborator.name, success: true });
          successCount++;
        } catch (error: any) {
          results.push({ name: collaborator.name, success: false, error: error.message });
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success({
          title: "Importação concluída!",
          description: `${successCount} colaboradores importados com sucesso. ${errorCount} falharam.`
        });
      }

      if (errorCount === 0) {
        setActiveTab("list");
      }
    } catch (error: any) {
      toast.error({
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro durante a importação."
      });
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handleToggleStatus = async (collaborator: Collaborator) => {
    try {
      await toggleStatusMutation.mutateAsync({
        collaboratorId: collaborator.id,
        companyId: collaborator.company_id,
        currentStatus: collaborator.is_active
      });
      
      const action = collaborator.is_active ? "bloqueado" : "desbloqueado";
      toast.success({
        title: `Colaborador ${action}!`,
        description: `${collaborator.name} foi ${action} com sucesso.`
      });
    } catch (error: any) {
      toast.error({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro inesperado."
      });
    }
  };

  const handleResendActivationEmail = async (collaborator: Collaborator) => {
    try {
      await resendActivationEmailMutation.mutateAsync({
        collaboratorId: collaborator.id,
        companyId: collaborator.company_id
      });
      toast.success({
        title: "E-mail de ativação reenviado!",
        description: `E-mail de ativação para ${collaborator.name} foi reenviado.`
      });
    } catch (error: any) {
      toast.error({
        title: "Erro ao reenviar e-mail de ativação",
        description: error.message || "Ocorreu um erro inesperado."
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (collaboratorsLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Carregando colaboradores...</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {collaborators.length}
                  </p>
                  <p className="text-sm text-slate-300">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {activeCollaborators.length}
                  </p>
                  <p className="text-sm text-slate-300">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <UserX className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {inactiveCollaborators.length}
                  </p>
                  <p className="text-sm text-slate-300">Bloqueados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {engagementRate}%
                  </p>
                  <p className="text-sm text-slate-300">Engajamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">
                    {seatInfo?.availableSeats || 0}
                  </p>
                  <p className="text-sm text-slate-300">Vagas Disponíveis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Limite do plano */}
      {seatInfo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Alert className={`backdrop-blur-sm border-2 ${
            seatInfo.isAtLimit 
              ? "border-orange-500/30 bg-orange-500/10 text-orange-200" 
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          }`}>
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <AlertDescription className="text-sm">
              <strong>Plano atual:</strong> {seatInfo.activeCollaborators}/{seatInfo.maxCollaborators} colaboradores utilizados.
              {seatInfo.isAtLimit && (
                <span className="text-orange-300 ml-2 font-medium">
                  Limite atingido! Atualize seu plano para adicionar mais colaboradores.
                </span>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Tabs principais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-1 rounded-xl">
            <TabsTrigger 
              value="list" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-700/50 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-slate-600/50 rounded-lg transition-all duration-300 text-slate-300 hover:text-white"
            >
              <Users className="h-4 w-4" />
              Lista de Colaboradores
            </TabsTrigger>
            <TabsTrigger 
              value="individual" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-700/50 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-slate-600/50 rounded-lg transition-all duration-300 text-slate-300 hover:text-white"
              disabled={seatInfo?.isAtLimit}
            >
              <UserPlus className="h-4 w-4" />
              Cadastrar Individual
            </TabsTrigger>
            <TabsTrigger 
              value="bulk" 
              className="flex items-center gap-2 data-[state=active]:bg-slate-700/50 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-slate-600/50 rounded-lg transition-all duration-300 text-slate-300 hover:text-white"
              disabled={seatInfo?.isAtLimit}
            >
              <Upload className="h-4 w-4" />
              Importação em Massa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Busca */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome, e-mail ou cargo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 focus:border-amber-500/50 focus:ring-amber-500/20"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Lista de colaboradores */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredCollaborators.length > 0 ? (
                  filteredCollaborators.map((collaborator, index) => (
                    <motion.div
                      key={collaborator.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="relative">
                                <Avatar className="h-12 w-12 ring-2 ring-slate-600 group-hover:ring-amber-500/50 transition-all duration-300">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
                                    {getInitials(collaborator.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-800 ${
                                  collaborator.is_active ? 'bg-emerald-500' : 'bg-orange-500'
                                }`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-3">
                                  <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors duration-300">
                                    {collaborator.name}
                                  </h3>
                                  <Badge 
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      collaborator.is_active 
                                        ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30" 
                                        : "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/30"
                                    }`}
                                  >
                                    {collaborator.is_active ? 'Ativo' : 'Bloqueado'}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center space-x-6 text-sm text-slate-400">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                                      <Mail className="h-3 w-3 text-blue-400" />
                                    </div>
                                    <span className="text-slate-300">{collaborator.email}</span>
                                  </div>
                                  
                                  {collaborator.position && (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                                        <Briefcase className="h-3 w-3 text-purple-400" />
                                      </div>
                                      <span className="text-slate-300">{collaborator.position}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Dados de Analytics alinhados à direita */}
                              {(() => {
                                const analytics = getCollaboratorAnalytics(collaborator.id);
                                if (!analytics) return null;
                                
                                return (
                                  <div className="flex items-center space-x-4 text-sm text-slate-400 ml-6">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center space-x-1">
                                          <Clock className="h-3 w-3 text-blue-400" />
                                          <span className="text-slate-300">{formatLastActivity(analytics.last_activity)}</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 text-slate-200">
                                        <p>Última Atividade</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center space-x-1">
                                          <BookOpen className="h-3 w-3 text-green-400" />
                                          <span className="text-slate-300">{analytics.lessons_completed || 0}</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 text-slate-200">
                                        <p>Aulas Concluídas</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center space-x-1">
                                          <Trophy className="h-3 w-3 text-yellow-400" />
                                          <span className="text-slate-300">{formatStudyTime(analytics.total_watch_time_minutes || 0)}</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 text-slate-200">
                                        <p>Tempo de Estudo</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center space-x-1">
                                          <Target className="h-3 w-3 text-purple-400" />
                                          <span className="text-slate-300">{analytics.quizzes_completed || 0}</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 text-slate-200">
                                        <p>Questionários Concluídos</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center space-x-1">
                                          <Award className="h-3 w-3 text-indigo-400" />
                                          <span className="text-slate-300">Nível {analytics.current_level || 1}</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 text-slate-200">
                                        <p>Nível Atual</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    
                                                    <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-1">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span className="text-slate-300">
                        {analytics?.total_points || 0} pts
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 text-slate-200">
                    <p>Pontos Totais</p>
                  </TooltipContent>
                </Tooltip>
                                    
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center space-x-1">
                                          <Calendar className="h-3 w-3 text-emerald-400" />
                                          <span className="text-slate-300">{analytics.days_active || 0} dias</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 text-slate-200">
                                        <p>Dias Ativos</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                );
                              })()}
                            </div>
                            
                            <div className="ml-4 flex-shrink-0">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                  align="end"
                                  className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50"
                                >
                                  <DropdownMenuItem 
                                    onClick={() => setEditingCollaborator(collaborator)}
                                    className="text-slate-200 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  {collaborator.needs_complete_registration && (
                                    <DropdownMenuItem 
                                      onClick={() => handleResendActivationEmail(collaborator)}
                                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 transition-all duration-200"
                                    >
                                      <Send className="h-4 w-4 mr-2" />
                                      Reenviar E-mail
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => handleToggleStatus(collaborator)}
                                    className={`transition-all duration-200 ${
                                      collaborator.is_active 
                                        ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/20" 
                                        : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
                                    }`}
                                  >
                                    {collaborator.is_active ? (
                                      <>
                                        <UserX className="h-4 w-4 mr-2" />
                                        Bloquear
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Desbloquear
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
                      <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-slate-200">
                          {searchTerm ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador cadastrado'}
                        </h3>
                        <p className="text-slate-400 mb-6">
                          {searchTerm 
                            ? 'Tente buscar com outros termos ou limpe o filtro'
                            : 'Comece cadastrando seu primeiro colaborador'
                          }
                        </p>
                        {!searchTerm && !seatInfo?.isAtLimit && (
                          <Button 
                            onClick={() => setActiveTab("individual")}
                            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Cadastrar Colaborador
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="individual">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <CollaboratorForm
                onSubmit={handleAddCollaborator}
                isLoading={addCollaboratorMutation.isPending}
                companyId={companyData?.id || ""}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="bulk">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <BulkUpload
                onSubmit={handleBulkUpload}
                isLoading={isBulkUploading}
                companyId={companyData?.id || ""}
                maxCollaborators={seatInfo?.availableSeats || 0}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
      
      {/* Edit Collaborator Dialog */}
      <EditCollaboratorDialog
        isOpen={!!editingCollaborator}
        onClose={() => setEditingCollaborator(null)}
        collaborator={editingCollaborator}
        companyId={companyData?.id || ""}
      />
    </motion.div>
  );
};
