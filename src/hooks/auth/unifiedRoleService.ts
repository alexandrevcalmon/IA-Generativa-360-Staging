import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface RoleData {
  role: string;
  needsPasswordChange: boolean;
  companyData?: any;
  collaboratorData?: any;
  producerData?: any;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
}

interface RoleCache {
  [userId: string]: {
    data: RoleData;
    timestamp: number;
  };
}

export const createUnifiedRoleService = () => {
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  const roleCache: RoleCache = {};

  const clearCache = (userId?: string) => {
    if (userId) {
      delete roleCache[userId];
    } else {
      Object.keys(roleCache).forEach(key => delete roleCache[key]);
    }
  };

  const getCachedRole = (userId: string): RoleData | null => {
    const cached = roleCache[userId];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  };

  const setCachedRole = (userId: string, data: RoleData) => {
    roleCache[userId] = {
      data,
      timestamp: Date.now()
    };
  };

  const determineUserRole = async (user: User): Promise<RoleData> => {
    const userId = user.id;
    
    // Check cache first
    const cached = getCachedRole(userId);
    if (cached) {
      console.log(`[UnifiedRoleService] Using cached role for ${user.email}: ${cached.role}`);
      return cached;
    }

    console.log(`[UnifiedRoleService] Determining role for user: ${user.email}`);
    
    try {
      // 1ª Prioridade: Verificar se é Producer
      const { data: producerData, error: producerError } = await supabase
        .from('producers')
        .select('*')
        .eq('auth_user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (!producerError && producerData) {
        console.log(`[UnifiedRoleService] User is a producer: ${user.email}`);
        
        // Ensure profile consistency
        await supabase.from('profiles').upsert({
          id: userId,
          role: 'producer',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        const roleData: RoleData = {
          role: 'producer',
          needsPasswordChange: false,
          producerData
        };

        setCachedRole(userId, roleData);
        return roleData;
      }

      // 2ª Prioridade: Verificar se é Company Owner
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select(`
          *,
          subscription_plans:subscription_plan_id (
            name,
            max_collaborators,
            subscription_period_days
          )
        `)
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (!companyError && companyData) {
        console.log(`[UnifiedRoleService] User is a company owner: ${companyData.name}`);
        
        // Check subscription status
        const isSubscriptionActive = companyData.subscription_status === 'active' || 
                                   companyData.subscription_status === 'trialing';
        const isNotExpired = !companyData.subscription_ends_at || 
                           new Date(companyData.subscription_ends_at) > new Date();

        // Ensure profile consistency
        await supabase.from('profiles').upsert({
          id: userId,
          role: 'company',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        const roleData: RoleData = {
          role: 'company',
          needsPasswordChange: companyData.needs_password_change || false,
          companyData: {
            ...companyData,
            isSubscriptionActive: isSubscriptionActive && isNotExpired
          },
          subscriptionStatus: companyData.subscription_status,
          subscriptionExpiresAt: companyData.subscription_ends_at
        };

        setCachedRole(userId, roleData);
        return roleData;
      }

      // 3ª Prioridade: Verificar se é Collaborator
      const { data: collaboratorData, error: collaboratorError } = await supabase
        .from('company_users')
        .select(`
          *,
          companies!company_users_company_id_fkey (
            id,
            name,
            subscription_status,
            subscription_ends_at,
            max_collaborators
          )
        `)
        .eq('auth_user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (!collaboratorError && collaboratorData) {
        console.log(`[UnifiedRoleService] User is a collaborator: ${user.email}`);
        
        // Check if company subscription is active
        const company = collaboratorData.companies;
        const isCompanyActive = company && 
                              (company.subscription_status === 'active' || company.subscription_status === 'trialing') &&
                              (!company.subscription_ends_at || new Date(company.subscription_ends_at) > new Date());

        // Ensure profile consistency
        await supabase.from('profiles').upsert({
          id: userId,
          role: 'collaborator',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

        const roleData: RoleData = {
          role: 'collaborator',
          needsPasswordChange: collaboratorData.needs_password_change || false,
          collaboratorData: {
            ...collaboratorData,
            isCompanyActive
          }
        };

        setCachedRole(userId, roleData);
        return roleData;
      }

      // 4ª Prioridade: Verificar tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (!profileError && profileData?.role && profileData.role !== 'student') {
        console.log(`[UnifiedRoleService] Found role in profiles: ${profileData.role}`);
        
        const roleData: RoleData = {
          role: profileData.role,
          needsPasswordChange: false
        };

        setCachedRole(userId, roleData);
        return roleData;
      }

      // Padrão: Student
      console.log(`[UnifiedRoleService] Defaulting to student role for: ${user.email}`);
      
      // Ensure profile exists
      await supabase.from('profiles').upsert({
        id: userId,
        role: 'student',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      const roleData: RoleData = {
        role: 'student',
        needsPasswordChange: false
      };

      setCachedRole(userId, roleData);
      return roleData;

    } catch (error) {
      console.error(`[UnifiedRoleService] Error determining role for ${user.email}:`, error);
      
      // Return safe default
      const roleData: RoleData = {
        role: 'student',
        needsPasswordChange: false
      };

      setCachedRole(userId, roleData);
      return roleData;
    }
  };

  const refreshUserRole = async (user: User): Promise<RoleData> => {
    clearCache(user.id);
    return await determineUserRole(user);
  };

  const checkSubscriptionStatus = async (userId: string): Promise<{
    isActive: boolean;
    status: string;
    expiresAt?: string;
  }> => {
    try {
      const { data: companyData } = await supabase
        .from('companies')
        .select('subscription_status, subscription_ends_at')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (!companyData) {
        return { isActive: false, status: 'no_subscription' };
      }

      const isActive = (companyData.subscription_status === 'active' || 
                       companyData.subscription_status === 'trialing') &&
                      (!companyData.subscription_ends_at || 
                       new Date(companyData.subscription_ends_at) > new Date());

      return {
        isActive,
        status: companyData.subscription_status,
        expiresAt: companyData.subscription_ends_at
      };
    } catch (error) {
      console.error('[UnifiedRoleService] Error checking subscription status:', error);
      return { isActive: false, status: 'error' };
    }
  };

  return {
    determineUserRole,
    refreshUserRole,
    checkSubscriptionStatus,
    clearCache
  };
};

// Export singleton instance
export const unifiedRoleService = createUnifiedRoleService(); 
