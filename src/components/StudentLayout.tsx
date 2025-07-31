
import { ReactNode, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { UnifiedSidebar } from './UnifiedSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/auth/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

const StudentLayout = () => {
  const { user, loading, userRole } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    console.log('🔄 StudentLayout: Component mounted', {
      user: user?.email,
      userRole,
      isMobile,
      loading
    });
  }, [user, userRole, isMobile, loading]);

  if (loading) {
    console.log('🔄 StudentLayout: Loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔄 StudentLayout: No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Allow both 'student' and 'collaborator' roles to access student layout
  if (userRole !== 'student' && userRole !== 'collaborator') {
    console.log('🔄 StudentLayout: Access denied for role:', userRole);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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

  console.log('🔄 StudentLayout: Rendering layout for user:', user.email, 'role:', userRole);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <UnifiedSidebar />
        <SidebarInset className="flex-1 flex flex-col min-h-screen">
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default StudentLayout;
