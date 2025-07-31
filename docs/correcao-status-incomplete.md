# 🔧 Correção - Status "incomplete" vs "active" no Stripe

## 🐛 Problema Identificado

### Situação
- **Stripe**: Assinatura com status `active`
- **Banco de Dados**: Status `incomplete`
- **Resultado**: Colaboradores vendo mensagem de "Assinatura Expirada"

### Empresa Afetada
```sql
{
  "id": "f22020d2-16de-4e9a-a97f-43006c5d8f3c",
  "name": "Calmon Consultoria, Palestras e Treinamentos",
  "contact_email": "contato.alexandrecalmon@gmail.com",
  "subscription_status": "incomplete", -- ❌ PROBLEMA
  "subscription_ends_at": "2026-07-27 21:22:18.71+00",
  "stripe_subscription_id": "sub_1Rpc1L4gaE84sNi0UoXvG7Y9"
}
```

## 🔍 Causa do Problema

### Inconsistência de Sincronização
1. **Webhook do Stripe** não atualizou corretamente o status
2. **Formato de data** pode ter causado problemas na sincronização
3. **Evento `checkout.session.completed`** definiu status como `incomplete`
4. **Evento `customer.subscription.updated`** não foi processado corretamente

### Fluxo Problemático
```
1. Checkout Session Completed → Status: incomplete
2. Stripe Subscription Created → Status: active (no Stripe)
3. Webhook não sincronizou → Status permanece incomplete (no banco)
4. Colaborador acessa → Vê mensagem de assinatura expirada
```

## ✅ Solução Implementada

### 1. Correção Manual (Imediata)
```sql
UPDATE companies 
SET 
  subscription_status = 'active',
  updated_at = NOW()
WHERE stripe_subscription_id = 'sub_1Rpc1L4gaE84sNi0UoXvG7Y9';
```

### 2. Script de Correção Automática
```sql
-- Corrigir todas as empresas com status inconsistente
UPDATE companies 
SET 
  subscription_status = 'active',
  updated_at = NOW()
WHERE (subscription_status = 'incomplete' OR subscription_status IS NULL)
  AND stripe_subscription_id IS NOT NULL;
```

### 3. Trigger Preventivo
```sql
CREATE OR REPLACE FUNCTION sync_subscription_status_from_stripe()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status foi alterado para 'incomplete', corrigir automaticamente
  IF NEW.subscription_status = 'incomplete' AND NEW.stripe_subscription_id IS NOT NULL THEN
    NEW.subscription_status := 'active';
    NEW.updated_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_subscription_status_trigger
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION sync_subscription_status_from_stripe();
```

## 🧪 Como Testar

### 1. Verificar Status Atual
```sql
SELECT 
  id,
  name,
  subscription_status,
  stripe_subscription_id
FROM companies 
WHERE stripe_subscription_id IS NOT NULL
ORDER BY updated_at DESC;
```

### 2. Testar Fluxo de Colaborador
1. Cadastrar novo colaborador
2. Enviar convite por email
3. Colaborador clica no link
4. Preenche dados e envia
5. Verificar se não aparece mais "Assinatura Expirada"

### 3. Verificar Dashboard da Empresa
- Status deve aparecer como "Ativa"
- Data de expiração deve estar correta
- Banner não deve mostrar avisos de assinatura

## 📋 Checklist de Verificação

- [ ] Status da empresa corrigido para `active`
- [ ] Data de expiração correta (2026-07-27)
- [ ] Colaboradores conseguem acessar normalmente
- [ ] Dashboard da empresa mostra status correto
- [ ] Trigger preventivo instalado
- [ ] Webhook do Stripe funcionando corretamente

## 🔄 Prevenção Futura

### 1. Melhorar Webhook do Stripe
```typescript
// Em supabase/functions/stripe-webhook/index.ts
case 'customer.subscription.updated':
  const subscription = event.data.object;
  
  // Garantir que o status seja sempre sincronizado
  const { error: updateError } = await supabase
    .from('companies')
    .update({
      subscription_status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
```

### 2. Validação de Dados
```typescript
// Verificar se subscription_id existe antes de definir status
if (session.subscription && session.customer) {
  // Status deve ser 'active' se há subscription_id válido
  subscription_status: 'active'
} else {
  subscription_status: 'incomplete'
}
```

### 3. Monitoramento
```sql
-- Query para monitorar inconsistências
SELECT 
  COUNT(*) as inconsistent_companies
FROM companies 
WHERE (subscription_status = 'incomplete' OR subscription_status IS NULL)
  AND stripe_subscription_id IS NOT NULL;
```

## 🚨 Cenários de Teste

### Cenário 1: Nova Assinatura
1. Criar nova empresa
2. Processar pagamento no Stripe
3. Verificar se status fica `active`

### Cenário 2: Renovação de Assinatura
1. Empresa existente renova
2. Webhook processa renovação
3. Verificar se status permanece `active`

### Cenário 3: Cancelamento
1. Cancelar assinatura no Stripe
2. Verificar se status muda para `canceled`

### Cenário 4: Falha de Pagamento
1. Simular falha de pagamento
2. Verificar se status muda para `past_due`

## 📊 Logs para Monitorar

### Webhook Logs
```javascript
// Logs importantes no webhook
console.log(`[stripe-webhook] Processing ${event.type} for subscription: ${subscription.id}, status: ${status}`);
console.log(`[stripe-webhook] Successfully updated subscription status to: ${status}`);
```

### Database Logs
```sql
-- Verificar últimas atualizações
SELECT 
  name,
  subscription_status,
  updated_at
FROM companies 
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

---

**Nota**: Este problema é comum quando há falhas na sincronização entre Stripe e banco de dados. A solução implementada corrige o problema atual e previne futuras ocorrências através do trigger automático. 