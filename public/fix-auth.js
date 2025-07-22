/**
 * Script para corrigir problemas de autenticação
 * Execute no console do navegador para resolver o problema de login
 */

(function() {
  console.log('🔧 Iniciando correção de autenticação...');
  
  // Limpar todos os dados do localStorage relacionados ao Supabase
  const keys = Object.keys(localStorage);
  let removedCount = 0;
  
  keys.forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
      console.log(`🗑️ Removendo: ${key}`);
      localStorage.removeItem(key);
      removedCount++;
    }
  });
  
  // Limpar sessionStorage
  sessionStorage.clear();
  
  console.log(`✅ Sessão limpa! ${removedCount} itens removidos.`);
  console.log('🔄 Redirecionando para página de login...');
  
  // Redirecionar para a página de login
  setTimeout(() => {
    window.location.href = '/auth';
  }, 1000);
})();