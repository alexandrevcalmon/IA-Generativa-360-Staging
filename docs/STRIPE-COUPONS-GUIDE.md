# 🎫 Guia Completo: Cupons de Desconto no Stripe

## 📋 Visão Geral

Este guia explica como configurar e usar cupons de desconto no checkout do Stripe para o sistema de planos de assinatura.

## ✅ Configuração Atual

O sistema já está configurado para suportar cupons com as seguintes opções:

```typescript
const sessionData = {
  // ... outras configurações
  allow_promotion_codes: true,        // ✅ Habilita campo de cupom
  billing_address_collection: 'required', // ✅ Coleta endereço de cobrança
  // ... resto das configurações
}
```

## 🔧 Como Criar Cupons no Stripe

### 1. Acesse o Dashboard do Stripe

1. Vá para [dashboard.stripe.com](https://dashboard.stripe.com)
2. Faça login na sua conta
3. Navegue para **Produtos** > **Cupons**

### 2. Crie um Novo Cupom

1. Clique em **"Criar cupom"**
2. Configure as seguintes opções:

#### Configurações Básicas
- **Nome do cupom**: Nome descritivo (ex: "LANCAMENTO10")
- **Código do cupom**: Código que o cliente digitará (ex: "LANCAMENTO10")
- **Tipo de desconto**: 
  - `Percentual` (ex: 10% de desconto)
  - `Valor fixo` (ex: R$ 50 de desconto)
  - `Frete grátis`

#### Configurações Avançadas
- **Duração**:
  - `Uma vez`: Cupom pode ser usado apenas uma vez por cliente
  - `Múltiplas vezes`: Cupom pode ser usado várias vezes
  - `Para sempre`: Sem limite de uso
- **Data de expiração**: Define quando o cupom expira
- **Valor mínimo**: Valor mínimo da compra para aplicar o cupom
- **Valor máximo**: Valor máximo de desconto aplicável

### 3. Configurações de Restrição (Opcional)

- **Produtos específicos**: Aplicar apenas a produtos selecionados
- **Clientes específicos**: Restringir a emails específicos
- **Limite de uso**: Número máximo de vezes que o cupom pode ser usado

## 🎯 Exemplos de Cupons

### Cupom de Lançamento (10% off)
```
Nome: Lançamento 10% OFF
Código: LANCAMENTO10
Tipo: Percentual
Valor: 10%
Duração: Uma vez por cliente
Expiração: 31/12/2024
```

### Cupom de Valor Fixo (R$ 50 off)
```
Nome: Desconto R$ 50
Código: DESCONTO50
Tipo: Valor fixo
Valor: R$ 50,00
Duração: Uma vez por cliente
Valor mínimo: R$ 100,00
```

### Cupom de Frete Grátis
```
Nome: Frete Grátis
Código: FRETEGRATIS
Tipo: Frete grátis
Duração: Uma vez por cliente
```

## 🧪 Como Testar Cupons

### 1. Execute o Script de Teste

```bash
node scripts/test-coupon.js
```

### 2. Acesse o Checkout

1. Use a URL gerada pelo script
2. Procure pelo campo **"Código promocional"** ou **"Cupom"**
3. Digite o código do cupom criado
4. O desconto será aplicado automaticamente

### 3. Cartões de Teste Recomendados

```
Cartão de sucesso: 4242 4242 4242 4242
Cartão de falha: 4000 0000 0000 0002
Data: Qualquer data futura (ex: 12/25)
CVC: Qualquer número (ex: 123)
```

## 📊 Monitoramento de Cupons

### No Dashboard do Stripe

1. **Produtos** > **Cupons**: Veja todos os cupons criados
2. **Relatórios** > **Cupons**: Estatísticas de uso
3. **Pagamentos**: Veja quais pagamentos usaram cupons

### Métricas Importantes

- **Taxa de conversão**: Quantos clientes usaram o cupom
- **Valor médio**: Valor médio dos pedidos com cupom
- **Cupons mais populares**: Quais cupons são mais usados

## ⚠️ Considerações Importantes

### 1. **Cupons em Assinaturas**
- Cupons aplicados em assinaturas são válidos apenas para o primeiro pagamento
- Para desconto recorrente, use **descontos de assinatura** em vez de cupons

### 2. **Validação de Cupons**
- O Stripe valida automaticamente se o cupom pode ser aplicado
- Cupons expirados ou com restrições não funcionam

### 3. **Backup de Cupons**
- Sempre mantenha backup dos códigos de cupom
- Use códigos descritivos para facilitar identificação

## 🔄 Atualizações Futuras

### Funcionalidades Planejadas

1. **Cupons automáticos**: Aplicar cupons baseado em condições
2. **Cupons de reativação**: Para clientes que cancelaram
3. **Cupons de indicação**: Para clientes que indicaram amigos
4. **Cupons sazonais**: Para datas especiais (Black Friday, etc.)

### Integração com Frontend

```typescript
// Exemplo de como aplicar cupom via API
const applyCoupon = async (couponCode: string) => {
  const response = await fetch('/api/apply-coupon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ couponCode })
  })
  return response.json()
}
```

## 📞 Suporte

Se você tiver problemas com cupons:

1. **Verifique o dashboard do Stripe** para ver se o cupom está ativo
2. **Teste com cartões de teste** para evitar cobranças reais
3. **Verifique as restrições** do cupom (data, valor mínimo, etc.)
4. **Consulte a documentação** do Stripe sobre cupons

## 🔗 Links Úteis

- [Documentação Stripe - Cupons](https://stripe.com/docs/billing/subscriptions/discounts)
- [Dashboard Stripe - Cupons](https://dashboard.stripe.com/coupons)
- [Teste de Cupons](https://stripe.com/docs/testing#coupons)

---

**Última atualização**: Agosto 2024
**Versão**: 1.0 