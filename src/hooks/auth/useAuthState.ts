
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [companyUserData, setCompanyUserData] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const clearUserState = () => {
    console.log('🧹 Clearing all user state...');
    setUser(null);
    setSession(null);
    setUserRole(null);
    setNeedsPasswordChange(false);
    setCompanyUserData(null);
  };

  return {
    // State
    user,
    session,
    loading,
    userRole,
    needsPasswordChange,
    companyUserData,
    isInitialized,
    // Setters
    setUser,
    setSession,
    setLoading,
    setUserRole,
    setNeedsPasswordChange,
    setCompanyUserData,
    setIsInitialized,
    // Methods
    clearUserState,
  };
}
