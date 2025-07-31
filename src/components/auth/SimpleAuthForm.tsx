import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthErrorHandler } from './AuthErrorHandler';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';
import { TestUserDialog } from './TestUserDialog';

interface SimpleAuthFormProps {
  onLogin: (email: string, password: string, role: string) => Promise<{ error?: any }>;
  defaultRole?: string;
}

export function SimpleAuthForm({ onLogin, defaultRole = 'student' }: SimpleAuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (email || password)) {
      setError(null);
    }
  }, [email, password, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim()) {
      setError('Por favor, digite seu email');
      return;
    }
    
    if (!password.trim()) {
      setError('Por favor, digite sua senha');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await onLogin(email.trim(), password.trim(), role);
      
      if (result.error) {
        setAttempts(prev => prev + 1);
        
        // Extract meaningful error message
        const errorMessage = result.error.message || result.error || 'Erro no login';
        console.log('Error message received:', errorMessage);
        setError(errorMessage);
      }
    } catch (err: any) {
      setAttempts(prev => prev + 1);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const useTestCredentials = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-medium">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            disabled={loading}
            autoComplete="email"
            className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white font-medium">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-600/30 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {error && (
          <AuthErrorHandler 
            error={error}
            attempts={attempts}
          />
        )}

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
          disabled={loading || !email.trim() || !password.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      <div className="space-y-3 border-t border-gray-600/30 pt-4">
        {/* Removido botão de usuário demo */}
        <div className="text-center">
          <ForgotPasswordDialog />
        </div>
      </div>
    </div>
  );
}
