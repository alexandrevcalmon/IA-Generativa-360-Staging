
import { useAuth } from '@/hooks/auth/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, Settings, Crown, Sparkles, Building2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export function UserMenu() {
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          onClick={() => navigate('/auth')}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Entrar
        </Button>
      </motion.div>
    );
  }

  const handleSignOut = async () => {
    console.log('🚪 UserMenu enhanced logout initiated...', {
      userEmail: user.email,
      timestamp: new Date().toISOString()
    });
    
    // Disable the button immediately to prevent multiple clicks
    const button = document.querySelector('[data-logout-button]') as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      console.log('🚫 Logout button disabled to prevent duplicate requests');
    }
    
    try {
      // Call the enhanced signOut service
      const { error } = await signOut();
      
      console.log('✅ Enhanced logout service completed, navigating...', {
        hasError: !!error,
        timestamp: new Date().toISOString()
      });
      
      // Navigate immediately regardless of server response
      // The signOut service handles all error cases gracefully
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('💥 Unexpected error in UserMenu enhanced logout:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Force navigation and show a fallback message
      toast.success({
        title: "Logout realizado",
        description: "Redirecionando para página inicial..."
      });
      
      navigate('/', { replace: true });
    } finally {
      // Re-enable the button after a delay (in case navigation fails)
      setTimeout(() => {
        if (button) {
          button.disabled = false;
          console.log('🔄 Logout button re-enabled');
        }
      }, 2000);
    }
  };

  const handleProfileClick = () => {
    console.log('👤 Profile clicked for user role:', userRole);
    
    switch (userRole) {
      case 'producer':
        navigate('/producer/profile');
        break;
      case 'company':
        navigate('/company/profile');
        break;
      case 'student':
      case 'collaborator': // Both student and collaborator use student profile
        navigate('/student/profile');
        break;
      default:
        console.warn('⚠️ Unknown user role, redirecting to auth');
        navigate('/auth');
    }
  };

  const getRoleDisplay = () => {
    switch (userRole) {
      case 'producer':
        return 'Produtor';
      case 'company':
        return 'Empresa';
      case 'student':
        return 'Estudante';
      case 'collaborator':
        return 'Colaborador';
      default:
        return 'Usuário';
    }
  };

  const getRoleGradient = () => {
    switch (userRole) {
      case 'producer':
        return 'from-purple-500 to-pink-500';
      case 'company':
        return 'from-emerald-500 to-teal-500';
      case 'student':
        return 'from-blue-500 to-cyan-500';
      case 'collaborator':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'producer':
        return Crown;
      case 'company':
        return Building2;
      case 'student':
        return User;
      case 'collaborator':
        return Users;
      default:
        return User;
    }
  };

  const getUserInitials = () => {
    if (user.user_metadata?.name) {
      return user.user_metadata.name.charAt(0).toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  const RoleIcon = getRoleIcon();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            variant="ghost" 
            className="relative w-10 h-10 rounded-full bg-slate-800/40 backdrop-blur-xl border border-slate-600/40 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300 group p-0 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
          >
            <Avatar className="h-8 w-8 ring-2 ring-slate-600/50 group-hover:ring-slate-400/70 transition-all duration-300">
              <AvatarFallback className={`bg-gradient-to-br ${getRoleGradient()} text-white font-semibold text-sm shadow-lg`}>
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-xl" 
        align="end" 
        forceMount
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}
      >
        <DropdownMenuLabel className="font-normal p-4 border-b border-slate-700/30" style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-white leading-none">
              {user.user_metadata?.name || user.email}
            </p>
            <p className="text-xs text-slate-300 capitalize">
              {getRoleDisplay()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700/30" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DropdownMenuItem 
            onClick={handleProfileClick}
            className="flex items-center gap-2 px-4 py-3 text-slate-200 hover:text-white hover:bg-slate-800/60 transition-all duration-200 cursor-pointer rounded-lg mx-2 my-1 focus:bg-slate-800/60 focus:text-white data-[highlighted]:bg-slate-800/60 data-[highlighted]:text-white"
            style={{ 
              '--background': 'rgba(30, 41, 59, 0.6)',
              '--foreground': 'white',
              '--accent': 'rgba(30, 41, 59, 0.6)',
              '--accent-foreground': 'white'
            } as React.CSSProperties}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-2">
              <User className="h-3 w-3 text-white" />
            </div>
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center gap-2 px-4 py-3 text-slate-200 hover:text-white hover:bg-slate-800/60 transition-all duration-200 cursor-pointer rounded-lg mx-2 my-1 focus:bg-slate-800/60 focus:text-white data-[highlighted]:bg-slate-800/60 data-[highlighted]:text-white"
            style={{ 
              '--background': 'rgba(30, 41, 59, 0.6)',
              '--foreground': 'white',
              '--accent': 'rgba(30, 41, 59, 0.6)',
              '--accent-foreground': 'white'
            } as React.CSSProperties}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mr-2">
              <Settings className="h-3 w-3 text-white" />
            </div>
            <span>Configurações</span>
          </DropdownMenuItem>
        </motion.div>
        <DropdownMenuSeparator className="bg-slate-700/30" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <DropdownMenuItem 
            onClick={handleSignOut} 
            data-logout-button
            className="flex items-center gap-2 px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-all duration-200 cursor-pointer rounded-lg mx-2 my-1 focus:bg-red-500/20 focus:text-red-200 data-[highlighted]:bg-red-500/20 data-[highlighted]:text-red-200"
            style={{ 
              '--background': 'rgba(239, 68, 68, 0.2)',
              '--foreground': 'rgb(252, 165, 165)',
              '--accent': 'rgba(239, 68, 68, 0.2)',
              '--accent-foreground': 'rgb(252, 165, 165)'
            } as React.CSSProperties}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-2">
              <LogOut className="h-3 w-3 text-white" />
            </div>
            <span>Sair</span>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
