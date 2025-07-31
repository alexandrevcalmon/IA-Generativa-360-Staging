import { ReactNode, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/auth/useAuth';
import { UserMenu } from './UserMenu';
import { SupportNotificationBell } from './SupportNotificationBell';
import { 
  BarChart3, 
  Building2, 
  Users, 
  BookOpen, 
  MessageSquare, 
  CreditCard,
  Settings,
  Bot,
  Trophy,
  Home,
  MessageCircle,
  User,
  ChevronDown,
  Sparkles,
  Crown,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Star,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompanyData } from '@/hooks/useCompanyData';
import { useCollaboratorData } from '@/hooks/useCollaboratorData';
import { useIsMobile } from '@/hooks/use-mobile';

// Menu item type definition
type MenuItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  gradient: string;
};

// Props for the UnifiedSidebar component
interface UnifiedSidebarProps {
  additionalContent?: ReactNode;
}

export function UnifiedSidebar({ additionalContent }: UnifiedSidebarProps) {
  const { user, userRole, signOut } = useAuth();
  const { data: companyData } = useCompanyData();
  const { data: collaboratorData } = useCollaboratorData();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  // Producer menu items - simplified
  const producerMenuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      url: '/producer/dashboard',
      icon: Home,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Empresas',
      url: '/producer/companies', 
      icon: Building2,
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Cursos',
      url: '/producer/courses',
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Mentorias',
      url: '/producer/mentorship',
      icon: MessageSquare,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Comunidade',
      url: '/producer/community',
      icon: Sparkles,
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Colaboradores',
      url: '/producer/collaborators-analytics',
      icon: Users,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Analytics',
      url: '/producer/subscription-analytics',
      icon: TrendingUp,
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      title: 'Planos',
      url: '/producer/plans',
      icon: CreditCard,
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'IA',
      url: '/producer/ai-configurations',
      icon: Bot,
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Central de Suporte',
      url: '/producer/support',
      icon: Headphones,
      gradient: 'from-indigo-500 to-blue-500'
    },
  ];

  // Company menu items - simplified
  const companyMenuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      url: '/company/dashboard',
      icon: Home,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Cursos',
      url: '/company/courses',
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Mentorias',
      url: '/company/mentorships',
      icon: MessageSquare,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Colaboradores',
      url: '/company/collaborators',
      icon: Users,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Central de Suporte',
      url: '/company/support',
      icon: Headphones,
      gradient: 'from-indigo-500 to-blue-500'
    },
    // {
    //   title: 'Analytics',
    //   url: '/company/collaborators-analytics',
    //   icon: TrendingUp,
    //   gradient: 'from-indigo-500 to-purple-500'
    // },
  ];

  // Student menu items - simplified
  const studentMenuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      url: '/student/dashboard',
      icon: Home,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Cursos',
      url: '/student/courses',
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Mentorias',
      url: '/student/mentorship',
      icon: MessageSquare,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: 'Comunidade',
      url: '/student/community',
      icon: Sparkles,
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Gamificação',
      url: '/student/gamification',
      icon: Crown,
      gradient: 'from-yellow-500 to-orange-500'
    },
    // {
    //   title: 'Analytics',
    //   url: '/student/analytics',
    //   icon: TrendingUp,
    //   gradient: 'from-green-500 to-emerald-500'
    // },
  ];

  // Get the appropriate menu items based on user role
  const getMenuItems = () => {
    switch (userRole) {
      case 'producer':
        return producerMenuItems;
      case 'company':
        return companyMenuItems;
      case 'student':
      case 'collaborator':
        return studentMenuItems;
      default:
        return studentMenuItems;
    }
  };

  const menuItems = getMenuItems();

  // Get display information based on user role - simplified
  const getDisplayInfo = () => {
    const emailPrefix = user?.email ? user.email.split('@')[0] : '';
    
    if (userRole === 'producer') {
      return {
        name: user?.user_metadata?.name || emailPrefix || 'Produtor',
        role: 'Produtor',
        roleIcon: Crown,
        roleGradient: 'from-purple-500 to-pink-500'
      };
    } else if (userRole === 'company') {
      return {
        name: companyData?.name || emailPrefix || 'Empresa',
        role: 'Empresa',
        roleIcon: Building2,
        roleGradient: 'from-emerald-500 to-teal-500'
      };
    } else {
      return {
        name: collaboratorData?.name || user?.user_metadata?.name || emailPrefix || 'Usuário',
        companyName: collaboratorData?.company?.name,
        role: userRole === 'collaborator' ? 'Colaborador' : 'Estudante',
        roleIcon: userRole === 'collaborator' ? Users : User,
        roleGradient: userRole === 'collaborator' ? 'from-orange-500 to-red-500' : 'from-blue-500 to-cyan-500'
      };
    }
  };

  const displayInfo = getDisplayInfo();
  const RoleIcon = displayInfo.roleIcon;

  return (
    <Sidebar className="bg-adapta-dark border-r border-slate-700/50">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-green-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-teal-500/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <SidebarHeader className="p-6 border-b border-slate-700/50 bg-slate-900/40 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex flex-col min-w-0 flex-1 items-center text-center max-w-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-2"
            >
              <img 
                src="/Logomarca Calmon Academy.png" 
                alt="Calmon Academy" 
                className="h-16 w-auto object-contain"
              />
            </motion.div>
            <motion.span 
              className="text-sm text-slate-300 font-medium truncate w-full max-w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {displayInfo.name}
            </motion.span>
            {displayInfo.companyName && (
              <motion.span 
                className="text-xs text-slate-400 truncate w-full max-w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {displayInfo.companyName}
              </motion.span>
            )}
          </div>
          
          {/* Notification Bell */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <SupportNotificationBell />
          </motion.div>
        </motion.div>
      </SidebarHeader>
      
      <SidebarContent className="p-4 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        onClick={() => isMobile && setOpenMobile(false)}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                            isActive 
                              ? 'bg-gradient-to-r from-emerald-500/20 to-green-600/20 text-emerald-400' 
                              : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                          }`
                        }
                      >
                        {/* Icon with gradient background */}
                        <div className={`relative w-7 h-7 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        
                        {/* Text content */}
                        <span className="font-medium text-sm truncate">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        

        
        {/* Additional content specific to user role */}
        {additionalContent}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-700/50 bg-slate-900/40 backdrop-blur-xl">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
