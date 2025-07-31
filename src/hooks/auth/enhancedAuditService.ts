import { supabase } from '@/integrations/supabase/client';

interface AuditEvent {
  event_type: string;
  user_id?: string;
  email?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

interface SecurityAlert {
  type: 'suspicious_activity' | 'failed_login' | 'role_change' | 'subscription_issue';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
}

export const createEnhancedAuditService = () => {
  const getClientInfo = () => {
    return {
      ip_address: 'unknown', // Would be set by server
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  };

  const logEvent = async (event: Omit<AuditEvent, 'timestamp'>): Promise<void> => {
    try {
      const clientInfo = getClientInfo();
      
      const auditEvent: AuditEvent = {
        ...event,
        timestamp: clientInfo.timestamp
      };

      // Log to Supabase audit table
      const { error } = await supabase
        .from('auth_audit_logs')
        .insert({
          event_type: auditEvent.event_type,
          user_id: auditEvent.user_id,
          email: auditEvent.email,
          ip_address: auditEvent.ip_address || clientInfo.ip_address,
          user_agent: auditEvent.user_agent || clientInfo.user_agent,
          metadata: {
            ...auditEvent.metadata,
            severity: auditEvent.severity // Incluir severity no metadata
          },
          created_at: auditEvent.timestamp
        });

      if (error) {
        console.error('[EnhancedAuditService] Error logging audit event:', error);
      } else {
        console.log(`[EnhancedAuditService] Audit event logged: ${event.event_type}`);
      }

      // Check for security alerts
      await checkSecurityAlerts(auditEvent);

    } catch (error) {
      console.error('[EnhancedAuditService] Error in logEvent:', error);
    }
  };

  const checkSecurityAlerts = async (event: AuditEvent): Promise<void> => {
    const alerts: SecurityAlert[] = [];

    // Check for multiple failed logins
    if (event.event_type === 'login_failure') {
      const recentFailures = await getRecentFailedLogins(event.email || '', 15); // 15 minutes
      
      if (recentFailures >= 5) {
        alerts.push({
          type: 'suspicious_activity',
          message: `Multiple failed login attempts detected for ${event.email}`,
          severity: 'high',
          metadata: {
            email: event.email,
            failure_count: recentFailures,
            time_window: '15 minutes'
          }
        });
      }
    }

    // Check for role changes (detect via metadata)
    if (event.metadata?.action === 'role_change') {
      alerts.push({
        type: 'role_change',
        message: `Role change detected for user ${event.user_id}`,
        severity: 'medium',
        metadata: {
          user_id: event.user_id,
          old_role: event.metadata?.old_role,
          new_role: event.metadata?.new_role
        }
      });
    }

    // Check for subscription issues (detect via metadata)
    if (event.metadata?.subscription_event_type === 'subscription_expired' || event.metadata?.subscription_event_type === 'payment_failed') {
      alerts.push({
        type: 'subscription_issue',
        message: `Subscription issue detected for company ${event.metadata?.company_id}`,
        severity: 'medium',
        metadata: {
          company_id: event.metadata?.company_id,
          issue_type: event.metadata?.subscription_event_type,
          subscription_status: event.metadata?.subscription_status
        }
      });
    }

    // Log security alerts (temporarily disabled - table doesn't exist)
    // for (const alert of alerts) {
    //   await logSecurityAlert(alert);
    // }
  };

  const getRecentFailedLogins = async (email: string, minutes: number): Promise<number> => {
    try {
      const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
      
      const { count, error } = await supabase
        .from('auth_audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('email', email)
        .eq('event_type', 'login_failure')
        .gte('created_at', cutoffTime.toISOString());

      if (error) {
        console.error('[EnhancedAuditService] Error getting recent failed logins:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[EnhancedAuditService] Error in getRecentFailedLogins:', error);
      return 0;
    }
  };

  // Temporarily disabled - security_alerts table doesn't exist
  // const logSecurityAlert = async (alert: SecurityAlert): Promise<void> => {
  //   try {
  //     const { error } = await supabase
  //       .from('security_alerts')
  //       .insert({
  //         alert_type: alert.type,
  //         message: alert.message,
  //         severity: alert.severity,
  //         metadata: alert.metadata,
  //         created_at: new Date().toISOString()
  //       });

  //     if (error) {
  //       console.error('[EnhancedAuditService] Error logging security alert:', error);
  //     } else {
  //       console.log(`[EnhancedAuditService] Security alert logged: ${alert.type}`);
  //     }
  //   } catch (error) {
  //     console.error('[EnhancedAuditService] Error in logSecurityAlert:', error);
  //   }
  // };

  // Convenience methods for common events
  const logLoginSuccess = async (userId: string, email: string, metadata?: Record<string, any>) => {
    await logEvent({
      event_type: 'login_success',
      user_id: userId,
      email,
      metadata,
      severity: 'low'
    });
  };

  const logLoginFailure = async (email: string, reason: string, metadata?: Record<string, any>) => {
    await logEvent({
      event_type: 'login_failure',
      email,
      metadata: {
        reason,
        ...metadata
      },
      severity: 'medium'
    });
  };

  const logRoleChange = async (userId: string, oldRole: string, newRole: string, metadata?: Record<string, any>) => {
    await logEvent({
      event_type: 'login_success', // Usar login_success como fallback para role_change
      user_id: userId,
      metadata: {
        old_role: oldRole,
        new_role: newRole,
        action: 'role_change',
        ...metadata
      },
      severity: 'medium'
    });
  };

  const logPasswordChange = async (userId: string, email: string, metadata?: Record<string, any>) => {
    await logEvent({
      event_type: 'password_change',
      user_id: userId,
      email,
      metadata,
      severity: 'low'
    });
  };

  const logSubscriptionEvent = async (userId: string, eventType: string, metadata?: Record<string, any>) => {
    await logEvent({
      event_type: 'login_success', // Usar login_success como fallback para eventos de subscription
      user_id: userId,
      metadata: {
        subscription_event_type: eventType,
        ...metadata
      },
      severity: 'medium'
    });
  };

  const logSuspiciousActivity = async (userId: string, email: string, activity: string, metadata?: Record<string, any>) => {
    await logEvent({
      event_type: 'login_failure', // Usar login_failure como fallback para suspicious_activity
      user_id: userId,
      email,
      metadata: {
        activity,
        action: 'suspicious_activity',
        ...metadata
      },
      severity: 'high'
    });
  };

  const getAuditLogs = async (filters?: {
    userId?: string;
    email?: string;
    eventType?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) => {
    try {
      let query = supabase
        .from('auth_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.email) {
        query = query.eq('email', filters.email);
      }

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[EnhancedAuditService] Error getting audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[EnhancedAuditService] Error in getAuditLogs:', error);
      return [];
    }
  };

  return {
    logEvent,
    logLoginSuccess,
    logLoginFailure,
    logRoleChange,
    logPasswordChange,
    logSubscriptionEvent,
    logSuspiciousActivity,
    getAuditLogs,
    getRecentFailedLogins
  };
};

// Export singleton instance
export const enhancedAuditService = createEnhancedAuditService(); 
