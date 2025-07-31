import { supabase } from '@/integrations/supabase/client';

export const createThrottlingService = () => {
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MINUTES = 15;
  
  const checkLoginAttempts = async (email: string): Promise<{ allowed: boolean; remainingAttempts: number; lockedUntil: Date | null }> => {
    try {
      console.log(`🔒 [ThrottlingService] Checking login attempts for ${email}`);
      
      // Get current attempts for this email
      const { data, error } = await supabase
        .from('auth_login_attempts')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      console.log(`🔍 [ThrottlingService] Checking attempts for ${email}:`, data ? `Found: ${data.attempt_count} attempts` : 'No record found');
      
      const now = new Date();
      
      // No record found or error, create new record and allow login
      if (error || !data) {
        console.log(`✅ [ThrottlingService] No record found for ${email}, creating new record`);
        // Criar um novo registro para este email usando upsert para evitar conflitos
        await supabase
          .from('auth_login_attempts')
          .upsert({
            email: email.toLowerCase(),
            attempt_count: 0,
            last_attempt: now.toISOString(),
            locked_until: null,
            updated_at: now.toISOString()
          }, { onConflict: 'email' });
        
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null };
      }
      
      // Check if account is locked
      if (data.locked_until) {
        const lockExpiry = new Date(data.locked_until);
        
        // If lock has expired, reset attempts
        if (now > lockExpiry) {
          console.log(`✅ [ThrottlingService] Lock expired for ${email}, resetting attempts`);
          await supabase
            .from('auth_login_attempts')
            .update({
              attempt_count: 0,
              last_attempt: now.toISOString(),
              locked_until: null,
              updated_at: now.toISOString()
            })
            .eq('email', email.toLowerCase());
          
          return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null };
        }
        
        // Account is still locked
        console.log(`🔒 [ThrottlingService] Account ${email} is locked until ${lockExpiry.toISOString()}`);
        return { 
          allowed: false, 
          remainingAttempts: 0, 
          lockedUntil: lockExpiry 
        };
      }
      
      // Check if attempts should be reset (24 hours since last attempt)
      const lastAttempt = new Date(data.last_attempt);
      const resetThreshold = new Date(now);
      resetThreshold.setHours(resetThreshold.getHours() - 24);
      
      if (lastAttempt < resetThreshold) {
        console.log(`✅ [ThrottlingService] Last attempt was more than 24 hours ago for ${email}, resetting attempts`);
        await supabase
          .from('auth_login_attempts')
          .update({
            attempt_count: 0,
            last_attempt: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('email', email.toLowerCase());
        
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null };
      }
      
      const remainingAttempts = MAX_ATTEMPTS - data.attempt_count;
      console.log(`✅ [ThrottlingService] ${email} has ${remainingAttempts} attempts remaining`);
      return { 
        allowed: true, 
        remainingAttempts, 
        lockedUntil: null 
      };
      
    } catch (e) {
      console.error(`❌ [ThrottlingService] Error checking login attempts:`, e);
      // Fail open to prevent login issues if the throttling service fails
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null };
    }
  };
  
  const recordSuccessfulLogin = async (email: string): Promise<void> => {
    try {
      console.log(`✅ [ThrottlingService] Recording successful login for ${email}`);
      // Reset attempts for this email
      await supabase
        .from('auth_login_attempts')
        .upsert({
          email: email.toLowerCase(),
          attempt_count: 0,
          last_attempt: new Date().toISOString(),
          locked_until: null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });
      
      console.log(`✅ [ThrottlingService] Successfully reset attempts for ${email}`);
    } catch (e) {
      console.error(`❌ [ThrottlingService] Error recording successful login:`, e);
    }
  };
  
  const recordFailedLogin = async (email: string): Promise<{ remainingAttempts: number; isLocked: boolean }> => {
    try {
      console.log(`❌ [ThrottlingService] Recording failed login for ${email}`);
      // Get current attempts for this email
      const { data, error } = await supabase
        .from('auth_login_attempts')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      const now = new Date();
      
      // No record found or error, create new record
      if (error || !data) {
        console.log(`✅ [ThrottlingService] No record found for ${email}, creating new record with 1 attempt`);
        await supabase
          .from('auth_login_attempts')
          .upsert({
            email: email.toLowerCase(),
            attempt_count: 1,
            last_attempt: now.toISOString(),
            updated_at: now.toISOString()
          }, { onConflict: 'email' });
        
        return { remainingAttempts: MAX_ATTEMPTS - 1, isLocked: false };
      }
      
      // Increment attempt count
      const newAttemptCount = data.attempt_count + 1;
      const isLocked = newAttemptCount >= MAX_ATTEMPTS;
      const lockedUntil = isLocked ? new Date(now.getTime() + LOCKOUT_DURATION_MINUTES * 60000).toISOString() : null;
      
      console.log(`${isLocked ? '🔒' : '⚠️'} [ThrottlingService] ${email} now has ${newAttemptCount} attempts. ${isLocked ? 'Account locked!' : `${MAX_ATTEMPTS - newAttemptCount} attempts remaining.`}`);
      
      await supabase
        .from('auth_login_attempts')
        .update({
          attempt_count: newAttemptCount,
          last_attempt: now.toISOString(),
          locked_until: lockedUntil,
          updated_at: now.toISOString()
        })
        .eq('email', email.toLowerCase());
      
      const remainingAttempts = Math.max(0, MAX_ATTEMPTS - newAttemptCount);
      
      return { remainingAttempts, isLocked };
    } catch (e) {
      console.error(`❌ [ThrottlingService] Error recording failed login:`, e);
      return { remainingAttempts: MAX_ATTEMPTS, isLocked: false };
    }
  };
  
  const getThrottleStatus = async (email: string) => {
    const throttleCheck = await checkLoginAttempts(email);
    
    if (!throttleCheck.allowed) {
      const remainingMinutes = throttleCheck.lockedUntil ? 
        Math.ceil((throttleCheck.lockedUntil.getTime() - new Date().getTime()) / 60000) : 
        LOCKOUT_DURATION_MINUTES;
      
      return {
        blocked: true,
        message: `Muitas tentativas de login falharam. Tente novamente em ${remainingMinutes} minutos.`,
        remainingTime: remainingMinutes
      };
    }

    // Mostrar aviso quando estiver próximo do limite
    if (throttleCheck.remainingAttempts <= 2) {
      return {
        blocked: false,
        warning: true,
        message: `Atenção: ${throttleCheck.remainingAttempts} tentativa${throttleCheck.remainingAttempts !== 1 ? 's' : ''} restante${throttleCheck.remainingAttempts !== 1 ? 's' : ''} antes do bloqueio temporário.`,
        attemptsRemaining: throttleCheck.remainingAttempts
      };
    }

    return { 
      blocked: false, 
      warning: false,
      attemptsRemaining: throttleCheck.remainingAttempts
    };
  };

  return {
    checkLoginAttempts,
    recordSuccessfulLogin,
    recordFailedLogin,
    getThrottleStatus
  };
};
