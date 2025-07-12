
import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { PasswordChangeDialog } from '@/components/PasswordChangeDialog';

interface AuthGuardProps {
  children?: React.ReactNode;
  requiredRole?: 'producer' | 'company' | 'student';
  redirectTo?: string;
}

export function AuthGuard({ children, requiredRole, redirectTo = '/auth' }: AuthGuardProps) {
  const { user, loading, userRole, needsPasswordChange, refreshUserRole } = useAuth();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      console.log('🚫 No user, redirecting to:', redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  // Handle role validation once user is loaded
  useEffect(() => {
    const validateAccess = async () => {
      if (!user || loading) {
        return;
      }

      console.log('🔒 AuthGuard validating access:', {
        userEmail: user.email,
        userRole,
        requiredRole,
        needsPasswordChange
      });

      // If no role yet, try to refresh
      if (!userRole) {
        console.log('🔄 No role detected, refreshing...');
        await refreshUserRole();
      }

      setIsValidating(false);
    };

    validateAccess();
  }, [user, loading, userRole, requiredRole, refreshUserRole]);

  // Show loading while validating
  if (loading || isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  // Redirect if no user
  if (!user) {
    return null;
  }

  // Show password change dialog if needed
  if (needsPasswordChange) {
    console.log('🔐 Password change required for:', user.email);
    return <PasswordChangeDialog />;
  }

  // Check role requirements
  if (requiredRole) {
    // Só mostrar acesso negado se a role já foi carregada e não bate com a requerida
    if (!userRole) {
      // Ainda não carregou a role, mostrar loading
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Carregando permissões...</div>
        </div>
      );
    }
    if (userRole !== requiredRole) {
      console.warn('⚠️ Role mismatch - expected:', requiredRole, 'but got:', userRole);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
            <p className="text-sm text-gray-500 mb-4">
              Role atual: {userRole || 'indefinido'} | Role necessário: {requiredRole}
            </p>
            <button 
              onClick={() => navigate('/', { replace: true })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      );
    }
  }

  console.log('✅ AuthGuard access granted for:', user.email, 'with role:', userRole);
  
  // If children are provided, render them; otherwise render Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}
