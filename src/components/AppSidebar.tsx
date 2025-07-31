
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/useAuth';
import { 
  BarChart3, 
  Building2, 
  Users, 
  BookOpen, 
  MessageSquare, 
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Bot,
  Trophy,
  Sparkles,
  Crown,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Zap
} from 'lucide-react';
import { UserMenu } from './UserMenu';

export function AppSidebar() {
  const { signOut, userRole } = useAuth();
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);

  // Producer menu items with enhanced icons and descriptions
  const producerMenuItems = [
    {
      title: 'Dashboard',
      url: '/producer/dashboard',
      icon: BarChart3,
      description: 'Visão geral do negócio',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Empresas',
      url: '/producer/companies', 
      icon: Building2,
      description: 'Gerenciar empresas',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Cursos',
      url: '/producer/courses',
      icon: BookOpen,
      description: 'Criar e editar cursos',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Mentorias',
      url: '/producer/mentorship',
      icon: MessageSquare,
      description: 'Sessões de mentoria',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Comunidade',
      url: '/producer/community',
      icon: Sparkles,
      description: 'Fórum da comunidade',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Colaboradores',
      url: '/producer/collaborators-analytics',
      icon: Users,
      description: 'Análise de colaboradores',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Planos',
      url: '/producer/plans',
      icon: CreditCard,
      description: 'Gerenciar planos',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Configurações de IA',
      url: '/producer/ai-configurations',
      icon: Bot,
      description: 'Configurar IA',
      gradient: 'from-violet-500 to-purple-500'
    },
  ];

  // Company menu items
  const companyMenuItems = [
    {
      title: 'Dashboard',
      url: '/company/dashboard',
      icon: BarChart3,
      description: 'Visão geral da empresa',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Cursos',
      url: '/company/courses',
      icon: BookOpen,
      description: 'Cursos da empresa',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Mentorias',
      url: '/company/mentorships',
      icon: MessageSquare,
      description: 'Mentorias disponíveis',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Colaboradores',
      url: '/company/collaborators',
      icon: Users,
      description: 'Gerenciar colaboradores',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Análise de Colaboradores',
      url: '/company/collaborators-analytics',
      icon: TrendingUp,
      description: 'Métricas de performance',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Progresso dos Cursos',
      url: '/company/course-progress',
      icon: Target,
      description: 'Acompanhar progresso',
      gradient: 'from-teal-500 to-cyan-500'
    },
  ];

  // Student menu items
  const studentMenuItems = [
    {
      title: 'Dashboard',
      url: '/student/dashboard',
      icon: BarChart3,
      description: 'Meu progresso geral',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Meus Cursos',
      url: '/student/courses',
      icon: BookOpen,
      description: 'Cursos em andamento',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Mentorias',
      url: '/student/mentorship',
      icon: MessageSquare,
      description: 'Sessões de mentoria',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Comunidade',
      url: '/student/community',
      icon: Sparkles,
      description: 'Fórum da comunidade',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Gamificação',
      url: '/student/gamification',
      icon: Crown,
      description: 'Conquistas e pontos',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Ranking',
      url: '/ranking',
      icon: Trophy,
      description: 'Ranking de colaboradores',
      gradient: 'from-amber-500 to-yellow-500'
    },
    // {
    //   title: 'Meu Progresso',
    //   url: '/student/analytics',
    //   icon: TrendingUp,
    //   description: 'Análise detalhada',
    //   gradient: 'from-green-500 to-emerald-500'
    // },
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case 'producer':
        return producerMenuItems;
      case 'company':
        return companyMenuItems;
      case 'student':
        return studentMenuItems;
      default:
        return studentMenuItems;
    }
  };

  const menuItems = getMenuItems();

  const getRoleDisplay = () => {
    switch (userRole) {
      case 'producer':
        return 'Produtor';
      case 'company':
        return 'Empresa';
      case 'student':
        return 'Estudante';
      case 'collaborator':
        return 'Colaborador';
      default:
        return 'Usuário';
    }
  };

  return (
    <Sidebar className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-yellow-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <SidebarHeader className="p-6 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col">
            <motion.span 
              className="text-lg font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Calmon Academy
            </motion.span>
            <motion.span 
              className="text-xs text-slate-400 capitalize font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {getRoleDisplay()}
            </motion.span>
          </div>
        </motion.div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/20' 
                              : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:border hover:border-slate-600/50'
                          }`
                        }
                      >
                        {/* Icon with gradient background */}
                        <div className={`relative w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        
                        {/* Text content */}
                        <div className="flex flex-col flex-1">
                          <span className="font-medium text-sm">{item.title}</span>
                          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                            {item.description}
                          </span>
                        </div>

                        {/* Active indicator */}
                        {({ isActive }) => isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute right-2 w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {userRole === 'company' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                <button
                  onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
                  className="flex items-center gap-2 w-full group"
                >
                  <motion.div
                    animate={{ rotate: isCompanyMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-300 transition-colors duration-300" />
                  </motion.div>
                  <span className="group-hover:text-slate-300 transition-colors duration-300">Empresa</span>
                </button>
              </SidebarGroupLabel>
              <AnimatePresence>
                {isCompanyMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SidebarGroupContent>
                      <SidebarMenu className="space-y-2">
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <NavLink 
                              to="/company/profile"
                              className={({ isActive }) =>
                                `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                  isActive 
                                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/20' 
                                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:border hover:border-slate-600/50'
                                }`
                              }
                            >
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Settings className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex flex-col flex-1">
                                <span className="font-medium text-sm">Perfil da Empresa</span>
                                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                                  Configurações da empresa
                                </span>
                              </div>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </SidebarGroup>
          </motion.div>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
