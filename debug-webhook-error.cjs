// Script para debugar o erro do webhook do Stripe
// Problema: Erro 500 no evento invoice.payment_succeeded quando uma nova empresa compra um plano

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
require('dotenv').config();
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ldlxebhnkayiwksipvyc.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
// Para testes, vamos usar a service role key se disponível
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

class WebhookDebugger {
  constructor() {
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
    this.testResults.push({ timestamp, type, message });
  }

  async debugWebhookError() {
    console.log('🔍 DEBUGANDO ERRO DO WEBHOOK DO STRIPE');
    console.log('=====================================');

    try {
      // 1. Verificar se as funções RPC existem
      await this.checkRPCFunctions();

      // 2. Testar cenário de empresa nova
      await this.testNewCompanyScenario();

      // 3. Testar cenário de empresa existente
      await this.testExistingCompanyScenario();

      // 4. Verificar constraints da tabela
      await this.checkTableConstraints();

      // 5. Simular eventos do webhook
      await this.simulateWebhookEvents();

    } catch (error) {
      this.log(`Erro durante debug: ${error.message}`, 'error');
    }

    this.generateReport();
  }

  async checkRPCFunctions() {
    this.log('🔍 Verificando funções RPC...');

    try {
      // Verificar se create_or_update_company_from_webhook existe
      const { data: createFunction, error: createError } = await supabase
        .rpc('create_or_update_company_from_webhook', {
          company_data: {
            name: 'Test Company',
            contact_email: 'test@debug.com',
            contact_name: 'Test User'
          }
        });

      if (createError) {
        this.log(`❌ Erro na função create_or_update_company_from_webhook: ${createError.message}`, 'error');
      } else {
        this.log('✅ Função create_or_update_company_from_webhook existe e funciona', 'success');
      }

      // Verificar se sync_company_with_stripe_webhook existe
      const { data: syncFunction, error: syncError } = await supabase
        .rpc('sync_company_with_stripe_webhook', {
          subscription_id: 'sub_test123',
          customer_id: 'cus_test123',
          status: 'active'
        });

      if (syncError) {
        this.log(`❌ Erro na função sync_company_with_stripe_webhook: ${syncError.message}`, 'error');
      } else {
        this.log('✅ Função sync_company_with_stripe_webhook existe e funciona', 'success');
      }

    } catch (error) {
      this.log(`Erro ao verificar funções RPC: ${error.message}`, 'error');
    }
  }

  async testNewCompanyScenario() {
    this.log('🆕 Testando cenário de empresa nova...');

    const testCompanyData = {
      name: 'Nova Empresa Debug',
      contact_name: 'João Silva',
      contact_email: `debug-new-${Date.now()}@teste.com`,
      contact_phone: '(11) 99999-9999',
      cnpj: '12.345.678/0001-90',
      address: 'Rua Teste, 123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      plan_id: null,
      stripe_customer_id: `cus_debug_${Date.now()}`,
      stripe_subscription_id: `sub_debug_${Date.now()}`,
      subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      max_collaborators: '5'
    };

    try {
      const { data: result, error } = await supabase
        .rpc('create_or_update_company_from_webhook', {
          company_data: testCompanyData
        });

      if (error) {
        this.log(`❌ Erro ao criar nova empresa: ${error.message}`, 'error');
        this.log(`Detalhes: ${JSON.stringify(error, null, 2)}`, 'error');
      } else {
        this.log(`✅ Nova empresa criada com sucesso: ${JSON.stringify(result, null, 2)}`, 'success');
        
        // Limpar dados de teste
        await supabase
          .from('companies')
          .delete()
          .eq('contact_email', testCompanyData.contact_email);
      }

    } catch (error) {
      this.log(`Erro no teste de nova empresa: ${error.message}`, 'error');
    }
  }

