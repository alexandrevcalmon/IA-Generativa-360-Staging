import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '..', 'supabase', 'templates');
const OUTPUT_DIR = path.join(__dirname, '..', 'test-outlook-final-outputs');

// Dados de teste para substituir as variáveis
const testData = {
    '{{ .ConfirmationURL }}': 'https://academy.grupocalmon.com/reset-password?token=test-token-123&type=recovery'
};

// Função para substituir variáveis no template
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
    
    const outputPath = path.join(OUTPUT_DIR, `${templateName}.html`);
    fs.writeFileSync(outputPath, content);
    console.log(`✅ Arquivo de teste criado: ${outputPath}`);
}

// Função para validar template final do Outlook
function validateFinalOutlookTemplate(content, templateName) {
    console.log(`\n🔍 Validando template: ${templateName}`);
    
    const checks = [
        { name: 'DOCTYPE HTML', check: content.includes('<!DOCTYPE html>'), required: true },
        { name: 'Meta charset', check: content.includes('<meta charset="UTF-8">'), required: true },
        { name: 'Meta viewport', check: content.includes('viewport'), required: true },
        { name: 'MSO comments', check: content.includes('<!--[if mso]>'), required: true },
        { name: 'Table structure', check: content.includes('<table role="presentation"'), required: true },
        { name: 'Inline styles', check: content.includes('style="'), required: true },
        { name: 'Logo image', check: content.includes('Logomarca%20Calmon%20Academy.png'), required: true },
        { name: 'CTA button', check: content.includes('cta-button'), required: true },
        { name: 'VML button (Outlook)', check: content.includes('v:roundrect'), required: true },
        { name: 'MSO hide', check: content.includes('mso-hide:all'), required: true },
        { name: 'Responsive media queries', check: content.includes('@media only screen'), required: true },
        { name: 'Footer links', check: content.includes('footer-link'), required: true },
        { name: 'Security note', check: content.includes('security-cell'), required: true },
        { name: 'Steps section', check: content.includes('steps-cell'), required: true },
        { name: 'Benefits section', check: content.includes('benefit-cell'), required: true },
        { name: 'Golden color theme', check: content.includes('#d49c3d'), required: true },
        { name: 'Dark footer', check: content.includes('#333333'), required: true },
        { name: 'Arial font family', check: content.includes('Arial, Helvetica, sans-serif'), required: true },
        { name: 'Fixed width container', check: content.includes('width: 600'), required: true },
        { name: 'MSO specific styles', check: content.includes('mso-style-priority'), required: true }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of checks) {
        if (check.check) {
            console.log(`✅ ${check.name}`);
            passed++;
        } else {
            console.log(`❌ ${check.name} ${check.required ? '(OBRIGATÓRIO)' : '(OPCIONAL)'}`);
            failed++;
        }
    }
    
    console.log(`\n📊 Resultado: ${passed}/${checks.length} verificações passaram`);
    
    if (failed > 0) {
        console.log(`⚠️  ${failed} verificações falharam`);
    } else {
        console.log(`🎉 Template ${templateName} está pronto para uso!`);
    }
    
    return failed === 0;
}

// Função principal para testar templates
async function testFinalOutlookTemplates() {
    console.log('🚀 Testando templates finais do Outlook...\n');
    
    const templates = [
        'invite-outlook-final.html',
        'recovery-outlook-final.html',
        'confirm-email-outlook-final.html',
        'change-password-outlook-final.html'
    ];
    
    let allValid = true;
    
    for (const templateName of templates) {
        const templatePath = path.join(TEMPLATES_DIR, templateName);
        
        if (!fs.existsSync(templatePath)) {
            console.log(`❌ Template não encontrado: ${templateName}`);
            allValid = false;
            continue;
        }
        
        try {
            const content = fs.readFileSync(templatePath, 'utf8');
            const processedContent = replaceTemplateVariables(content);
            
            const isValid = validateFinalOutlookTemplate(processedContent, templateName);
            if (!isValid) {
                allValid = false;
            }
            
            createTestFile(templateName.replace('.html', ''), processedContent);
            
        } catch (error) {
            console.log(`❌ Erro ao processar ${templateName}:`, error.message);
            allValid = false;
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
    }
    
    if (allValid) {
        console.log('🎉 Todos os templates finais estão prontos!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Copie o conteúdo dos arquivos em test-outlook-final-outputs/');
        console.log('2. Cole no Supabase Dashboard > Authentication > Email Templates');
        console.log('3. Configure os assuntos corretos:');
        console.log('   - Invite: "Bem-vindo à Calmon Academy - Ative sua Conta"');
        console.log('   - Recovery: "Recuperação de Senha - Calmon Academy"');
        console.log('4. Teste o envio de emails no Outlook');
    } else {
        console.log('⚠️  Alguns templates precisam de ajustes antes do uso.');
    }
}

// Executar o teste
testFinalOutlookTemplates().catch(console.error); 