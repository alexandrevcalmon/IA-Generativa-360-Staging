
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter 
} from '@/components/ui/sidebar';
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar,
  LogOut,
  User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { useCompanyData } from '@/hooks/useCompanyData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function CompanySidebar() {
  const { user, signOut } = useAuth();
  const { data: companyData } = useCompanyData();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'E';
  };

  const getDisplayName = () => {
    if (companyData?.name) {
      return companyData.name;
    }
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    }
    return 'Empresa';
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/company-dashboard'
    },
    {
      title: 'Colaboradores',
      icon: Users,
      href: '/company/collaborators'
    },
    {
      title: 'Cursos',
      icon: BookOpen,
      href: '/company/courses'
    },
    {
      title: 'Mentorias',
      icon: Calendar,
      href: '/company/mentorships'
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex flex-col">
            <span className="font-bold text-lg">Calmon Academy</span>
            {companyData?.name && (
              <span className="text-sm text-gray-600 truncate">
                {companyData.name}
              </span>
            )}
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link to={item.href} className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarFallback className="bg-calmon-100 text-calmon-700">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{getDisplayName()}</p>
                <p className="text-xs text-gray-500">Empresa</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/company/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
