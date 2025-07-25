import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '..', 'supabase', 'templates');
const OUTPUT_DIR = path.join(__dirname, '..', 'test-outlook-buttons-outputs');

// Dados de teste para substituir as variáveis
const testData = {
    '{{ .ConfirmationURL }}': 'https://staging.grupocalmon.com/reset-password?token=test-token-123&type=recovery',
    '{{ .SiteURL }}': 'https://staging.grupocalmon.com'
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

// Função para validar botões VML
function validateVMLButtons(content, templateName) {
    console.log(`\n🔍 Validando botões VML: ${templateName}`);
    
    const checks = [
        { name: 'VML roundrect presente', check: content.includes('v:roundrect'), required: true },
        { name: 'MSO conditional comments', check: content.includes('<!--[if mso]>'), required: true },
        { name: 'MSO hide para outros clientes', check: content.includes('mso-hide:all'), required: true },
        { name: 'Link href no VML', check: content.includes('href="{{ .ConfirmationURL }}"') || content.includes('href="{{ .SiteURL }}'), required: true },
        { name: 'Cor de fundo definida', check: content.includes('fillcolor='), required: true },
        { name: 'Texto centralizado', check: content.includes('v-text-anchor:middle'), required: true },
        { name: 'Anchor lock', check: content.includes('<w:anchorlock/>'), required: true },
        { name: 'Estilo inline no center', check: content.includes('style="color:#ffffff'), required: true },
        { name: 'Fonte Arial definida', check: content.includes('font-family:Arial'), required: true },
        { name: 'Altura e largura definidas', check: content.includes('height:') && content.includes('width:'), required: true },
        { name: 'Arco definido', check: content.includes('arcsize='), required: true },
        { name: 'Stroke definido', check: content.includes('stroke="f"'), required: true }
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
        return false;
    } else {
        console.log(`🎉 Botões VML em ${templateName} estão corretos!`);
        return true;
    }
}

// Função para extrair e mostrar o código do botão
function extractButtonCode(content, templateName) {
    console.log(`\n📋 Código do botão em ${templateName}:`);
    
    const vmlMatch = content.match(/<!--\[if mso\]>[\s\S]*?<\!\[endif\]-->/);
    if (vmlMatch) {
        console.log('VML (Outlook):');
        console.log(vmlMatch[0].replace(/<!--\[if mso\]>/, '').replace(/<\!\[endif\]-->/, '').trim());
    }
    
    const htmlMatch = content.match(/<!--\[if !mso\]><!-->[\s\S]*?<!--<\!\[endif\]-->/);
    if (htmlMatch) {
        console.log('\nHTML (Outros clientes):');
        console.log(htmlMatch[0].replace(/<!--\[if !mso\]><!-->/, '').replace(/<!--<\!\[endif\]-->/, '').trim());
    }
}

// Função principal para testar botões
async function testOutlookButtons() {
    console.log('🚀 Testando botões VML nos templates do Outlook...\n');
    
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
            
            const isValid = validateVMLButtons(processedContent, templateName);
            if (!isValid) {
                allValid = false;
            }
            
            extractButtonCode(processedContent, templateName);
            createTestFile(templateName.replace('.html', ''), processedContent);
            
        } catch (error) {
            console.log(`❌ Erro ao processar ${templateName}:`, error.message);
            allValid = false;
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
    }
    
    if (allValid) {
        console.log('🎉 Todos os botões VML estão corretos!');
        console.log('\n📋 Próximos passos:');
        console.log('1. Copie o conteúdo dos arquivos em test-outlook-buttons-outputs/');
        console.log('2. Cole no Supabase Dashboard > Authentication > Email Templates');
        console.log('3. Teste o envio de emails no Outlook');
        console.log('4. Verifique se os botões aparecem corretamente');
    } else {
        console.log('⚠️  Alguns botões precisam de ajustes antes do uso.');
    }
}

// Executar o teste
testOutlookButtons().catch(console.error); 