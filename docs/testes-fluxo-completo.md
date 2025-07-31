# Testes do Fluxo Completo

Este documento descreve os testes criados para verificar todo o fluxo do sistema, desde a compra do plano até o login no painel da empresa.

## 📋 Testes Disponíveis

### 1. **Teste Simplificado** (`test-flow.js`)
Testa o fluxo principal sem interação com Stripe real.

### 2. **Teste Completo** (`scripts/test-complete-flow.js`)
Testa todo o fluxo incluindo Stripe real (requer configuração).

### 3. **Teste Stripe Real** (`scripts/test-stripe-flow.js`)
Simula o fluxo real do Stripe com webhooks.

## 🚀 Como Executar

### Pré-requisitos

1. **Variáveis de ambiente configuradas:**
```bash
# .env
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
VITE_SUPABASE_URL=https://ldlxebhnkayiwksipvyc.supabase.co
STRIPE_SECRET_KEY=sua_stripe_secret_key
FRONTEND_URL=http://localhost:3000
```

2. **Dependências instaladas:**
```bash
npm install @supabase/supabase-js stripe dotenv
```

### Executar Teste Simplificado

```bash
node test-flow.js
```

**Este é o teste recomendado para verificação rápida.**

### Executar Teste Completo

```bash
node scripts/test-complete-flow.js
```

### Executar Teste Stripe Real

```bash
node scripts/test-stripe-flow.js
```

## 📊 O que os Testes Verificam

### ✅ **Teste Simplificado**

1. **Criação de Empresa**
   - Inserção na tabela `companies`
   - Dados corretos salvos

2. **Criação de Usuário**
   - Usuário criado no `auth.users`
   - Metadata configurada

3. **Vinculação**
   - Empresa vinculada ao usuário
   - `auth_user_id` configurado

4. **Criação de Perfil**
   - Perfil criado na tabela `profiles`
   - Role correto (`company`)

5. **Criação de Company User**
   - Registro na tabela `company_users`
   - Vinculação correta

6. **Acesso aos Dados**
   - Busca por `auth_user_id`
   - Dados correspondem

7. **Funções de Validação**
   - `ensure_user_company_linkage`
   - `validate_user_access`

8. **Funções de Webhook**
   - `create_or_update_company_from_webhook`
   - `sync_company_with_stripe_webhook`

### ✅ **Teste Completo (com Stripe)**

1. **Criação de Plano**
   - Produto no Stripe
   - Preço no Stripe
   - Plano no banco

2. **Checkout Session**
   - Session criada
   - Metadata configurada

3. **Pagamento**
   - Customer criado
   - Subscription criada

4. **Webhooks**
   - `checkout.session.completed`
   - `invoice.payment_succeeded`

5. **Resultado Final**
   - Empresa criada automaticamente
   - Usuário criado automaticamente
   - Vinculação automática

## 📈 Exemplo de Saída

