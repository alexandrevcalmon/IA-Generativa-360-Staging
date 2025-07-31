#!/usr/bin/env node

/**
 * Script simples para verificar se as URLs foram atualizadas para produção
 */

import fs from 'fs';

console.log('🔍 Verificando URLs de produção...\n');

// Verificar templates de email
console.log('📁 Templates de email:');
const templateFiles = [
  'supabase/templates/recovery-outlook-final.html',
  'supabase/templates/invite-outlook-final.html',
  'supabase/templates/confirm-email-outlook-final.html',
  'supabase/templates/change-password-outlook-final.html'
];

templateFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('https://academy.grupocalmon.com')) {
      console.log(`✅ ${file}`);
    } else if (content.includes('https://staging.grupocalmon.com')) {
      console.log(`❌ ${file} - Ainda contém staging`);
    } else {
      console.log(`⚠️ ${file} - Não encontrou URLs específicas`);
    }
  } catch (error) {
    console.log(`❌ Erro ao ler ${file}`);
  }
});

// Verificar Edge Functions
console.log('\n🔧 Edge Functions:');
const edgeFunctionFiles = [
  'supabase/functions/create-stripe-checkout/index.ts',
  'supabase/functions/create-company-auth-user/index.ts'
];

edgeFunctionFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('https://academy.grupocalmon.com')) {
      console.log(`✅ ${file}`);
    } else if (content.includes('https://staging.grupocalmon.com')) {
      console.log(`❌ ${file} - Ainda contém staging`);
    } else {
      console.log(`⚠️ ${file} - Não encontrou URLs específicas`);
    }
  } catch (error) {
    console.log(`❌ Erro ao ler ${file}`);
  }
});

// Verificar scripts de teste
console.log('\n🧪 Scripts de teste:');
const testScriptFiles = [
  'scripts/test-outlook-buttons.js',
  'scripts/test-outlook-final-templates.js',
  'scripts/test-outlook-fixed-templates.js',
  'scripts/test-outlook-templates.js',
  'scripts/test-email-templates.js'
];

testScriptFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('https://academy.grupocalmon.com')) {
      console.log(`✅ ${file}`);
    } else if (content.includes('https://staging.grupocalmon.com')) {
      console.log(`❌ ${file} - Ainda contém staging`);
    } else {
      console.log(`⚠️ ${file} - Não encontrou URLs específicas`);
    }
  } catch (error) {
    console.log(`❌ Erro ao ler ${file}`);
  }
});

// Verificar arquivos de configuração
console.log('\n⚙️ Arquivos de configuração:');
const configFiles = [
  'README.md',
  'check-supabase-auth-config.js',
  'check-env-variables.js'
];

configFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('https://academy.grupocalmon.com')) {
      console.log(`✅ ${file}`);
    } else if (content.includes('https://staging.grupocalmon.com')) {
      console.log(`❌ ${file} - Ainda contém staging`);
    } else {
      console.log(`⚠️ ${file} - Não encontrou URLs específicas`);
    }
  } catch (error) {
    console.log(`❌ Erro ao ler ${file}`);
  }
});

// Verificar documentação
console.log('\n📚 Documentação:');
const docFiles = [
  'docs/configuracao-templates-email-supabase.md',
  'docs/configuracao-templates-outlook.md',
  'docs/solucao-problema-link-invalido.md'
];

docFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('https://academy.grupocalmon.com')) {
      console.log(`✅ ${file}`);
    } else if (content.includes('https://staging.grupocalmon.com')) {
      console.log(`❌ ${file} - Ainda contém staging`);
    } else {
      console.log(`⚠️ ${file} - Não encontrou URLs específicas`);
    }
  } catch (error) {
    console.log(`❌ Erro ao ler ${file}`);
  }
});

console.log('\n🎉 Verificação concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. ✅ Certifique-se de que o arquivo .env está configurado corretamente');
console.log('2. ✅ Faça o deploy das Edge Functions no Supabase');
console.log('3. ✅ Configure o domínio academy.grupocalmon.com no seu servidor');
console.log('4. ✅ Configure SSL/HTTPS para o domínio');
console.log('5. ✅ Teste o fluxo completo de autenticação'); 