#!/usr/bin/env node

/**
 * Teste do Fluxo Real do Stripe
 * 
 * Este script simula o fluxo completo do Stripe:
 * 1. Cria checkout session
 * 2. Simula pagamento
 * 3. Processa webhooks
 * 4. Verifica resultado final
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

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env')
  process.exit(1)
}

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada no .env')
  process.exit(1)
}

// Clientes
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

// Dados de teste
const TEST_EMAIL = `teste-stripe-${Date.now()}@exemplo.com`
const TEST_COMPANY = {
  name: 'Empresa Teste Stripe',
  contact_name: 'João Teste Stripe',
  contact_email: TEST_EMAIL,
  contact_phone: '(11) 88888-8888',
  cnpj: '98.765.432/0001-10',
  address: 'Av. do Teste, 456',
  city: 'Rio de Janeiro',
  state: 'RJ',
  zip_code: '20000-000'
}

class StripeFlowTest {
  constructor() {
    this.testResults = []
    this.testPlan = null
    this.stripePrice = null
    this.checkoutSession = null
    this.stripeCustomer = null
    this.stripeSubscription = null
    this.company = null
    this.authUser = null
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
    console.log(`${prefix} [${timestamp}] ${message}`)
    this.testResults.push({ timestamp, type, message })
  }

  async runTest() {
    console.log('🧪 TESTE DO FLUXO REAL DO STRIPE')
    console.log('=================================')
    console.log(`📧 Email de teste: ${TEST_EMAIL}`)
    console.log('')

    this.log('🚀 Iniciando teste do fluxo real do Stripe...')
    
    try {
      // 1. Criar plano de teste
      await this.createTestPlan()
      
      // 2. Criar checkout session
      await this.createCheckoutSession()
      
      // 3. Simular pagamento
      await this.simulatePayment()
      
      // 4. Processar webhooks
      await this.processWebhooks()
      
      // 5. Verificar resultado
      await this.verifyResults()
      
      // 6. Limpeza
      await this.cleanup()
      
      this.log('🎉 Teste do fluxo Stripe finalizado com sucesso!', 'success')
      this.printSummary()
      
    } catch (error) {
      this.log(`❌ Erro no teste: ${error.message}`, 'error')
      console.error(error)
      await this.cleanup()
      process.exit(1)
    }
  }

  async createTestPlan() {
    this.log('📋 Criando plano de teste no Stripe...')
    
    try {
      // Criar produto no Stripe
      const product = await stripe.products.create({
        name: 'Plano Teste Stripe',
        description: 'Plano para teste do fluxo completo'
      })

      // Criar preço no Stripe
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 1000, // R$ 10,00
        currency: 'brl',
        recurring: {
          interval: 'month'
        }
      })

      // Criar plano no banco
      const { data: plan, error } = await supabase
        .from('subscription_plans')
        .insert({
          name: 'Plano Teste Stripe',
          price: 10.00,
          max_students: 50,
          max_collaborators: 3,
          stripe_product_id: product.id,
          stripe_price_id: price.id,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      this.testPlan = plan
      this.stripePrice = price
      this.log(`✅ Plano criado: ${plan.name} (ID: ${plan.id})`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao criar plano: ${error.message}`, 'error')
      throw error
    }
  }

  async createCheckoutSession() {
    this.log('🛒 Criando checkout session...')
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: this.stripePrice.id,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/activate-account?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/plans`,
        metadata: {
          company_name: TEST_COMPANY.name,
          contact_name: TEST_COMPANY.contact_name,
          contact_email: TEST_COMPANY.contact_email,
          contact_phone: TEST_COMPANY.contact_phone,
          cnpj: TEST_COMPANY.cnpj,
          address: TEST_COMPANY.address,
          city: TEST_COMPANY.city,
          state: TEST_COMPANY.state,
          zip_code: TEST_COMPANY.zip_code,
          plan_id: this.testPlan.id,
          max_collaborators: '3',
          subscription_period: '30'
        }
      })

      this.checkoutSession = session
      this.log(`✅ Checkout session criada: ${session.id}`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao criar checkout session: ${error.message}`, 'error')
      throw error
    }
  }

  async simulatePayment() {
    this.log('💳 Simulando pagamento...')
    
    try {
      // Criar customer
      const customer = await stripe.customers.create({
        email: TEST_EMAIL,
        name: TEST_COMPANY.contact_name,
        metadata: {
          company_name: TEST_COMPANY.name
        }
      })

      this.stripeCustomer = customer
      this.log(`✅ Customer criado: ${customer.id}`, 'success')

      // Criar subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: this.stripePrice.id,
        }],
        metadata: {
          company_name: TEST_COMPANY.name,
          contact_email: TEST_COMPANY.contact_email
        }
      })

      this.stripeSubscription = subscription
      this.log(`✅ Subscription criada: ${subscription.id}`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao simular pagamento: ${error.message}`, 'error')
      throw error
    }
  }

  async processWebhooks() {
    this.log('🔗 Processando webhooks...')
    
    try {
      // Simular webhook checkout.session.completed
      const checkoutEvent = {
        id: 'evt_test_checkout',
        object: 'event',
        api_version: '2024-12-18.acacia',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            ...this.checkoutSession,
            customer: this.stripeCustomer.id,
            subscription: this.stripeSubscription.id,
            payment_status: 'paid',
            status: 'complete'
          }
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
          id: 'req_test',
          idempotency_key: null
        },
        type: 'checkout.session.completed'
      }

      // Chamar webhook diretamente
      const webhookResponse = await fetch(`${SUPABASE_URL}/functions/v1/stripe-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': this.generateTestSignature(checkoutEvent)
        },
        body: JSON.stringify(checkoutEvent)
      })

      if (!webhookResponse.ok) {
        const error = await webhookResponse.text()
        throw new Error(`Webhook checkout.session.completed failed: ${error}`)
      }

      this.log('✅ Webhook checkout.session.completed processado', 'success')

      // Aguardar um pouco
      await this.sleep(2000)

      // Simular webhook invoice.payment_succeeded
      const invoiceEvent = {
        id: 'evt_test_invoice',
        object: 'event',
        api_version: '2024-12-18.acacia',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: 'in_test_invoice',
            object: 'invoice',
            customer: this.stripeCustomer.id,
            subscription: this.stripeSubscription.id,
            status: 'paid',
            amount_paid: 1000,
            currency: 'brl'
          }
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
          id: 'req_test_invoice',
          idempotency_key: null
        },
        type: 'invoice.payment_succeeded'
      }

      const invoiceResponse = await fetch(`${SUPABASE_URL}/functions/v1/stripe-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': this.generateTestSignature(invoiceEvent)
        },
        body: JSON.stringify(invoiceEvent)
      })

      if (!invoiceResponse.ok) {
        const error = await invoiceResponse.text()
        throw new Error(`Webhook invoice.payment_succeeded failed: ${error}`)
      }

      this.log('✅ Webhook invoice.payment_succeeded processado', 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao processar webhooks: ${error.message}`, 'error')
      throw error
    }
  }

  async verifyResults() {
    this.log('🔍 Verificando resultados...')
    
    try {
      // Aguardar um pouco para garantir que os webhooks foram processados
      await this.sleep(3000)

      // Verificar se empresa foi criada
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('contact_email', TEST_EMAIL)
        .single()

      if (companyError) throw companyError

      this.company = company
      this.log(`✅ Empresa criada: ${company.name}`, 'success')
      this.log(`   ID: ${company.id}`, 'info')
      this.log(`   Stripe Customer: ${company.stripe_customer_id}`, 'info')
      this.log(`   Stripe Subscription: ${company.stripe_subscription_id}`, 'info')

      // Verificar se usuário foi criado
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
      
      if (usersError) throw usersError

      const authUser = users.find(user => user.email === TEST_EMAIL)
      
      if (!authUser) {
        throw new Error('Usuário de autenticação não foi criado')
      }

      this.authUser = authUser
      this.log(`✅ Usuário criado: ${authUser.email}`, 'success')

      // Verificar se empresa está vinculada ao usuário
      if (company.auth_user_id !== authUser.id) {
        throw new Error('Empresa não está vinculada ao usuário')
      }

      this.log('✅ Empresa vinculada ao usuário', 'success')

      // Verificar se perfil foi criado
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) throw profileError

      if (profile.role !== 'company') {
        throw new Error('Perfil não tem role correto')
      }

      this.log(`✅ Perfil criado com role: ${profile.role}`, 'success')

      // Verificar se company_user foi criado
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()

      if (companyUserError) throw companyUserError

      this.log(`✅ Company user criado: ${companyUser.name}`, 'success')
      
    } catch (error) {
      this.log(`❌ Erro ao verificar resultados: ${error.message}`, 'error')
      throw error
    }
  }

  async cleanup() {
    this.log('🧹 Fazendo limpeza...')
    
    try {
      // Cancelar subscription no Stripe
      if (this.stripeSubscription) {
        await stripe.subscriptions.cancel(this.stripeSubscription.id)
        this.log('✅ Subscription cancelada no Stripe', 'success')
      }

      // Deletar customer no Stripe
      if (this.stripeCustomer) {
        await stripe.customers.del(this.stripeCustomer.id)
        this.log('✅ Customer deletado no Stripe', 'success')
      }

      // Deletar dados do banco
      if (this.company) {
        // Deletar company_user
        await supabase
          .from('company_users')
          .delete()
          .eq('company_id', this.company.id)

        // Deletar perfil
        await supabase
          .from('profiles')
          .delete()
          .eq('id', this.authUser?.id)

        // Deletar empresa
        await supabase
          .from('companies')
          .delete()
          .eq('id', this.company.id)

        // Deletar usuário de autenticação
        if (this.authUser) {
          await supabase.auth.admin.deleteUser(this.authUser.id)
        }
      }

      // Deletar plano de teste
      if (this.testPlan) {
        await supabase
          .from('subscription_plans')
          .delete()
          .eq('id', this.testPlan.id)
      }

      this.log('✅ Limpeza concluída', 'success')
      
    } catch (error) {
      this.log(`⚠️ Erro na limpeza: ${error.message}`, 'error')
    }
  }

  generateTestSignature(event) {
    // Gerar assinatura de teste para webhook
    const timestamp = Math.floor(Date.now() / 1000)
    const payload = JSON.stringify(event)
    const signedPayload = `${timestamp}.${payload}`
    
    // Em produção, isso seria feito com crypto
    return `t=${timestamp},v1=test_signature`
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  printSummary() {
    console.log('\n📋 RESUMO DO TESTE STRIPE')
    console.log('=========================')
    
    const successCount = this.testResults.filter(r => r.type === 'success').length
    const errorCount = this.testResults.filter(r => r.type === 'error').length
    const infoCount = this.testResults.filter(r => r.type === 'info').length
    
    console.log(`✅ Sucessos: ${successCount}`)
    console.log(`❌ Erros: ${errorCount}`)
    console.log(`ℹ️ Informações: ${infoCount}`)
    
    console.log('\n📊 Dados Criados:')
    console.log(`📋 Plano: ${this.testPlan?.name || 'N/A'}`)
    console.log(`🛒 Checkout Session: ${this.checkoutSession?.id || 'N/A'}`)
    console.log(`👤 Stripe Customer: ${this.stripeCustomer?.id || 'N/A'}`)
    console.log(`📅 Stripe Subscription: ${this.stripeSubscription?.id || 'N/A'}`)
    console.log(`🏢 Empresa: ${this.company?.name || 'N/A'}`)
    console.log(`👤 Usuário: ${this.authUser?.email || 'N/A'}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!')
      console.log('✅ Integração com Stripe funcionando')
      console.log('✅ Webhooks processando corretamente')
      console.log('✅ Criação automática de empresa')
      console.log('✅ Criação automática de usuário')
      console.log('✅ Vinculação automática')
      console.log('\n🚀 Sistema pronto para produção!')
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM!')
      console.log('Verifique os logs acima para detalhes.')
    }
  }
}

// Executar teste
async function main() {
  const test = new StripeFlowTest()
  await test.runTest()
}

// Executar
main().catch(console.error) 