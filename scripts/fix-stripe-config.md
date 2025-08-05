# 🔧 Guia para Corrigir Configuração do Stripe

## Problema Identificado

O erro `"No such product: 'prod_SeegAgglteTV3Y'"` indica que a edge function está tentando acessar um produto que existe no ambiente de **produção** do Stripe, mas está usando chaves de **teste**.

## Diagnóstico

✅ **Produto existe no Stripe de produção**: `prod_SeegAgglteTV3Y` (Starter 5 Anual)  
❌ **Edge function usando chaves de teste**: A função está configurada com `sk_test_...` em vez de `sk_live_...`

## Solução

### 1. Configurar Variáveis de Ambiente no Supabase

Acesse o dashboard do Supabase (staging) e configure as seguintes variáveis de ambiente:

#### Para Edge Functions:
- `STRIPE_SECRET_KEY`: Use a chave de **produção** (`sk_live_...`)
- `STRIPE_WEBHOOK_SECRET`: Use o webhook secret de **produção**
- `FRONTEND_URL`: `https://staging.grupocalmon.com`

#### Para o Frontend:
- `VITE_STRIPE_PUBLISHABLE_KEY`: Use a chave pública de **produção** (`pk_live_...`)

### 2. Verificar Configuração

Execute o script de verificação:
```bash
node scripts/check-stripe-config.js
```

### 3. Testar Checkout

Execute o script de teste:
```bash
node scripts/test-checkout.js
```

## Configurações por Ambiente

### Staging (atual)
- **Supabase**: `ldlxebhnkayiwksipvyc` (staging)
- **Frontend**: `https://staging.grupocalmon.com`
- **Stripe**: Usar chaves de **produção** (mesmos produtos reais)

### Produção
- **Supabase**: Projeto de produção
- **Frontend**: `https://academy.grupocalmon.com`
- **Stripe**: Chaves de **produção**

## Importante

⚠️ **Atenção**: O ambiente de staging está usando produtos reais do Stripe para testes. Isso significa que:
- Pagamentos reais serão processados
- Use dados de teste (cartões de teste) para evitar cobranças reais
- Considere criar produtos específicos para staging se necessário

## Próximos Passos

1. Configure as variáveis de ambiente no Supabase
2. Teste o checkout novamente
3. Se necessário, crie produtos específicos para staging
4. Atualize a documentação com as configurações corretas 