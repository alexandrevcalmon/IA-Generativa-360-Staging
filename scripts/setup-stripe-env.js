/**
 * Script para configurar variáveis de ambiente do Stripe
 * 
 * Este script ajuda a identificar e configurar as variáveis de ambiente
 * corretas para diferentes ambientes (staging/produção).
 */

import dotenv from 'dotenv'
dotenv.config()

console.log('🔧 Configuração de Variáveis de Ambiente do Stripe\n')

// Verificar configuração atual
const currentStripeKey = process.env.STRIPE_SECRET_KEY
const currentPublishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY

function detectStripeEnvironment(stripeKey) {
  if (!stripeKey) return 'not_configured'
  if (stripeKey.startsWith('sk_test_')) return 'test'
  if (stripeKey.startsWith('sk_live_')) return 'production'
  return 'unknown'
}

function detectPublishableEnvironment(publishableKey) {
  if (!publishableKey) return 'not_configured'
  if (publishableKey.startsWith('pk_test_')) return 'test'
  if (publishableKey.startsWith('pk_live_')) return 'production'
  return 'unknown'
}

const stripeEnv = detectStripeEnvironment(currentStripeKey)
const publishableEnv = detectPublishableEnvironment(currentPublishableKey)

console.log('📊 Configuração Atual:')
console.log(`   Stripe Secret Key: ${stripeEnv}`)
console.log(`   Stripe Publishable Key: ${publishableEnv}`)

// Verificar se as configurações estão corretas
const isCorrect = stripeEnv === 'production' && publishableEnv === 'production'

if (isCorrect) {
  console.log('\n✅ Configuração está correta!')
  console.log('   As chaves de produção estão configuradas.')
} else {
  console.log('\n⚠️ Configuração precisa ser ajustada!')
  
  if (stripeEnv === 'test') {
    console.log('\n🔧 Para corrigir:')
    console.log('   1. Acesse o dashboard do Supabase (staging)')
    console.log('   2. Vá em Settings > Edge Functions')
    console.log('   3. Configure STRIPE_SECRET_KEY com a chave de produção (sk_live_...)')
    console.log('   4. Configure STRIPE_WEBHOOK_SECRET com o webhook secret de produção')
  }
  
  if (publishableEnv === 'test') {
    console.log('\n🔧 Para corrigir o frontend:')
    console.log('   1. Configure VITE_STRIPE_PUBLISHABLE_KEY com a chave pública de produção (pk_live_...)')
    console.log('   2. Reinicie o servidor de desenvolvimento')
  }
}

// Mostrar exemplo de configuração
console.log('\n📋 Exemplo de configuração correta:')
console.log('')
console.log('# .env (local)')
console.log('STRIPE_SECRET_KEY=sk_live_...')
console.log('VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...')
console.log('')
console.log('# Supabase Edge Functions (staging)')
console.log('STRIPE_SECRET_KEY=sk_live_...')
console.log('STRIPE_WEBHOOK_SECRET=whsec_...')
console.log('FRONTEND_URL=https://staging.grupocalmon.com')

// Verificar se o produto existe
if (currentStripeKey && stripeEnv === 'production') {
  console.log('\n🔍 Verificando se o produto existe...')
  
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(currentStripeKey, {
      apiVersion: '2024-12-18.acacia'
    })
    
    const product = await stripe.products.retrieve('prod_SeegAgglteTV3Y')
    console.log(`✅ Produto encontrado: ${product.name}`)
    
    const prices = await stripe.prices.list({
      product: 'prod_SeegAgglteTV3Y',
      active: true
    })
    
    console.log(`✅ ${prices.data.length} preço(s) ativo(s) encontrado(s)`)
    
  } catch (error) {
    console.log(`❌ Erro ao verificar produto: ${error.message}`)
  }
}

console.log('\n✨ Verificação concluída!')
console.log('\n💡 Dica: Use cartões de teste do Stripe para evitar cobranças reais durante os testes.') 