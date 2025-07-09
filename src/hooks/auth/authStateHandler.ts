
import { Session, User } from '@supabase/supabase-js';
import { fetchUserRoleAuxiliaryData } from './userRoleService';
import { createSessionValidationService } from './sessionValidationService';

interface AuthStateHandlerProps {
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setUserRole: (role: string | null) => void;
  setNeedsPasswordChange: (needs: boolean) => void;
  setCompanyUserData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
  clearUserState: () => void;
}

export function createAuthStateHandler(props: AuthStateHandlerProps) {
  const {
    setSession,
    setUser,
    setUserRole,
    setNeedsPasswordChange,
    setCompanyUserData,
    setLoading,
    setIsInitialized,
    clearUserState,
  } = props;

  const sessionService = createSessionValidationService();

  const handleAuthStateChange = async (event: string, session: Session | null) => {
    console.log('🔐 Simplified auth state change:', { 
      event, 
      userEmail: session?.user?.email, 
      hasSession: !!session
    });
    
    if (event === 'SIGNED_OUT' || !session?.user) {
      console.log('🚪 User signed out or no session, clearing state');
      clearUserState();
      setLoading(false);
      setIsInitialized(true);
      return;
    }
    
    if (event === 'TOKEN_REFRESHED') {
      console.log('🔄 Token refreshed, updating session');
      setSession(session);
      setUser(session.user);
      return; // Don't refetch user data on token refresh
    }
    
    // Update session and user immediately for all other events
    setSession(session);
    setUser(session.user);
    
    // Fetch role data asynchronously with simplified error handling
    setTimeout(async () => {
      try {
        const user = session.user as User;
        console.log('👤 Loading user data for:', user.email);
        
        const auxData = await fetchUserRoleAuxiliaryData(user);
        
        console.log('✅ User data loaded:', {
          userEmail: user.email,
          role: auxData.role,
          needsPasswordChange: auxData.needsPasswordChange
        });

        // Set role with fallback
        const finalRole = auxData.role || user.user_metadata?.role || 'student';
        setUserRole(finalRole);

        // Set password change requirement
        setNeedsPasswordChange(auxData.needsPasswordChange || false);

        // Set company user data based on role
        if (finalRole === 'company') {
          setCompanyUserData(auxData.companyData);
        } else if (finalRole === 'collaborator') {
          setCompanyUserData(auxData.collaboratorData);
        } else {
          setCompanyUserData(null);
        }

      } catch (error) {
        console.error('⚠️ Error loading user data:', error);
        // Set safe defaults on error
        setUserRole(session.user.user_metadata?.role || 'student');
        setNeedsPasswordChange(false);
        setCompanyUserData(null);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    }, 0);
  };

  return { handleAuthStateChange };
}
