
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('🚫 useAuth called outside of AuthProvider');
    console.error('Stack trace:', new Error().stack);
    throw new Error('useAuth must be used within an AuthProvider. Make sure your component is wrapped with AuthProvider.');
  }
  console.log('[useAuth] context:', context);
  return context;
}
