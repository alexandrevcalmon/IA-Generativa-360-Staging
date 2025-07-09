
import { ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/auth';
import { useIsMobile } from '@/hooks/use-mobile';

const StudentLayout = () => {
  const { user, loading, userRole } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Allow both 'student' and 'collaborator' roles to access student layout
  if (userRole !== 'student' && userRole !== 'collaborator') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <StudentSidebar />
        <SidebarInset className="flex-1 flex flex-col">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StudentLayout;
