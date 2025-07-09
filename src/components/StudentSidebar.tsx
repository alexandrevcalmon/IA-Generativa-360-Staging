
import {
  BookOpen,
  BarChart3,
  Calendar,
  MessageCircle,
  Trophy,
  User,
  Home,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { UserMenu } from "./UserMenu";
import { useAuth } from "@/hooks/auth";
import { useCollaboratorData } from "@/hooks/useCollaboratorData";
import { Link } from "react-router-dom";

const studentMenuItems = [
  {
    title: "Dashboard",
    url: "/student/dashboard",
    icon: Home,
  },
  {
    title: "Meus Cursos",
    url: "/student/courses",
    icon: BookOpen,
  },
  {
    title: "Calendário",
    url: "/student/calendar",
    icon: Calendar,
  },
  {
    title: "Comunidade",
    url: "/student/community",
    icon: MessageCircle,
  },
  {
    title: "Mentoria",
    url: "/student/mentorship",
    icon: Users,
  },
  {
    title: "Gamificação",
    url: "/student/gamification",
    icon: Trophy,
  },
  {
    title: "Analytics",
    url: "/student/analytics",
    icon: BarChart3,
  },
  {
    title: "Perfil",
    url: "/student/profile",
    icon: User,
  },
];

export function StudentSidebar() {
  const { user, userRole } = useAuth();
  const { data: collaboratorData } = useCollaboratorData();

  // Always use Calmon Academy logo, but display collaborator info
  const displayInfo = {
    platformTitle: "Calmon Academy",
    userName: collaboratorData?.name || user?.email || "Usuário",
    companyName: collaboratorData?.company?.name,
    userRole: userRole === 'collaborator' ? 'Colaborador' : 'Estudante'
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-gray-800 truncate">
              {displayInfo.platformTitle}
            </span>
            <span className="text-xs text-gray-600 truncate">
              {displayInfo.userName}
            </span>
            {displayInfo.companyName && (
              <span className="text-xs text-gray-500 truncate">
                {displayInfo.companyName}
              </span>
            )}
            <span className="text-xs text-gray-500 truncate">
              {displayInfo.userRole}
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studentMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-800">
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-2 bg-white">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
