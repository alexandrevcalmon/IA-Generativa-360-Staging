
import { useToast } from '@/hooks/use-toast';
import { createAuthService } from './authService';
import { fetchUserRoleAuxiliaryData } from './userRoleService';
import { createSessionValidationService } from './sessionValidationService';
import { createSessionCleanupService } from './sessionCleanupService';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UseAuthMethodsProps {
  user: User | null;
  companyUserData: any;
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  setUserRole: (role: string | null) => void;
  setNeedsPasswordChange: (needs: boolean) => void;
  setCompanyUserData: (data: any) => void;
  setLoading: (loading: boolean) => void;
}

export function useAuthMethods({
  user,
  companyUserData,
  setUser,
  setSession,
  setUserRole,
  setNeedsPasswordChange,
  setCompanyUserData,
  setLoading,
}: UseAuthMethodsProps) {
  const { toast } = useToast();
  const authService = createAuthService(toast);
  const sessionService = createSessionValidationService();
  const cleanupService = createSessionCleanupService();

  const refreshUserRole = async () => {
    if (!user) {
      console.log('⚠️ No user available for role refresh');
      return;
    }
    
    console.log('🔄 Refreshing user role for:', user.email);
    try {
      // Use the improved role determination service
      const auxData = await fetchUserRoleAuxiliaryData(user);
      
      const finalRole = auxData.role || 'student';
      setUserRole(finalRole);

      // Set company data based on role
      if (finalRole === 'company') {
        setCompanyUserData(auxData.companyData);
      } else if (finalRole === 'collaborator') {
        setCompanyUserData(auxData.collaboratorData);
      } else {
        setCompanyUserData(null);
      }
      
      console.log('✅ User role refreshed:', finalRole, { 
        hasCompanyData: !!auxData.companyData, 
        hasCollaboratorData: !!auxData.collaboratorData 
      });
    } catch (error) {
      console.error('❌ Error refreshing user role:', error);
      // Set safe defaults
      setUserRole('student');
      setCompanyUserData(null);
    }
  };

  const signIn = async (email: string, password: string, role?: string) => {
    console.log('🔑 Starting simplified sign in for:', email, 'with role:', role);
    setLoading(true);
    
    try {
      // Clear any corrupted session data first
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      } catch (cleanupError) {
        console.log('Pre-login cleanup completed');
      }

      const result = await authService.signIn(email, password, role);
      
      if (result.error) {
        console.error('❌ Authentication failed:', result.error.message);
        setLoading(false);
        return result;
      }

      if (result.user && result.session) {
        console.log('✅ Authentication successful for:', result.user.email);
        
        // Set user and session immediately
        setUser(result.user);
        setSession(result.session);
        
        // Handle password change requirement
        if (result.needsPasswordChange) {
          console.log('🔐 Password change required');
          setNeedsPasswordChange(true);
          setUserRole(result.user.user_metadata?.role || 'student');
          setLoading(false);
          return { error: null, needsPasswordChange: true };
        }
        
        // Load user role data asynchronously
        setTimeout(async () => {
          try {
            const auxData = await fetchUserRoleAuxiliaryData(result.user as User);
            const finalRole = auxData.role || result.user.user_metadata?.role || 'student';
            
            setUserRole(finalRole);
            setNeedsPasswordChange(false);

            // Set company data based on role
            if (finalRole === 'company') {
              setCompanyUserData(auxData.companyData);
            } else if (finalRole === 'collaborator') {
              setCompanyUserData(auxData.collaboratorData);
            } else {
              setCompanyUserData(null);
            }
          } catch (auxError) {
            console.error('⚠️ Error loading user data:', auxError);
            setUserRole(result.user.user_metadata?.role || 'student');
            setCompanyUserData(null);
          }
        }, 0);
        
        setLoading(false);
        return { error: null, needsPasswordChange: false };
      }
      
      console.error('❌ No user data received');
      setLoading(false);
      return { error: { message: 'Login failed - no user data' } };
    } catch (error) {
      console.error('❌ Critical sign in error:', error);
      setLoading(false);
      return { error: { message: 'Erro de conexão' } };
    }
  };

  const changePassword = async (newPassword: string) => {
    const result = await authService.changePassword(newPassword, user?.id, companyUserData);
    
    if (!result.error && companyUserData) {
      setNeedsPasswordChange(false);
      console.log('✅ Password changed, needs_password_change set to false');
    }
    
    return result;
  };

  const signOut = async () => {
    console.log('🚪 Enhanced AuthProvider signOut called');
    
    try {
      const result = await authService.signOut();
      
      if (!result.error) {
        console.log('✅ SignOut successful, clearing local state');
        // Clear state immediately
        setUser(null);
        setSession(null);
        setUserRole(null);
        setNeedsPasswordChange(false);
        setCompanyUserData(null);
      } else {
        console.error('❌ SignOut error:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('💥 SignOut error:', error);
      // Force local cleanup on any error
      cleanupService.clearLocalSession();
      setUser(null);
      setSession(null);
      setUserRole(null);
      setNeedsPasswordChange(false);
      setCompanyUserData(null);
      return { error: null }; // Return success to allow navigation
    }
  };

  return {
    signIn,
    signUp: authService.signUp,
    signOut,
    changePassword,
    resetPassword: authService.resetPassword,
    refreshUserRole,
  };
}
