
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { PasswordChangeDialog } from '@/components/PasswordChangeDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleAuthForm } from '@/components/auth/SimpleAuthForm';
import { RoleIndicator } from '@/components/auth/RoleIndicator';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { useAuthRedirects } from '@/hooks/auth/useAuthRedirects';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Auth() {
  const navigate = useNavigate();
  
  // Safely use auth hook with error boundary
  let authData;
  try {
    authData = useAuth();
  } catch (error) {
    console.error('Auth context error:', error);
    // If auth context is not available, show a fallback
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Erro de Autenticação</h3>
            <p className="text-muted-foreground mb-4">
              Erro no sistema de autenticação. Tente recarregar a página.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, userRole, needsPasswordChange, loading: authLoading, signIn } = authData;
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') || 'student');

  // Handle redirects for authenticated users
  useAuthRedirects({ user, userRole, authLoading, needsPasswordChange });

  const handleLogin = async (email: string, password: string, selectedRole: string) => {
    return await signIn(email, password, selectedRole);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  // Priority 1: Show password change dialog if user needs to change password
  if (!authLoading && user && needsPasswordChange) {
    console.log('🔐 Showing password change dialog for user:', user.email);
    return <PasswordChangeDialog />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Calmon Academy
          </CardTitle>
          <CardDescription>
            Entre em sua conta
          </CardDescription>
          
          <RoleIndicator role={role} />
        </CardHeader>
        <CardContent>
          <SimpleAuthForm
            onLogin={handleLogin}
            defaultRole={role}
          />

          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-emerald-600"
            >
              ← Voltar para o início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
