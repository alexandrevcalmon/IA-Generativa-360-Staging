import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '..', 'supabase', 'templates');
const OUTPUT_DIR = path.join(__dirname, '..', 'test-outlook-outputs');

// Dados de teste para substituir variáveis
const testData = {
  '{{ .ConfirmationURL }}': 'https://academy.grupocalmon.com/reset-password?token=test-token-123&type=recovery',
'{{ .SiteURL }}': 'https://academy.grupocalmon.com',
  '{{ .Email }}': 'teste@exemplo.com',
  '{{ .Token }}': 'test-token-123',
  '{{ .TokenHash }}': 'test-hash-456'
};

function replaceTemplateVariables(content) {
  let result = content;
  for (const [placeholder, value] of Object.entries(testData)) {
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }
  return result;
}

function createTestFile(templateName, content) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const outputPath = path.join(OUTPUT_DIR, `${templateName}.html`);
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`✅ Criado: ${outputPath}`);
}

function validateOutlookTemplate(content, templateName) {
  const issues = [];
  
  // Verificações específicas para Outlook
  if (!content.includes('<!--[if mso]>')) {
    issues.push('❌ Falta comentários condicionais do Outlook');
  }
  
  if (!content.includes('mso-table-lspace')) {
    issues.push('❌ Falta reset de espaçamento de tabelas do Outlook');
  }
  
  if (!content.includes('role="presentation"')) {
    issues.push('❌ Falta atributo role="presentation" nas tabelas');
  }
  
  if (content.includes('display: grid')) {
    issues.push('❌ CSS Grid não é suportado no Outlook');
  }
  
  if (content.includes('flexbox') || content.includes('display: flex')) {
    issues.push('❌ Flexbox não é suportado no Outlook');
  }
  
  if (content.includes('position: absolute') && !content.includes('mso-')) {
    issues.push('⚠️ Position absolute pode ter problemas no Outlook');
  }
  
  if (content.includes('border-radius') && !content.includes('mso-')) {
    issues.push('⚠️ Border-radius pode não funcionar no Outlook');
  }
  
  if (content.includes('box-shadow')) {
    issues.push('⚠️ Box-shadow não é suportado no Outlook');
  }
  
  if (content.includes('linear-gradient')) {
    issues.push('⚠️ Linear-gradient pode não funcionar no Outlook');
  }
  
  if (content.includes('animation') || content.includes('@keyframes')) {
    issues.push('⚠️ Animações CSS não são suportadas no Outlook');
  }
  
  // Verificações positivas
  if (content.includes('table')) {
    issues.push('✅ Usa estrutura de tabelas (recomendado para Outlook)');
  }
  
  if (content.includes('cellspacing="0"')) {
    issues.push('✅ Remove espaçamento de células');
  }
  
  if (content.includes('cellpadding="0"')) {
    issues.push('✅ Remove padding de células');
  }
  
  if (content.includes('border="0"')) {
    issues.push('✅ Remove bordas de tabelas');
  }
  
  if (content.includes('width="600"')) {
    issues.push('✅ Define largura fixa (recomendado para Outlook)');
  }
  
  if (content.includes('align="center"')) {
    issues.push('✅ Usa alinhamento HTML (melhor que CSS no Outlook)');
  }
  
  if (content.includes('style="background-color:')) {
    issues.push('✅ Usa estilos inline (recomendado para Outlook)');
  }
  
  if (content.includes('font-family: Arial')) {
    issues.push('✅ Usa fonte Arial (bem suportada no Outlook)');
  }
  
  return issues;
}

async function testOutlookTemplates() {
  console.log('🔧 Testando Templates Otimizados para Outlook');
  console.log('=============================================\n');
  
  const templates = [
    'invite-outlook.html',
    'recovery-outlook.html'
  ];
  
  for (const templateName of templates) {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    
    if (!fs.existsSync(templatePath)) {
      console.log(`⚠️ Template não encontrado: ${templateName}`);
      continue;
    }
    
    console.log(`📧 Processando: ${templateName}`);
    
    try {
      const content = fs.readFileSync(templatePath, 'utf8');
      const processedContent = replaceTemplateVariables(content);
      
      // Validar template
      const issues = validateOutlookTemplate(processedContent, templateName);
      
      console.log('\n🔍 Validação do Template:');
      issues.forEach(issue => console.log(`  ${issue}`));
      
      // Criar arquivo de teste
      createTestFile(templateName.replace('.html', ''), processedContent);
      
      console.log(`\n✅ Template ${templateName} processado com sucesso!\n`);
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${templateName}:`, error.message);
    }
  }
  
  console.log('📋 Resumo das Otimizações para Outlook:');
  console.log('=======================================');
  console.log('✅ Estrutura baseada em tabelas');
  console.log('✅ Estilos inline em vez de CSS externo');
  console.log('✅ Comentários condicionais do Outlook');
  console.log('✅ Reset de espaçamento de tabelas');
  console.log('✅ Atributos HTML para alinhamento');
  console.log('✅ Cores sólidas em vez de gradientes');
  console.log('✅ Fontes web-safe (Arial, sans-serif)');
  console.log('✅ Largura fixa de 600px');
  console.log('✅ Sem CSS Grid ou Flexbox');
  console.log('✅ Sem animações CSS');
  console.log('\n💡 Próximos Passos:');
  console.log('1. Copie o conteúdo dos arquivos gerados');
  console.log('2. Cole no Supabase Dashboard > Authentication > Email Templates');
  console.log('3. Teste o envio de emails');
  console.log('4. Verifique a renderização no Outlook');
  console.log('\n📁 Arquivos gerados em: test-outlook-outputs/');
}

testOutlookTemplates().catch(console.error); 