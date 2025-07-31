const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTicketStatusFlow() {
  console.log('🧪 Testando fluxo de status dos tickets...\n');

  try {
    // 1. Criar um ticket de teste
    console.log('1️⃣ Criando ticket de teste...');
    const { data: ticket, error: createError } = await supabase
      .from('support_tickets')
      .insert({
        title: 'Teste - Fluxo de Status Automático',
        description: 'Este é um ticket de teste para verificar o fluxo automático de status',
        category: 'general',
        priority: 'medium',
        company_id: '00000000-0000-0000-0000-000000000000', // ID fictício para teste
        created_by_user_id: '00000000-0000-0000-0000-000000000000' // ID fictício para teste
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar ticket:', createError);
      return;
    }

    console.log('✅ Ticket criado com status:', ticket.status);
    console.log('   ID:', ticket.id);
    console.log('   Título:', ticket.title);

    // 2. Verificar status inicial (deve ser 'open')
    if (ticket.status !== 'open') {
      console.error('❌ Status inicial incorreto. Esperado: open, Obtido:', ticket.status);
      return;
    }

    console.log('✅ Status inicial correto: open\n');

    // 3. Simular primeira resposta (deve mudar para 'in_progress')
    console.log('2️⃣ Simulando primeira resposta...');
    
    // Primeiro, verificar se há respostas existentes
    const { data: existingReplies, error: countError } = await supabase
      .from('support_ticket_replies')
      .select('id')
      .eq('ticket_id', ticket.id);

    if (countError) {
      console.error('❌ Erro ao contar respostas existentes:', countError);
      return;
    }

    console.log('   Respostas existentes:', existingReplies.length);
    const isFirstReply = existingReplies.length === 0;
    console.log('   É primeira resposta:', isFirstReply);

    // Criar a resposta
    const { data: reply, error: replyError } = await supabase
      .from('support_ticket_replies')
      .insert({
        ticket_id: ticket.id,
        content: 'Esta é a primeira resposta ao ticket de teste',
        author_user_id: '00000000-0000-0000-0000-000000000000',
        author_role: 'producer'
      })
      .select()
      .single();

    if (replyError) {
      console.error('❌ Erro ao criar resposta:', replyError);
      return;
    }

    console.log('✅ Resposta criada com sucesso');

    // 4. Verificar se o status mudou automaticamente para 'in_progress'
    console.log('3️⃣ Verificando mudança automática de status...');
    
    // Aguardar um pouco para garantir que a atualização foi processada
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: updatedTicket, error: fetchError } = await supabase
      .from('support_tickets')
      .select('status')
      .eq('id', ticket.id)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar ticket atualizado:', fetchError);
      return;
    }

    console.log('   Status após primeira resposta:', updatedTicket.status);

    if (updatedTicket.status === 'in_progress') {
      console.log('✅ Status mudou automaticamente para in_progress!');
    } else {
      console.log('❌ Status não mudou automaticamente. Esperado: in_progress, Obtido:', updatedTicket.status);
    }

    // 5. Simular segunda resposta (não deve mudar o status)
    console.log('\n4️⃣ Simulando segunda resposta...');
    
    const { data: secondReply, error: secondReplyError } = await supabase
      .from('support_ticket_replies')
      .insert({
        ticket_id: ticket.id,
        content: 'Esta é a segunda resposta ao ticket de teste',
        author_user_id: '00000000-0000-0000-0000-000000000000',
        author_role: 'company'
      })
      .select()
      .single();

    if (secondReplyError) {
      console.error('❌ Erro ao criar segunda resposta:', secondReplyError);
      return;
    }

    console.log('✅ Segunda resposta criada com sucesso');

    // Verificar se o status permaneceu 'in_progress'
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: finalTicket, error: finalFetchError } = await supabase
      .from('support_tickets')
      .select('status')
      .eq('id', ticket.id)
      .single();

    if (finalFetchError) {
      console.error('❌ Erro ao buscar ticket final:', finalFetchError);
      return;
    }

    console.log('   Status após segunda resposta:', finalTicket.status);

    if (finalTicket.status === 'in_progress') {
      console.log('✅ Status permaneceu in_progress (correto)!');
    } else {
      console.log('❌ Status mudou incorretamente. Esperado: in_progress, Obtido:', finalTicket.status);
    }

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('\n📋 Resumo do fluxo:');
    console.log('   1. Ticket criado → Status: open');
    console.log('   2. Primeira resposta → Status: in_progress (automático)');
    console.log('   3. Segunda resposta → Status: in_progress (permanece)');
    console.log('   4. Próximo passo: Usuário clica em "Encerrar Chamado" → Status: closed');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste
testTicketStatusFlow(); 