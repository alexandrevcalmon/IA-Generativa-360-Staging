#!/usr/bin/env node

/**
 * Script para atualizar variáveis de ambiente após restauração do Supabase
 * 
 * Uso:
 * node scripts/update-env-variables.js <novo-projeto-ref> <nova-anon-key>
 * 
 * Exemplo:
 * node scripts/update-env-variables.js abcdefghijklmnopqrstuvwxyz eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
    log(`❌ ERRO: ${message}`, 'red');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logWarning(message) {
    log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️ ${message}`, 'blue');
}

// Verificar argumentos
const args = process.argv.slice(2);
if (args.length < 2) {
    logError('Uso: node scripts/update-env-variables.js <novo-projeto-ref> <nova-anon-key>');
    logInfo('Exemplo: node scripts/update-env-variables.js abcdefghijklmnopqrstuvwxyz eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    process.exit(1);
}

const [newProjectRef, newAnonKey] = args;

// Validar formato do project ref
if (!/^[a-z0-9]{24}$/.test(newProjectRef)) {
    logError('Project ref deve ter 24 caracteres alfanuméricos');
    process.exit(1);
}

// Validar formato da anon key
if (!newAnonKey.startsWith('eyJ')) {
    logError('Anon key deve ser um JWT válido');
    process.exit(1);
}

const newSupabaseUrl = `https://${newProjectRef}.supabase.co`;

log('🔄 Atualizando variáveis de ambiente...', 'cyan');

// Arquivos para atualizar
const filesToUpdate = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.staging'
];

// Padrões para substituir
const patterns = [
    {
        name: 'VITE_SUPABASE_URL',
        oldPattern: /VITE_SUPABASE_URL=https:\/\/[a-z0-9]{24}\.supabase\.co/,
        newValue: `VITE_SUPABASE_URL=${newSupabaseUrl}`
    },
    {
        name: 'VITE_SUPABASE_ANON_KEY',
        oldPattern: /VITE_SUPABASE_ANON_KEY=eyJ[a-zA-Z0-9._-]+/,
        newValue: `VITE_SUPABASE_ANON_KEY=${newAnonKey}`
    },
    {
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        oldPattern: /NEXT_PUBLIC_SUPABASE_URL=https:\/\/[a-z0-9]{24}\.supabase\.co/,
        newValue: `NEXT_PUBLIC_SUPABASE_URL=${newSupabaseUrl}`
    },
    {
        name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        oldPattern: /NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[a-zA-Z0-9._-]+/,
        newValue: `NEXT_PUBLIC_SUPABASE_ANON_KEY=${newAnonKey}`
    }
];

let totalFilesUpdated = 0;

filesToUpdate.forEach(filename => {
    const filePath = path.join(process.cwd(), filename);
    
    if (!fs.existsSync(filePath)) {
        logWarning(`Arquivo ${filename} não encontrado, pulando...`);
        return;
    }
    
    logInfo(`Processando ${filename}...`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let fileUpdated = false;
        
        patterns.forEach(pattern => {
            if (pattern.oldPattern.test(content)) {
                content = content.replace(pattern.oldPattern, pattern.newValue);
                logSuccess(`  ✅ ${pattern.name} atualizado`);
                fileUpdated = true;
            } else {
                // Tentar adicionar se não existir
                if (!content.includes(pattern.name)) {
                    content += `\n${pattern.newValue}`;
                    logSuccess(`  ✅ ${pattern.name} adicionado`);
                    fileUpdated = true;
                } else {
                    logWarning(`  ⚠️ ${pattern.name} não encontrado no padrão esperado`);
                }
            }
        });
        
        if (fileUpdated) {
            fs.writeFileSync(filePath, content);
            totalFilesUpdated++;
            logSuccess(`Arquivo ${filename} atualizado com sucesso`);
        } else {
            logWarning(`Nenhuma alteração necessária em ${filename}`);
        }
        
    } catch (error) {
        logError(`Erro ao processar ${filename}: ${error.message}`);
    }
});

// Criar arquivo de backup das configurações antigas
const backupContent = `# Backup das configurações antigas - ${new Date().toISOString()}
# Projeto anterior: ${process.env.VITE_SUPABASE_URL || 'N/A'}
# Data da restauração: ${new Date().toISOString()}

# Configurações do novo projeto:
VITE_SUPABASE_URL=${newSupabaseUrl}
VITE_SUPABASE_ANON_KEY=${newAnonKey}
NEXT_PUBLIC_SUPABASE_URL=${newSupabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${newAnonKey}

# Instruções:
# 1. Atualize as variáveis de ambiente na sua aplicação
# 2. Atualize os webhook endpoints no Stripe
# 3. Atualize as configurações de email no Supabase
# 4. Teste todas as funcionalidades
`;

const backupPath = path.join(process.cwd(), '.env.backup.restore');
fs.writeFileSync(backupPath, backupContent);
logSuccess(`Backup das configurações salvo em ${backupPath}`);

// Resumo
log('\n📋 RESUMO DA ATUALIZAÇÃO:', 'cyan');
log(`✅ ${totalFilesUpdated} arquivos atualizados`);
log(`✅ Novo URL: ${newSupabaseUrl}`);
log(`✅ Anon key atualizada`);

// Próximos passos
log('\n🔄 PRÓXIMOS PASSOS:', 'yellow');
log('1. Reiniciar a aplicação para carregar as novas variáveis');
log('2. Atualizar webhook endpoints no Stripe');
log('3. Atualizar configurações de email no Supabase Dashboard');
log('4. Testar autenticação e funcionalidades principais');
log('5. Verificar Edge Functions');
log('6. Configurar monitoramento e alertas');

// Verificar se há outros arquivos que precisam ser atualizados
log('\n🔍 VERIFICAÇÕES ADICIONAIS:', 'yellow');
log('• Verificar se há referências hardcoded ao projeto anterior no código');
log('• Atualizar documentação com novas URLs');
log('• Verificar configurações de CI/CD');
log('• Testar integrações externas (Stripe, Bunny.net, etc.)');

log('\n🎉 Atualização concluída!', 'green'); 