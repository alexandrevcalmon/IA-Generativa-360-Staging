
import { useState } from 'react';
import { AuthForm } from './AuthForm';
import { AccountRecoveryOptions } from './AccountRecoveryOptions';
import { TestUserDialog } from './TestUserDialog';
import { Button } from '@/components/ui/button';

interface AuthTabsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  role: string;
  setRole: (role: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  authError?: string | null;
}

export function AuthTabs({
  email,
  setEmail,
  password,
  setPassword,
  role,
  setRole,
  loading,
  onSubmit,
  authError
}: AuthTabsProps) {
  const [showRecovery, setShowRecovery] = useState(false);

  if (showRecovery) {
    return (
      <AccountRecoveryOptions 
        email={email}
        onBack={() => setShowRecovery(false)}
      />
    );
  }

  return (
    <div className="w-full space-y-4">
      <AuthForm
        isLogin={true}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        role={role}
        setRole={setRole}
        loading={loading}
        onSubmit={onSubmit}
        authError={authError}
      />
      
      <div className="space-y-3">
        <div className="text-center">
          <TestUserDialog 
            onUseCredentials={(testEmail, testPassword) => {
              setEmail(testEmail);
              setPassword(testPassword);
            }}
          />
        </div>
        
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setShowRecovery(true)}
            className="text-gray-600 hover:text-emerald-600"
          >
            Problemas para acessar sua conta?
          </Button>
        </div>
      </div>
    </div>
  );
}
