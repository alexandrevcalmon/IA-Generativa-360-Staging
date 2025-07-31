import fs from 'fs';
import path from 'path';

// Configurações
const TEMPLATES_DIR = 'supabase/templates';
const OUTPUT_DIR = 'test-outlook-fixed-outputs';

// Dados de teste
const testData = {
  '{{ .ConfirmationURL }}': 'https://academy.grupocalmon.com/reset-password?token=test123&type=recovery',
  '{{ .Email }}': 'usuario@exemplo.com',
  '{{ .Token }}': 'test-token-123',
  '{{ .TokenHash }}': 'test-hash-456'
};

// Função para substituir variáveis nos templates
function replaceTemplateVariables(content) {
  let result = content;
  for (const [key, value] of Object.entries(testData)) {
    result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }
  return result;
}

// Função para criar arquivo de teste
function createTestFile(templateName, content) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const outputPath = path.join(OUTPUT_DIR, templateName);
  fs.writeFileSync(outputPath, content);
  console.log(`✅ Arquivo criado: ${outputPath}`);
}

// Função para validar template corrigido para Outlook
function validateFixedOutlookTemplate(content, templateName) {
  const issues = [];
  const warnings = [];
  const positives = [];
  
  console.log(`\n🔍 Validando ${templateName}...`);
  
  // Verificações específicas para Outlook corrigido
  if (!content.includes('width: 600px !important')) { 
    issues.push('❌ Falta largura fixa do container (600px)'); 
  } else {
    positives.push('✅ Largura fixa do container definida');
  }
  
  if (!content.includes('height: 120px !important')) { 
    issues.push('❌ Falta altura fixa do header (120px)'); 
  } else {
    positives.push('✅ Altura fixa do header definida');
  }
  
  if (!content.includes('box-sizing: border-box !important')) { 
    warnings.push('⚠️ Box-sizing pode não estar aplicado em todos os elementos'); 
  } else {
    positives.push('✅ Box-sizing aplicado');
  }
  
  if (!content.includes('width: 200px !important')) { 
    issues.push('❌ Falta largura fixa do botão CTA'); 
  } else {
    positives.push('✅ Largura fixa do botão CTA definida');
  }
  
  if (!content.includes('!important')) { 
    warnings.push('⚠️ Poucos estilos com !important podem causar problemas'); 
  } else {
    positives.push('✅ Estilos com !important aplicados');
  }
  
  // Verificações de estrutura
  if (!content.includes('table role="presentation"')) { 
    issues.push('❌ Falta estrutura de tabelas para Outlook'); 
  } else {
    positives.push('✅ Estrutura de tabelas presente');
  }
  
  if (!content.includes('mso-table-lspace')) { 
    issues.push('❌ Falta reset de espaçamento de tabelas do Outlook'); 
  } else {
    positives.push('✅ Reset de espaçamento de tabelas aplicado');
  }
  
  if (!content.includes('<!--[if mso]>')) { 
    issues.push('❌ Falta comentários condicionais do Outlook'); 
  } else {
    positives.push('✅ Comentários condicionais do Outlook presentes');
  }
  
  // Verificações de elementos problemáticos removidos
  if (content.includes('display: grid')) { 
    issues.push('❌ CSS Grid ainda presente (não suportado no Outlook)'); 
  } else {
    positives.push('✅ CSS Grid removido');
  }
  
  if (content.includes('flexbox') || content.includes('display: flex')) { 
    issues.push('❌ Flexbox ainda presente (não suportado no Outlook)'); 
  } else {
    positives.push('✅ Flexbox removido');
  }
  
  if (content.includes('animation') || content.includes('@keyframes')) { 
    issues.push('❌ Animações CSS ainda presentes (não suportadas no Outlook)'); 
  } else {
    positives.push('✅ Animações CSS removidas');
  }
  
  if (content.includes('box-shadow')) { 
    warnings.push('⚠️ Box-shadow ainda presente (pode não funcionar no Outlook)'); 
  } else {
    positives.push('✅ Box-shadow removido');
  }
  
  if (content.includes('linear-gradient')) { 
    warnings.push('⚠️ Linear-gradient ainda presente (pode não funcionar no Outlook)'); 
  } else {
    positives.push('✅ Linear-gradient removido');
  }
  
  // Verificações de responsividade
  if (!content.includes('@media only screen and (max-width: 600px)')) { 
    warnings.push('⚠️ Media queries podem não funcionar no Outlook'); 
  } else {
    positives.push('✅ Media queries presentes');
  }
  
  // Verificações de elementos essenciais
  if (!content.includes('Calmon Academy')) { 
    issues.push('❌ Falta branding da Calmon Academy'); 
  } else {
    positives.push('✅ Branding presente');
  }
  
  if (!content.includes('{{ .ConfirmationURL }}')) { 
    issues.push('❌ Falta variável de confirmação'); 
  } else {
    positives.push('✅ Variável de confirmação presente');
  }
  
  return { issues, warnings, positives };
}

// Função principal
function testFixedOutlookTemplates() {
  console.log('🧪 Testando Templates Corrigidos para Outlook');
  console.log('==============================================\n');
  
  const templates = [
    'invite-outlook-fixed.html',
    'recovery-outlook-fixed.html'
  ];
  
  let totalIssues = 0;
  let totalWarnings = 0;
  
  templates.forEach(templateName => {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    
    if (!fs.existsSync(templatePath)) {
      console.log(`❌ Template não encontrado: ${templatePath}`);
      return;
    }
    
    try {
      const content = fs.readFileSync(templatePath, 'utf8');
      const processedContent = replaceTemplateVariables(content);
      
      const { issues, warnings, positives } = validateFixedOutlookTemplate(content, templateName);
      
      // Exibir resultados
      if (positives.length > 0) {
        console.log('\n✅ Pontos Positivos:');
        positives.forEach(positive => console.log(`   ${positive}`));
      }
      
      if (warnings.length > 0) {
        console.log('\n⚠️ Avisos:');
        warnings.forEach(warning => console.log(`   ${warning}`));
        totalWarnings += warnings.length;
      }
      
      if (issues.length > 0) {
        console.log('\n❌ Problemas:');
        issues.forEach(issue => console.log(`   ${issue}`));
        totalIssues += issues.length;
      }
      
      // Criar arquivo de teste
      createTestFile(templateName, processedContent);
      
      // Resumo do template
      console.log(`\n📊 Resumo de ${templateName}:`);
      console.log(`   ✅ Pontos positivos: ${positives.length}`);
      console.log(`   ⚠️ Avisos: ${warnings.length}`);
      console.log(`   ❌ Problemas: ${issues.length}`);
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${templateName}:`, error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  });
  
  // Resumo geral
  console.log('📊 RESUMO GERAL');
  console.log('===============');
  console.log(`✅ Templates processados: ${templates.length}`);
  console.log(`⚠️ Total de avisos: ${totalWarnings}`);
  console.log(`❌ Total de problemas: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n🎉 Todos os templates estão prontos para uso no Outlook!');
  } else {
    console.log('\n⚠️ Alguns problemas foram encontrados. Verifique antes de usar.');
  }
  
  console.log('\n💡 Próximos Passos:');
  console.log('1. Teste os templates no Outlook');
  console.log('2. Verifique se o banner não muda de tamanho');
  console.log('3. Confirme se todos os elementos estão alinhados');
  console.log('4. Teste em diferentes versões do Outlook');
}

// Executar teste
testFixedOutlookTemplates(); 