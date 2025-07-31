import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Support tickets function called')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      console.log('No user found')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User authenticated:', user.id)
    const { action, ...params } = await req.json()
    console.log('Action:', action, 'Params:', params)

    switch (action) {
      case 'create_ticket':
        return await handleCreateTicket(supabaseClient, user, params)
      case 'get_tickets':
        return await handleGetTickets(supabaseClient, user, params)
      case 'get_ticket':
        return await handleGetTicket(supabaseClient, user, params)
      case 'update_ticket':
        return await handleUpdateTicket(supabaseClient, user, params)
      case 'create_reply':
        return await handleCreateReply(supabaseClient, user, params)
      case 'get_notifications':
        return await handleGetNotifications(supabaseClient, user, params)
          case 'mark_notification_read':
      return await handleMarkNotificationRead(supabaseClient, user, params)
    case 'fix_old_tickets':
      return await handleFixOldTickets(supabaseClient, user, params)
    default:
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
  }
  } catch (error) {
    console.error('Error in support-tickets function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleCreateTicket(supabaseClient: any, user: any, params: any) {
  console.log('Creating ticket with params:', params)
  const { title, description, category, priority, company_id } = params

  if (!title || !description || !category || !priority || !company_id) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { data, error } = await supabaseClient
      .from('support_tickets')
      .insert({
        title,
        description,
        category,
        priority,
        company_id,
        created_by_user_id: user.id,
        status: 'open'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Ticket created successfully:', data)
    
    // Criar notificação para produtores
    try {
      const { error: notificationError } = await supabaseClient
        .from('support_ticket_notifications')
        .insert({
          ticket_id: data.id,
          user_id: 'ec3a5740-86c6-4995-b7af-7dfcdbf4600c', // ID do produtor ativo
          notification_type: 'new_ticket'
        });
      
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      } else {
        console.log('Notification created successfully');
      }
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }
    
    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating ticket:', error)
    throw error
  }
}

async function handleGetTickets(supabaseClient: any, user: any, params: any) {
  console.log('Getting tickets with params:', params)
  console.log('User context:', { id: user?.id, email: user?.email })
  const { company_id, status, category, limit = 50, offset = 0 } = params

  try {
    let query = supabaseClient
      .from('support_tickets')
      .select(`
        *,
        company:companies(name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (company_id) query = query.eq('company_id', company_id)
    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category', category)

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Tickets retrieved successfully:', data?.length || 0)
    
    // Buscar contagem de respostas e notificações usando queries diretas
    const ticketsWithCounts = await Promise.all(
      data.map(async (ticket) => {
        try {
          console.log(`Processing ticket ${ticket.id}...`);
          
          // Buscar respostas diretamente
          console.log(`Fetching replies for ticket ${ticket.id}...`);
          const { data: repliesData, error: repliesError } = await supabaseClient
            .from('support_ticket_replies')
            .select('id')
            .eq('ticket_id', ticket.id);
          
          console.log(`Replies query result for ${ticket.id}:`, { 
            data: repliesData, 
            error: repliesError,
            count: repliesData?.length || 0
          });
          
          if (repliesError) {
            console.error(`Error fetching replies for ticket ${ticket.id}:`, repliesError);
          }
          
          // Buscar notificações diretamente
          console.log(`Fetching notifications for ticket ${ticket.id}...`);
          const { data: notificationsData, error: notificationsError } = await supabaseClient
            .from('support_ticket_notifications')
            .select('id')
            .eq('ticket_id', ticket.id);
          
          console.log(`Notifications query result for ${ticket.id}:`, { 
            data: notificationsData, 
            error: notificationsError,
            count: notificationsData?.length || 0
          });
          
          if (notificationsError) {
            console.error(`Error fetching notifications for ticket ${ticket.id}:`, notificationsError);
          }
          
          const replyCount = repliesData?.length || 0;
          const notificationCount = notificationsData?.length || 0;
          
          console.log(`Ticket ${ticket.id}: ${replyCount} replies, ${notificationCount} notifications`);
          
          const ticketWithCount = {
            ...ticket,
            _count: {
              replies: replyCount,
              notifications: notificationCount
            }
          };
          
          console.log(`Ticket ${ticket.id} final _count:`, ticketWithCount._count);
          
          return ticketWithCount;
        } catch (error) {
          console.error(`Error processing ticket ${ticket.id}:`, error);
          // Em caso de erro, retornar o ticket com contadores zerados
          return {
            ...ticket,
            _count: {
              replies: 0,
              notifications: 0
            }
          };
        }
      })
    );
    
    console.log('Tickets with updated counts:', ticketsWithCounts.length);
    
    return new Response(
      JSON.stringify({ data: ticketsWithCounts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting tickets:', error)
    throw error
  }
}

async function handleGetTicket(supabaseClient: any, user: any, params: any) {
  console.log('Getting ticket with params:', params)
  const { ticket_id } = params

  if (!ticket_id) {
    return new Response(
      JSON.stringify({ error: 'Missing ticket_id' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Primeiro, buscar o ticket básico
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('support_tickets')
      .select(`
        *,
        company:companies(name)
      `)
      .eq('id', ticket_id)
      .single()

    if (ticketError) {
      console.error('Error fetching ticket:', ticketError)
      throw ticketError
    }

    if (!ticket) {
      return new Response(
        JSON.stringify({ error: 'Ticket not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Ticket found:', ticket.id)

    // Buscar respostas separadamente com mais detalhes
    const { data: replies, error: repliesError } = await supabaseClient
      .from('support_ticket_replies')
      .select(`
        id,
        ticket_id,
        content,
        author_user_id,
        author_role,
        created_at,
        updated_at
      `)
      .eq('ticket_id', ticket_id)
      .order('created_at', { ascending: true })

    if (repliesError) {
      console.error('Error fetching replies:', repliesError)
      // Não falhar se não conseguir buscar respostas
    }

    console.log('Replies found:', replies?.length || 0)

    // Buscar anexos separadamente
    const { data: attachments, error: attachmentsError } = await supabaseClient
      .from('support_ticket_attachments')
      .select('*')
      .eq('ticket_id', ticket_id)

    if (attachmentsError) {
      console.error('Error fetching attachments:', attachmentsError)
      // Não falhar se não conseguir buscar anexos
    }

    // Combinar os dados
    const result = {
      ...ticket,
      replies: replies || [],
      attachments: attachments || []
    }

    console.log('Ticket retrieved successfully with', result.replies.length, 'replies')
    return new Response(
      JSON.stringify({ data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting ticket:', error)
    throw error
  }
}

async function handleUpdateTicket(supabaseClient: any, user: any, params: any) {
  console.log('Updating ticket with params:', params)
  const { ticket_id, updates } = params

  if (!ticket_id || !updates) {
    return new Response(
      JSON.stringify({ error: 'Missing ticket_id or updates' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { data, error } = await supabaseClient
      .from('support_tickets')
      .update(updates)
      .eq('id', ticket_id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Ticket updated successfully')
    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error updating ticket:', error)
    throw error
  }
}

async function handleCreateReply(supabaseClient: any, user: any, params: any) {
  console.log('Creating reply with params:', params)
  const { ticket_id, content, author_role } = params

  if (!ticket_id || !content || !author_role) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Criar a resposta (o trigger se encarregará de atualizar o status do ticket)
    const { data, error } = await supabaseClient
      .from('support_ticket_replies')
      .insert({
        ticket_id,
        content,
        author_user_id: user.id,
        author_role
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Reply created successfully')
    
    // Criar notificação para o criador do ticket
    try {
      // Buscar o ticket para obter o criador
      const { data: ticket, error: ticketError } = await supabaseClient
        .from('support_tickets')
        .select('created_by_user_id')
        .eq('id', ticket_id)
        .single();
      
      if (!ticketError && ticket) {
        const { error: notificationError } = await supabaseClient
          .from('support_ticket_notifications')
          .insert({
            ticket_id: ticket_id,
            user_id: ticket.created_by_user_id,
            notification_type: 'ticket_reply'
          });
        
        if (notificationError) {
          console.error('Error creating reply notification:', notificationError);
        } else {
          console.log('Reply notification created successfully');
        }
      }
    } catch (notificationError) {
      console.error('Error creating reply notification:', notificationError);
    }
    
    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating reply:', error)
    throw error
  }
}

async function handleGetNotifications(supabaseClient: any, user: any, params: any) {
  console.log('Getting notifications with params:', params)
  const { limit = 20 } = params

  try {
    const { data, error } = await supabaseClient
      .from('support_ticket_notifications')
      .select(`
        *,
        ticket:support_tickets(title, status)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Notifications retrieved successfully:', data?.length || 0)
    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error getting notifications:', error)
    throw error
  }
}

async function handleMarkNotificationRead(supabaseClient: any, user: any, params: any) {
  console.log('Marking notification as read with params:', params)
  const { notification_id } = params

  if (!notification_id) {
    return new Response(
      JSON.stringify({ error: 'Missing notification_id' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { data, error } = await supabaseClient
      .from('support_ticket_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notification_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Notification marked as read successfully')
    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

async function handleFixOldTickets(supabaseClient: any, user: any, params: any) {
  console.log('Fixing old tickets with open status but have replies')
  
  try {
    // Buscar todos os tickets com status "open" que têm respostas
    const { data: ticketsToFix, error: queryError } = await supabaseClient
      .from('support_tickets')
      .select(`
        id,
        status,
        replies:support_ticket_replies(count)
      `)
      .eq('status', 'open');

    if (queryError) {
      console.error('Error querying tickets to fix:', queryError);
      throw queryError;
    }

    console.log('Found tickets to check:', ticketsToFix?.length || 0);

    let fixedCount = 0;
    const errors = [];

    // Verificar cada ticket e corrigir se necessário
    for (const ticket of ticketsToFix || []) {
      if (ticket.replies && ticket.replies.length > 0) {
        console.log(`Fixing ticket ${ticket.id} - has ${ticket.replies.length} replies`);
        
        const { error: updateError } = await supabaseClient
          .from('support_tickets')
          .update({ 
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', ticket.id);

        if (updateError) {
          console.error(`Error fixing ticket ${ticket.id}:`, updateError);
          errors.push({ ticketId: ticket.id, error: updateError });
        } else {
          fixedCount++;
          console.log(`Successfully fixed ticket ${ticket.id}`);
        }
      }
    }

    console.log(`Fixed ${fixedCount} tickets, ${errors.length} errors`);
    
    return new Response(
      JSON.stringify({ 
        data: { 
          fixedCount, 
          errorCount: errors.length, 
          errors 
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fixing old tickets:', error)
    throw error
  }
} 