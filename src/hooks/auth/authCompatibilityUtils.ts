import { supabase } from '@/integrations/supabase/client';

export interface AuthCompatibilityReport {
  sdkVersion: string;
  availableMethods: string[];
  missingMethods: string[];
  recommendations: string[];
  isCompatible: boolean;
}

export const checkAuthCompatibility = (): AuthCompatibilityReport => {
  console.log('🔍 Checking Supabase Auth compatibility...');
  
  const availableMethods = Object.keys(supabase.auth);
  const expectedMethods = [
    'getSession',
    'getSessionFromUrl',
    'getUser',
    'onAuthStateChange',
    'signInWithPassword',
    'signOut',
    'updateUser',
    'verifyOtp',
    'setSession',
    'refreshSession',
  ];
  
  const missingMethods = expectedMethods.filter(method => !availableMethods.includes(method));
  const recommendations: string[] = [];
  
  // Verificar versão do SDK
  let sdkVersion = 'unknown';
  try {
    // Tentar diferentes formas de obter a versão
    if (typeof supabase.version === 'string') {
      sdkVersion = supabase.version;
    } else if (typeof supabase.auth.version === 'string') {
      sdkVersion = supabase.auth.version;
    } else {
      // Inferir versão baseada nos métodos disponíveis
      if (availableMethods.includes('getSessionFromUrl')) {
        sdkVersion = '2.x (inferred)';
      } else if (availableMethods.includes('session')) {
        sdkVersion = '1.x (inferred)';
      }
    }
  } catch (error) {
    console.log('Could not determine SDK version:', error);
  }
  
  // Gerar recomendações baseadas nos métodos ausentes
  if (missingMethods.includes('getSessionFromUrl')) {
    recommendations.push('Consider upgrading to Supabase JS SDK 2.x for better URL handling');
  }
  
  if (missingMethods.includes('setSession')) {
    recommendations.push('setSession method not available - manual token handling may be limited');
  }
  
  if (missingMethods.length > 5) {
    recommendations.push('Many methods are missing - consider updating the SDK version');
  }
  
  const isCompatible = missingMethods.length < 3;
  
  const report: AuthCompatibilityReport = {
    sdkVersion,
    availableMethods,
    missingMethods,
    recommendations,
    isCompatible,
  };
  
  console.log('📊 Auth Compatibility Report:', report);
  
  return report;
};

export const logAuthEnvironment = () => {
  console.group('🔧 Supabase Auth Environment');
  
  try {
    console.log('Client Info:', {
      hasSupabase: typeof supabase !== 'undefined',
      hasAuth: typeof supabase?.auth !== 'undefined',
      authType: typeof supabase?.auth,
      clientType: typeof supabase,
    });
    
    console.log('Environment:', {
      mode: import.meta.env.MODE,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      userAgent: navigator.userAgent,
      location: window.location.href,
    });
    
    console.log('Auth Methods:', Object.keys(supabase.auth));
    
    // Testar métodos críticos
    const methodTests = {
      getSession: typeof supabase.auth.getSession === 'function',
      getSessionFromUrl: typeof supabase.auth.getSessionFromUrl === 'function',
      getUser: typeof supabase.auth.getUser === 'function',
      verifyOtp: typeof supabase.auth.verifyOtp === 'function',
      setSession: typeof supabase.auth.setSession === 'function',
      onAuthStateChange: typeof supabase.auth.onAuthStateChange === 'function',
    };
    
    console.log('Method Tests:', methodTests);
    
    // Executar relatório de compatibilidade
    const compatibilityReport = checkAuthCompatibility();
    console.log('Compatibility Report:', compatibilityReport);
    
  } catch (error) {
    console.error('Error during auth environment logging:', error);
  }
  
  console.groupEnd();
};

export const debugAuthError = (error: any, context: string) => {
  console.group(`❌ Auth Error Debug - ${context}`);
  
  console.log('Error Details:', {
    message: error?.message,
    name: error?.name,
    code: error?.code,
    status: error?.status,
    stack: error?.stack,
    timestamp: new Date().toISOString(),
  });
  
  console.log('Context:', context);
  
  // Verificar se é um erro de método não encontrado
  if (error?.message?.includes('is not a function')) {
    console.log('🔍 Method Not Found Error Detected');
    console.log('Available methods:', Object.keys(supabase.auth));
    
    const methodName = error.message.match(/(\w+) is not a function/)?.[1];
    if (methodName) {
      console.log(`Missing method: ${methodName}`);
      console.log('Compatibility report:', checkAuthCompatibility());
    }
  }
  
  // Verificar se é um erro de token/sessão
  if (error?.message?.includes('token') || error?.message?.includes('session')) {
    console.log('🔐 Token/Session Error Detected');
    console.log('Current URL:', window.location.href);
    console.log('Hash:', window.location.hash);
    console.log('Search params:', window.location.search);
  }
  
  console.groupEnd();
};

export const testAuthMethods = async () => {
  console.group('🧪 Testing Auth Methods');
  
  const tests = [
    {
      name: 'getSession',
      test: async () => {
        if (typeof supabase.auth.getSession === 'function') {
          const result = await supabase.auth.getSession();
          return { success: true, hasSession: !!result.data?.session };
        }
        return { success: false, error: 'Method not available' };
      },
    },
    {
      name: 'getUser',
      test: async () => {
        if (typeof supabase.auth.getUser === 'function') {
          const result = await supabase.auth.getUser();
          return { success: true, hasUser: !!result.data?.user };
        }
        return { success: false, error: 'Method not available' };
      },
    },
    {
      name: 'getSessionFromUrl',
      test: async () => {
        if (typeof supabase.auth.getSessionFromUrl === 'function') {
          try {
            const result = await supabase.auth.getSessionFromUrl();
            return { success: true, hasSession: !!result.data?.session };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Method not available' };
      },
    },
  ];
  
  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const result = await test.test();
      console.log(`✅ ${test.name}:`, result);
    } catch (error) {
      console.log(`❌ ${test.name}:`, error);
    }
  }
  
  console.groupEnd();
}; 