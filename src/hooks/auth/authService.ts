
import { useToast } from '@/hooks/use-toast';
import { createSignInService } from './signInService';
import { createSignUpService } from './signUpService';
import { createPasswordService } from './passwordService';
import { createSignOutService } from './signOutService';

export const createAuthService = (toast: ReturnType<typeof useToast>['toast']) => {
  const signInService = createSignInService(toast);
  const signUpService = createSignUpService(toast);
  const passwordService = createPasswordService(toast);
  const signOutService = createSignOutService(toast);

  return {
    signIn: (email: string, password: string, role?: string) => signInService.signIn(email, password, role),
    signUp: signUpService.signUp,
    resetPassword: passwordService.resetPassword,
    changePassword: passwordService.changePassword,
    signOut: signOutService.signOut
  };
};
