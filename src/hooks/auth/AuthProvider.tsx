
import { createContext, ReactNode } from 'react';
import { AuthContextType } from './types';
import { useAuthInitialization } from './useAuthInitialization';
import { useAuthMethods } from './useAuthMethods';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('🔧 AuthProvider: Initializing...');
  
  const authState = useAuthInitialization();
  
  const {
    user,
    session,
    loading,
    userRole,
    needsPasswordChange,
    companyUserData,
    isInitialized,
    setUser,
    setSession,
    setUserRole,
    setNeedsPasswordChange,
    setCompanyUserData,
    setLoading,
  } = authState;

  const authMethods = useAuthMethods({
    user,
    companyUserData,
    setUser,
    setSession,
    setUserRole,
    setNeedsPasswordChange,
    setCompanyUserData,
    setLoading,
  });

  // Role helper properties
  const isProducer = userRole === 'producer';
  const isCompany = userRole === 'company';
  const isStudent = userRole === 'student';
  const isCollaborator = userRole === 'collaborator';

  console.log('🔍 AuthProvider current state:', {
    user: user?.email,
    userRole,
    isProducer,
    isCompany,
    isStudent,
    isCollaborator,
    loading: loading || !isInitialized,
    isInitialized
  });

  console.log('[AuthProvider] user:', user, 'session:', session, 'userRole:', userRole, 'isInitialized:', isInitialized);

  const value = {
    user,
    session,
    loading: loading || !isInitialized,
    userRole,
    isProducer,
    isCompany,
    isStudent,
    needsPasswordChange,
    companyUserData,
    ...authMethods,
  };

  console.log('🔧 AuthProvider: Providing context value');

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
