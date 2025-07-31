import { supabase } from '@/integrations/supabase/client';

export const createAuditService = () => {
  const logAuthEvent = async (
    eventType: 'login_success' | 'login_failure' | 'logout' | 'password_reset' | 'password_change' | 'signup',
    userId: string | null,
    email: string | null,
    metadata: Record<string, any> = {}
  ) => {
    try {
      console.log(`📝 [AuditService] Logging auth event: ${eventType} for ${email || userId || 'unknown user'}`);
      
      // Inserir diretamente na tabela de auditoria
      const { error } = await supabase
        .from('auth_audit_logs')
        .insert({
          event_type: eventType,
          user_id: userId,
          email: email,
          ip_address: null, // Não podemos obter o IP do cliente de forma confiável
          user_agent: navigator.userAgent,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        });

      if (error) {
        console.error(`❌ [AuditService] Failed to log auth event: ${error.message}`);
      } else {
        console.log(`✅ [AuditService] Successfully logged ${eventType} event`);
      }
    } catch (e) {
      // Non-blocking error - we don't want auth to fail if audit logging fails
      console.error(`❌ [AuditService] Error logging auth event:`, e);
    }
  };

  return {
    logAuthEvent
  };
};
