
import { useAuth } from '@/hooks/auth/useAuth';
import { Navigate, Outlet } from 'react-router-dom';
import { UnifiedSidebar } from './UnifiedSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const ProdutorLayout = () => {
  console.log('🏭 ProdutorLayout: Initializing...');

  let user, loading, userRole;

  try {
    const authData = useAuth();
    user = authData.user;
    loading = authData.loading;
    userRole = authData.userRole;
    console.log('🏭 ProdutorLayout: Auth data retrieved', {
      user: user?.email,
      userRole,
      loading
    });
  } catch (error) {
    console.error('🏭 ProdutorLayout: Error using auth hook:', error);
    return <Navigate to="/auth?error=auth_context_error" replace />;
  }

  if (loading) {
    console.log('🏭 ProdutorLayout: Auth loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    console.log('🏭 ProdutorLayout: No user, redirecting to auth');
    return <Navigate to="/auth?error=no_user" replace />;
  }

  // Enhanced role checking with better error messages
  if (userRole !== 'producer') {
    console.warn('🏭 ProdutorLayout: Access denied', {
      userEmail: user.email,
      userId: user.id,
      currentRole: userRole,
      requiredRole: 'producer'
    });

    // Redirect based on actual user role
    const redirectPath = (() => {
      switch (userRole) {
        case 'company':
          return '/company/dashboard';
        case 'student':
        case 'collaborator':
          return '/student/dashboard';
        default:
          return '/auth';
      }
    })();

    console.log('🏭 ProdutorLayout: Redirecting to appropriate dashboard:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('🏭 ProdutorLayout: Access granted for producer:', user.email);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <UnifiedSidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProdutorLayout;