  async testExistingCompanyScenario() {
    this.log('🔄 Testando cenário de empresa existente...');

    const testEmail = `debug-existing-${Date.now()}@teste.com`;
    
    try {
      // Primeiro, criar uma empresa
      const { data: company, error: createError } = await supabase
        .from('companies')
        .insert({
          name: 'Empresa Existente Debug',
          contact_email: testEmail,
          contact_name: 'Maria Silva'
        })
        .select()
        .single();

      if (createError) {
        this.log(`❌ Erro ao criar empresa para teste: ${createError.message}`, 'error');
        return;
      }

      this.log(`✅ Empresa criada para teste: ${company.id}`, 'success');

      // Agora testar atualização via webhook
      const updateData = {
        name: company.name,
        contact_email: testEmail,
        contact_name: 'Maria Silva',
        stripe_customer_id: `cus_update_${Date.now()}`,
        stripe_subscription_id: `sub_update_${Date.now()}`,
        subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        max_collaborators: '10'
      };

      const { data: result, error: updateError } = await supabase
        .rpc('create_or_update_company_from_webhook', {
          company_data: updateData
        });

      if (updateError) {
        this.log(`❌ Erro ao atualizar empresa existente: ${updateError.message}`, 'error');
      } else {
        this.log(`✅ Empresa existente atualizada: ${JSON.stringify(result, null, 2)}`, 'success');
      }

      // Limpar dados de teste
      await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);

    } catch (error) {
      this.log(`Erro no teste de empresa existente: ${error.message}`, 'error');
    }
  }

  async checkTableConstraints() {
    this.log('🔒 Verificando constraints da tabela companies...');

    try {
      const { data: constraints, error } = await supabase
        .rpc('execute_sql', {
          query: `
            SELECT conname, contype, pg_get_constraintdef(oid) as definition 
            FROM pg_constraint 
            WHERE conrelid = 'public.companies'::regclass 
            AND contype = 'u'
          `
        });

      if (error) {
        this.log(`❌ Erro ao verificar constraints: ${error.message}`, 'error');
      } else {
        this.log('✅ Constraints encontradas:', 'success');
        constraints.forEach(constraint => {
          this.log(`  - ${constraint.conname}: ${constraint.definition}`);
        });
      }

    } catch (error) {
      this.log(`Erro ao verificar constraints: ${error.message}`, 'error');
    }
  }

  async simulateWebhookEvents() {
    this.log('🎭 Simulando eventos do webhook...');

    // Simular checkout.session.completed
    await this.simulateCheckoutCompleted();

    // Simular invoice.payment_succeeded
    await this.simulateInvoicePaymentSucceeded();
  }

  async simulateCheckoutCompleted() {
    this.log('📝 Simulando checkout.session.completed...');

    const sessionData = {
      id: 'cs_test_debug',
      customer: 'cus_debug_checkout',
      subscription: 'sub_debug_checkout',
      metadata: {
        company_name: 'Empresa Checkout Debug',
        contact_name: 'Debug User',
        contact_email: `checkout-debug-${Date.now()}@teste.com`,
        contact_phone: '(11) 88888-8888',
        cnpj: '98.765.432/0001-10',
        address: 'Av Debug, 456',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zip_code: '20000-000',
        plan_id: null,
        max_collaborators: '3',
        subscription_period: '30'
      }
    };

    try {
      // Preparar dados como no webhook real
      const companyData = {
        name: sessionData.metadata.company_name,
        contact_name: sessionData.metadata.contact_name,
        contact_email: sessionData.metadata.contact_email,
        contact_phone: sessionData.metadata.contact_phone,
        cnpj: sessionData.metadata.cnpj,
        address: sessionData.metadata.address,
        city: sessionData.metadata.city,
        state: sessionData.metadata.state,
        zip_code: sessionData.metadata.zip_code,
        plan_id: sessionData.metadata.plan_id,
        stripe_customer_id: sessionData.customer,
        stripe_subscription_id: sessionData.subscription,
        subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        max_collaborators: sessionData.metadata.max_collaborators
      };

      const { data: result, error } = await supabase
        .rpc('create_or_update_company_from_webhook', {
          company_data: companyData
        });

      if (error) {
        this.log(`❌ Erro no checkout.session.completed: ${error.message}`, 'error');
      } else {
        this.log(`✅ checkout.session.completed processado: ${JSON.stringify(result, null, 2)}`, 'success');
        
        // Limpar dados de teste
        await supabase
          .from('companies')
          .delete()
          .eq('contact_email', companyData.contact_email);
      }

    } catch (error) {
      this.log(`Erro na simulação do checkout: ${error.message}`, 'error');
    }
  }

  async simulateInvoicePaymentSucceeded() {
    this.log('💳 Simulando invoice.payment_succeeded...');

    // Primeiro criar uma empresa para testar
    const testEmail = `invoice-debug-${Date.now()}@teste.com`;
    const testSubscriptionId = `sub_invoice_${Date.now()}`;
    const testCustomerId = `cus_invoice_${Date.now()}`;

    try {
      // Criar empresa de teste
      const { data: company, error: createError } = await supabase
        .from('companies')
        .insert({
          name: 'Empresa Invoice Debug',
          contact_email: testEmail,
          contact_name: 'Invoice User',
          stripe_subscription_id: testSubscriptionId,
          stripe_customer_id: testCustomerId,
          subscription_status: 'incomplete'
        })
        .select()
        .single();

      if (createError) {
        this.log(`❌ Erro ao criar empresa para teste de invoice: ${createError.message}`, 'error');
        return;
      }

      this.log(`✅ Empresa criada para teste de invoice: ${company.id}`, 'success');

      // Simular invoice.payment_succeeded
      const { data: result, error } = await supabase
        .rpc('sync_company_with_stripe_webhook', {
          subscription_id: testSubscriptionId,
          customer_id: testCustomerId,
          status: 'active'
        });

      if (error) {
        this.log(`❌ Erro no invoice.payment_succeeded: ${error.message}`, 'error');
      } else {
        this.log(`✅ invoice.payment_succeeded processado: ${JSON.stringify(result, null, 2)}`, 'success');
      }

      // Limpar dados de teste
      await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);

    } catch (error) {
      this.log(`Erro na simulação do invoice: ${error.message}`, 'error');
    }
  }

  generateReport() {
    console.log('\n📊 RELATÓRIO DE DEBUG');
    console.log('=====================');
    
    const errors = this.testResults.filter(r => r.type === 'error');
    const successes = this.testResults.filter(r => r.type === 'success');
    
    console.log(`✅ Sucessos: ${successes.length}`);
    console.log(`❌ Erros: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n🔍 ERROS ENCONTRADOS:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`);
      });
      
      console.log('\n💡 POSSÍVEIS SOLUÇÕES:');
      console.log('1. Verificar se as funções RPC estão atualizadas');
      console.log('2. Verificar se há dados duplicados na tabela companies');
      console.log('3. Verificar se os metadados do Stripe estão sendo enviados corretamente');
      console.log('4. Verificar se há problemas de concorrência entre eventos');
    } else {
      console.log('\n🎉 Nenhum erro encontrado! O sistema parece estar funcionando corretamente.');
    }
  }
}

// Executar debug
if (require.main === module) {
  const webhookDebugger = new WebhookDebugger();
  webhookDebugger.debugWebhookError().catch(console.error);
}

module.exports = WebhookDebugger;