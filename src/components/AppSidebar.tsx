
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
import { useAuth } from '@/hooks/auth';
import { 
  BarChart3, 
  Building2, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Bot
} from 'lucide-react';
import { UserMenu } from './UserMenu';

export function AppSidebar() {
  const { signOut, userRole } = useAuth();
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);

  // Producer menu items
  const producerMenuItems = [
    {
      title: 'Dashboard',
      url: '/producer/dashboard',
      icon: BarChart3,
    },
    {
      title: 'Empresas',
      url: '/producer/companies', 
      icon: Building2,
    },
    {
      title: 'Cursos',
      url: '/producer/courses',
      icon: BookOpen,
    },
    {
      title: 'Mentorias',
      url: '/producer/mentorship',
      icon: MessageSquare,
    },
    {
      title: 'Comunidade',
      url: '/producer/community',
      icon: MessageSquare,
    },
    {
      title: 'Colaboradores',
      url: '/producer/collaborators-analytics',
      icon: Users,
    },
    {
      title: 'Planos',
      url: '/producer/plans',
      icon: CreditCard,
    },
    {
      title: 'Configurações de IA',
      url: '/producer/ai-configurations',
      icon: Bot,
    },
  ];

  // Company menu items
  const companyMenuItems = [
    {
      title: 'Dashboard',
      url: '/company/dashboard',
      icon: BarChart3,
    },
    {
      title: 'Cursos',
      url: '/company/courses',
      icon: BookOpen,
    },
    {
      title: 'Mentorias',
      url: '/company/mentorships',
      icon: MessageSquare,
    },
    {
      title: 'Colaboradores',
      url: '/company/collaborators',
      icon: Users,
    },
    {
      title: 'Análise de Colaboradores',
      url: '/company/collaborators-analytics',
      icon: BarChart3,
    },
    {
      title: 'Progresso dos Cursos',
      url: '/company/course-progress',
      icon: BookOpen,
    },
  ];

  // Student menu items
  const studentMenuItems = [
    {
      title: 'Dashboard',
      url: '/student/dashboard',
      icon: BarChart3,
    },
    {
      title: 'Meus Cursos',
      url: '/student/courses',
      icon: BookOpen,
    },
    {
      title: 'Calendário',
      url: '/student/calendar',
      icon: Calendar,
    },
    {
      title: 'Mentorias',
      url: '/student/mentorship',
      icon: MessageSquare,
    },
    {
      title: 'Comunidade',
      url: '/student/community',
      icon: MessageSquare,
    },
    {
      title: 'Gamificação',
      url: '/student/gamification',
      icon: BarChart3,
    },
    {
      title: 'Meu Progresso',
      url: '/student/analytics',
      icon: BarChart3,
    },
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

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Calmon Academy</span>
            <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {userRole === 'company' && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <button
                onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
                className="flex items-center gap-1 w-full"
              >
                {isCompanyMenuOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                Empresa
              </button>
            </SidebarGroupLabel>
            {isCompanyMenuOpen && (
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to="/company/profile"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`
                        }
                      >
                        <Settings className="h-4 w-4" />
                        <span>Perfil da Empresa</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
