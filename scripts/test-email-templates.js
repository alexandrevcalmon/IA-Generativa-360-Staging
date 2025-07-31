#!/usr/bin/env node

/**
 * Script para testar e validar os novos templates de email da Calmon Academy
 * Este script gera versões de teste dos templates com dados simulados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const TEMPLATES_DIR = path.join(__dirname, '../supabase/templates');
const OUTPUT_DIR = path.join(__dirname, '../test-email-outputs');

// Dados simulados para teste
const testData = {
  '.ConfirmationURL': 'https://academy.grupocalmon.com/activate-account?token=test-token-123&type=invite',
'.SiteURL': 'https://academy.grupocalmon.com',
  '.Timestamp': new Date().toLocaleString('pt-BR'),
  '.IPAddress': '192.168.1.100',
  '.UserAgent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

// Função para substituir variáveis nos templates
function replaceTemplateVariables(content) {
  let processedContent = content;
  
  Object.entries(testData).forEach(([variable, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'g');
    processedContent = processedContent.replace(regex, value);
  });
  
  return processedContent;
}

// Função para criar arquivo HTML de teste
function createTestFile(templateName, content) {
  const outputPath = path.join(OUTPUT_DIR, `${templateName}-test.html`);
  
  // Criar diretório se não existir
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, content);
  return outputPath;
}

// Função para validar template
function validateTemplate(content, templateName) {
  const issues = [];
  
  // Verificar se tem DOCTYPE
  if (!content.includes('<!DOCTYPE html>')) {
    issues.push('❌ Falta DOCTYPE HTML');
  }
  
  // Verificar se tem meta viewport
  if (!content.includes('viewport')) {
    issues.push('❌ Falta meta viewport para responsividade');
  }
  
  // Verificar se tem charset UTF-8
  if (!content.includes('charset="UTF-8"')) {
    issues.push('❌ Falta charset UTF-8');
  }
  
  // Verificar se tem CSS inline
  if (!content.includes('<style>')) {
    issues.push('❌ Falta CSS inline');
  }
  
  // Verificar se tem botão CTA
  if (!content.includes('cta-button') && !content.includes('action-button')) {
    issues.push('❌ Falta botão de call-to-action');
  }
  
  // Verificar se tem footer
  if (!content.includes('footer')) {
    issues.push('❌ Falta seção footer');
  }
  
  // Verificar responsividade
  if (!content.includes('@media')) {
    issues.push('❌ Falta CSS responsivo');
  }
  
  // Verificar se tem logo/identidade visual
  if (!content.includes('CA') && !content.includes('Calmon Academy')) {
    issues.push('❌ Falta identidade visual da Calmon Academy');
  }
  
  // Verificar se tem gradientes
  if (!content.includes('linear-gradient')) {
    issues.push('❌ Falta gradientes modernos');
  }
  
  // Verificar se tem animações
  if (!content.includes('@keyframes')) {
    issues.push('❌ Falta animações CSS');
  }
  
  return issues;
}

// Função principal
async function testEmailTemplates() {
  console.log('🎨 Testando Templates de Email da Calmon Academy\n');
  
  // Listar todos os templates
  const templateFiles = fs.readdirSync(TEMPLATES_DIR)
    .filter(file => file.endsWith('.html'))
    .sort();
  
  console.log(`📧 Encontrados ${templateFiles.length} templates:\n`);
  
  let totalIssues = 0;
  const results = [];
  
  for (const templateFile of templateFiles) {
    console.log(`🔍 Testando: ${templateFile}`);
    
    const templatePath = path.join(TEMPLATES_DIR, templateFile);
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Substituir variáveis
    const processedContent = replaceTemplateVariables(templateContent);
    
    // Validar template
    const issues = validateTemplate(processedContent, templateFile);
    
    // Criar arquivo de teste
    const testFilePath = createTestFile(templateFile.replace('.html', ''), processedContent);
    
    // Resultados
    const templateName = templateFile.replace('.html', '');
    const status = issues.length === 0 ? '✅' : '⚠️';
    
    console.log(`   ${status} ${templateName}`);
    
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`      ${issue}`));
      totalIssues += issues.length;
    } else {
      console.log(`      ✅ Template válido`);
    }
    
    console.log(`      📄 Teste salvo em: ${testFilePath}\n`);
    
    results.push({
      template: templateName,
      issues,
      testFile: testFilePath,
      status: issues.length === 0 ? 'PASS' : 'FAIL'
    });
  }
  
  // Resumo
  console.log('📊 Resumo dos Testes:\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`✅ Templates válidos: ${passed}/${templateFiles.length}`);
  console.log(`❌ Templates com problemas: ${failed}/${templateFiles.length}`);
  console.log(`🔧 Total de problemas encontrados: ${totalIssues}\n`);
  
  // Listar arquivos de teste criados
  console.log('📁 Arquivos de teste criados:');
  results.forEach(result => {
    console.log(`   ${result.status === 'PASS' ? '✅' : '⚠️'} ${path.basename(result.testFile)}`);
  });
  
  console.log(`\n🌐 Para visualizar os templates, abra os arquivos HTML no navegador:`);
  console.log(`   ${OUTPUT_DIR}\n`);
  
  // Instruções para teste manual
  console.log('📋 Instruções para teste manual:');
  console.log('1. Abra os arquivos HTML gerados no navegador');
  console.log('2. Teste a responsividade redimensionando a janela');
  console.log('3. Verifique se os links funcionam corretamente');
  console.log('4. Teste em diferentes clientes de email (Gmail, Outlook, etc.)');
  console.log('5. Verifique se as animações funcionam');
  console.log('6. Confirme se o design está alinhado com a identidade visual\n');
  
  // Verificar se há problemas críticos
  if (totalIssues > 0) {
    console.log('⚠️  ATENÇÃO: Alguns templates têm problemas que devem ser corrigidos antes do deploy.');
    process.exit(1);
  } else {
    console.log('🎉 Todos os templates estão prontos para produção!');
  }
}

// Executar testes
testEmailTemplates().catch(error => {
  console.error('❌ Erro durante os testes:', error);
  process.exit(1);
}); 