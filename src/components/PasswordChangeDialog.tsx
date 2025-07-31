
import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { translateSupabaseError } from '@/hooks/auth/commonAuthUtils';

export function PasswordChangeDialog() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { changePassword, refreshUserRole } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error({
        title: "Erro na confirmação",
        description: "As senhas não coincidem."
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.error({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres."
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔐 Attempting password change');
      const { error } = await changePassword(newPassword);
      
      if (error) {
        console.error('❌ Password change failed:', error);
        toast.error({
          title: "Erro ao alterar senha",
          description: translateSupabaseError(error)
        });
      } else {
        console.log('✅ Password changed successfully, refreshing user role...');
        // Force refresh of user role and flags after password change
        await refreshUserRole();
        
        toast.success({
          title: "Senha alterada com sucesso!",
          description: "Redirecionando para o dashboard..."
        });
      }
    } catch (error: any) {
      console.error('❌ Unexpected error during password change:', error);
      toast.error({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante a alteração da senha.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} modal={true}>
      <DialogContent className="sm:max-w-md bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg mx-auto mb-6">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            Alterar Senha
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-base">
            Por segurança, você precisa criar uma nova senha para acessar sua conta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-white font-medium">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                required
                minLength={6}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-600/30 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white font-medium">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                required
                minLength={6}
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-600/30 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-300 bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
            <p className="font-medium mb-2">Sua nova senha deve ter:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Pelo menos 6 caracteres</li>
              <li>Ser diferente da senha padrão</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
            disabled={loading}
          >
            {loading ? 'Alterando senha...' : 'Alterar Senha'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
