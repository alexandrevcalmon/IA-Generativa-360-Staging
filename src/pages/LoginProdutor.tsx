
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

export default function LoginProdutor() {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;
    
    console.log('LoginProdutor: checking auth state', { user: user?.email, userRole });
    
    // If no user, redirect to auth page
    if (!user) {
      console.log('No user, redirecting to auth');
      navigate('/auth');
      return;
    }
    
    // If user exists, redirect based on their actual role
    if (userRole) {
      console.log('User has role:', userRole, 'redirecting appropriately');
      
      switch (userRole) {
        case 'producer':
          navigate('/producer/dashboard');
          break;
        case 'company':
          navigate('/company-dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          console.warn('Unknown role:', userRole, 'redirecting to auth');
          navigate('/auth');
      }
    }
  }, [user, userRole, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Redirecionando...</div>
    </div>
  );
}
