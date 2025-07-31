
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import { PasswordChangeDialog } from '@/components/PasswordChangeDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleAuthForm } from '@/components/auth/SimpleAuthForm';
import { RoleIndicator } from '@/components/auth/RoleIndicator';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { useAuthRedirects } from '@/hooks/auth/useAuthRedirects';
import { AlertCircle, CheckCircle } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-medium mb-2 text-white">Erro de Autenticação</h3>
            <p className="text-gray-300 mb-4">
              Erro no sistema de autenticação. Tente recarregar a página.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white"
            >
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
  const [showPasswordUpdatedMessage, setShowPasswordUpdatedMessage] = useState(false);

  // Handle redirects for authenticated users
  useAuthRedirects({ user, userRole, authLoading, needsPasswordChange });

  // Check for password updated message
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'password_updated') {
      setShowPasswordUpdatedMessage(true);
      // Remove the message from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('message');
      navigate(`/auth?${newSearchParams.toString()}`, { replace: true });
    }
  }, [searchParams, navigate]);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Calmon Academy
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            Entre em sua conta
          </CardDescription>
          
          <RoleIndicator role={role} />
        </CardHeader>
        
        {showPasswordUpdatedMessage && (
          <div className="mx-6 mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-300 text-sm font-medium">
                Senha atualizada com sucesso! Agora você pode fazer login com sua nova senha.
              </span>
            </div>
          </div>
        )}
        <CardContent>
          <SimpleAuthForm
            onLogin={handleLogin}
            defaultRole={role}
          />

          <div className="mt-8 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white transition-colors text-base"
            >
              ← Voltar para o início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
