/**
 * Script para verificar e configurar as chaves do Stripe
 * 
 * Este script ajuda a identificar problemas de configuração do Stripe
 * e fornece orientações para corrigi-los.
 */

import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Configurações
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ldlxebhnkayiwksipvyc.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

console.log('🔍 Verificando configuração do Stripe...\n')

// Verificar se as chaves estão configuradas
if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env')
  process.exit(1)
}

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada no .env')
  process.exit(1)
}

// Detectar ambiente do Stripe
function detectStripeEnvironment(stripeKey) {
  if (stripeKey.startsWith('sk_test_')) {
    return 'test'
  } else if (stripeKey.startsWith('sk_live_')) {
    return 'production'
  } else {
    return 'unknown'
  }
}

const stripeEnvironment = detectStripeEnvironment(STRIPE_SECRET_KEY)
console.log(`📊 Ambiente do Stripe detectado: ${stripeEnvironment}`)

// Clientes
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

class StripeConfigChecker {
  constructor() {
    this.issues = []
    this.recommendations = []
  }

  async checkStripeConnection() {
    console.log('\n🔗 Verificando conexão com o Stripe...')
    
    try {
      const account = await stripe.accounts.retrieve()
      console.log(`✅ Conexão com Stripe estabelecida`)
      console.log(`   Conta: ${account.business_profile?.name || 'N/A'}`)
      console.log(`   ID da Conta: ${account.id}`)
      console.log(`   País: ${account.country}`)
      console.log(`   Ambiente: ${account.object === 'account' ? 'Standard' : 'Express'}`)
      
      return true
    } catch (error) {
      console.error(`❌ Erro na conexão com Stripe: ${error.message}`)
      this.issues.push(`Falha na conexão com Stripe: ${error.message}`)
      return false
    }
  }

  async checkProductsInDatabase() {
    console.log('\n🗄️ Verificando produtos no banco de dados...')
    
    try {
      const { data: plans, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error(`❌ Erro ao buscar planos: ${error.message}`)
        this.issues.push(`Erro no banco de dados: ${error.message}`)
        return []
      }

      console.log(`✅ Encontrados ${plans.length} planos no banco:`)
      plans.forEach(plan => {
        console.log(`   - ${plan.name}: ${plan.stripe_product_id}`)
      })

      return plans
    } catch (error) {
      console.error(`❌ Erro ao verificar produtos: ${error.message}`)
      this.issues.push(`Erro ao verificar produtos: ${error.message}`)
      return []
    }
  }

  async checkProductsInStripe() {
    console.log('\n💳 Verificando produtos no Stripe...')
    
    try {
      const products = await stripe.products.list({ limit: 100 })
      console.log(`✅ Encontrados ${products.data.length} produtos no Stripe:`)
      
      products.data.forEach(product => {
        console.log(`   - ${product.name}: ${product.id} (${product.active ? 'Ativo' : 'Inativo'})`)
      })

      return products.data
    } catch (error) {
      console.error(`❌ Erro ao listar produtos do Stripe: ${error.message}`)
      this.issues.push(`Erro ao listar produtos: ${error.message}`)
      return []
    }
  }