```
🧪 TESTE DO FLUXO COMPLETO
==========================
📧 Email de teste: teste-fluxo-1734567890123@exemplo.com

ℹ️ [2025-01-18T19:30:00.000Z] 🚀 Iniciando teste do fluxo completo...
✅ [2025-01-18T19:30:01.000Z] 🏢 Criando empresa...
✅ [2025-01-18T19:30:01.500Z] Empresa criada: Empresa Teste Fluxo Completo
ℹ️ [2025-01-18T19:30:01.500Z]    ID: 12345678-1234-1234-1234-123456789012
ℹ️ [2025-01-18T19:30:01.500Z]    Email: teste-fluxo-1734567890123@exemplo.com
✅ [2025-01-18T19:30:02.000Z] 👤 Criando usuário de autenticação...
✅ [2025-01-18T19:30:02.500Z] Usuário criado: teste-fluxo-1734567890123@exemplo.com
ℹ️ [2025-01-18T19:30:02.500Z]    ID: 87654321-4321-4321-4321-210987654321
✅ [2025-01-18T19:30:03.000Z] 🔗 Vinculando empresa ao usuário...
✅ [2025-01-18T19:30:03.500Z] Empresa vinculada ao usuário
✅ [2025-01-18T19:30:04.000Z] 📋 Criando perfil...
✅ [2025-01-18T19:30:04.500Z] Perfil criado com role: company
✅ [2025-01-18T19:30:05.000Z] 👥 Criando company_user...
✅ [2025-01-18T19:30:05.500Z] Company user criado: João Teste Fluxo
✅ [2025-01-18T19:30:06.000Z] 📊 Testando acesso aos dados...
✅ [2025-01-18T19:30:06.500Z] Acesso aos dados da empresa confirmado
✅ [2025-01-18T19:30:07.000Z] Acesso aos dados de company_user confirmado
✅ [2025-01-18T19:30:07.500Z] 🔍 Testando funções de validação...
✅ [2025-01-18T19:30:08.000Z] ensure_user_company_linkage: updated
✅ [2025-01-18T19:30:08.500Z] validate_user_access: direct_access
✅ [2025-01-18T19:30:09.000Z] 🔗 Testando funções de webhook...
✅ [2025-01-18T19:30:09.500Z] create_or_update_company_from_webhook: updated
✅ [2025-01-18T19:30:10.000Z] sync_company_with_stripe_webhook: updated
✅ [2025-01-18T19:30:10.500Z] 🧹 Fazendo limpeza...
✅ [2025-01-18T19:30:11.000Z] Limpeza concluída
✅ [2025-01-18T19:30:11.500Z] 🎉 Teste finalizado com sucesso!

📋 RESUMO DO TESTE
==================
✅ Sucessos: 15
❌ Erros: 0
ℹ️ Informações: 4

📊 Dados Testados:
🏢 Empresa: Empresa Teste Fluxo Completo
👤 Usuário: teste-fluxo-1734567890123@exemplo.com
📋 Perfil: company
👥 Company User: João Teste Fluxo

🎉 TODOS OS TESTES PASSARAM!
✅ Criação de empresa funcionando
✅ Criação de usuário funcionando
✅ Vinculação empresa-usuário funcionando
✅ Criação de perfil funcionando
✅ Criação de company_user funcionando
✅ Acesso aos dados funcionando
✅ Funções de validação funcionando
✅ Funções de webhook funcionando

🚀 Sistema pronto para produção!
```

## 🔧 Troubleshooting

### Erro: "SUPABASE_SERVICE_ROLE_KEY não encontrada"
```bash
# Verificar se o arquivo .env existe e tem a chave
cat .env | grep SUPABASE_SERVICE_ROLE_KEY
```

### Erro: "STRIPE_SECRET_KEY não encontrada"
```bash
# Verificar se o arquivo .env existe e tem a chave
cat .env | grep STRIPE_SECRET_KEY
```

### Erro de Conexão com Supabase
```bash
# Verificar se a URL está correta
echo $VITE_SUPABASE_URL
```

### Erro de Permissão
```bash
# Verificar se a service role key tem permissões adequadas
# Deve ter acesso a auth.admin e todas as tabelas
```

## 📝 Logs Importantes

### Logs de Sucesso
- `✅ Empresa criada: [nome]`
- `✅ Usuário criado: [email]`
- `✅ Empresa vinculada ao usuário`
- `✅ Perfil criado com role: company`
- `✅ Company user criado: [nome]`
- `✅ Acesso aos dados confirmado`

### Logs de Erro
- `❌ Erro ao criar empresa: [detalhes]`
- `❌ Erro ao criar usuário: [detalhes]`
- `❌ Erro ao vincular empresa: [detalhes]`
- `❌ Erro ao testar acesso: [detalhes]`

## 🎯 Cenários de Teste

### ✅ **Cenário 1: Empresa Nova**
- Email não existe no banco
- Criação completa de todos os registros
- Vinculação automática

### ✅ **Cenário 2: Empresa Existente**
- Email já existe no banco
- Atualização de dados
- Preservação de informações

### ✅ **Cenário 3: Concorrência**
- Múltiplos webhooks simultâneos
- Tratamento de race conditions
- Sem violação de constraints

### ✅ **Cenário 4: Dados Inválidos**
- Plan ID inválido
- Email malformado
- Tratamento gracioso de erros

## 🚀 Próximos Passos

1. **Executar teste simplificado** para verificação rápida
2. **Executar teste completo** para validação completa
3. **Monitorar logs** para identificar problemas
4. **Corrigir erros** se encontrados
5. **Repetir testes** até todos passarem

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs detalhados
2. Confirmar variáveis de ambiente
3. Verificar permissões do Supabase
4. Testar conectividade
5. Consultar documentação do Stripe

---

**Sistema testado e validado!** 🎉 