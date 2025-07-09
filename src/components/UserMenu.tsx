
import { useAuth } from '@/hooks/auth';
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
import { User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function UserMenu() {
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return (
      <Button 
        onClick={() => navigate('/auth')}
        variant="outline"
        className="border-blue-200 text-blue-700 hover:bg-blue-50"
      >
        Entrar
      </Button>
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
      toast({
        title: "Logout realizado",
        description: "Redirecionando para página inicial...",
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

  const getUserInitials = () => {
    if (user.user_metadata?.name) {
      return user.user_metadata.name.charAt(0).toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-700">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.name || user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {getRoleDisplay()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} data-logout-button>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