  async checkProductMismatch(dbPlans, stripeProducts) {
    console.log('\n🔍 Verificando correspondência entre banco e Stripe...')
    
    const dbProductIds = dbPlans.map(plan => plan.stripe_product_id)
    const stripeProductIds = stripeProducts.map(product => product.id)
    
    const missingInStripe = dbProductIds.filter(id => !stripeProductIds.includes(id))
    const missingInDb = stripeProductIds.filter(id => !dbProductIds.includes(id))
    
    if (missingInStripe.length > 0) {
      console.log(`⚠️ Produtos no banco que não existem no Stripe:`)
      missingInStripe.forEach(id => {
        const plan = dbPlans.find(p => p.stripe_product_id === id)
        console.log(`   - ${id} (${plan?.name || 'Nome não encontrado'})`)
      })
      
      if (stripeEnvironment === 'test') {
        this.recommendations.push('Produtos de produção não existem no ambiente de teste. Configure a chave de produção (sk_live_...) para acessar produtos de produção.')
      } else {
        this.recommendations.push('Alguns produtos do banco não existem no Stripe. Crie os produtos no dashboard do Stripe ou atualize os IDs no banco.')
      }
    }
    
    if (missingInDb.length > 0) {
      console.log(`⚠️ Produtos no Stripe que não estão no banco:`)
      missingInDb.forEach(id => {
        const product = stripeProducts.find(p => p.id === id)
        console.log(`   - ${id} (${product?.name || 'Nome não encontrado'})`)
      })
    }
    
    if (missingInStripe.length === 0 && missingInDb.length === 0) {
      console.log(`✅ Todos os produtos estão sincronizados!`)
    }
  }

  async checkPrices() {
    console.log('\n💰 Verificando preços no Stripe...')
    
    try {
      const prices = await stripe.prices.list({ limit: 100, active: true })
      console.log(`✅ Encontrados ${prices.data.length} preços ativos no Stripe`)
      
      // Agrupar por produto
      const pricesByProduct = {}
      prices.data.forEach(price => {
        if (!pricesByProduct[price.product]) {
          pricesByProduct[price.product] = []
        }
        pricesByProduct[price.product].push(price)
      })
      
      Object.entries(pricesByProduct).forEach(([productId, productPrices]) => {
        console.log(`   Produto ${productId}: ${productPrices.length} preço(s)`)
        productPrices.forEach(price => {
          const amount = (price.unit_amount / 100).toFixed(2)
          const currency = price.currency.toUpperCase()
          const interval = price.recurring ? `${price.recurring.interval_count} ${price.recurring.interval}` : 'one-time'
          console.log(`     - ${price.id}: ${amount} ${currency} / ${interval}`)
        })
      })
      
      return prices.data
    } catch (error) {
      console.error(`❌ Erro ao verificar preços: ${error.message}`)
      this.issues.push(`Erro ao verificar preços: ${error.message}`)
      return []
    }
  }

  async generateRecommendations() {
    console.log('\n📋 Recomendações:')
    
    if (this.issues.length === 0 && this.recommendations.length === 0) {
      console.log('✅ Configuração está correta!')
      return
    }
    
    if (this.issues.length > 0) {
      console.log('\n🚨 Problemas encontrados:')
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`)
      })
    }
    
    if (this.recommendations.length > 0) {
      console.log('\n💡 Recomendações:')
      this.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`)
      })
    }
    
    // Recomendações específicas por ambiente
    if (stripeEnvironment === 'test') {
      console.log('\n🔧 Para ambiente de teste:')
      console.log('   - Use produtos de teste no banco de dados')
      console.log('   - Ou configure a chave de produção para acessar produtos reais')
    } else if (stripeEnvironment === 'production') {
      console.log('\n🔧 Para ambiente de produção:')
      console.log('   - Certifique-se de que todos os produtos estão criados no Stripe')
      console.log('   - Verifique se os preços estão configurados corretamente')
    }
  }
}

async function main() {
  const checker = new StripeConfigChecker()
  
  // Verificar conexão
  const stripeConnected = await checker.checkStripeConnection()
  if (!stripeConnected) {
    console.log('\n❌ Não foi possível conectar ao Stripe. Verifique a chave secreta.')
    process.exit(1)
  }
  
  // Verificar produtos no banco
  const dbPlans = await checker.checkProductsInDatabase()
  
  // Verificar produtos no Stripe
  const stripeProducts = await checker.checkProductsInStripe()
  
  // Verificar correspondência
  await checker.checkProductMismatch(dbPlans, stripeProducts)
  
  // Verificar preços
  await checker.checkPrices()
  
  // Gerar recomendações
  await checker.generateRecommendations()
  
  console.log('\n✨ Verificação concluída!')
}

main().catch(console.error) 