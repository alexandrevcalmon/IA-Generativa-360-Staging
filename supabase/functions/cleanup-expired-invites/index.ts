import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    console.log('[cleanup-expired-invites] Starting cleanup of expired invites...')

    // Buscar usuários que foram convidados mas não confirmaram o email
    // e foram criados há mais de 7 dias
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: expiredUsers, error: fetchError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000
    })

    if (fetchError) {
      console.error('[cleanup-expired-invites] Error fetching users:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filtrar usuários que não confirmaram email e foram criados há mais de 7 dias
    const usersToCleanup = expiredUsers.users.filter(user => {
      const createdAt = new Date(user.created_at)
      return !user.email_confirmed_at && createdAt < sevenDaysAgo
    })

    console.log(`[cleanup-expired-invites] Found ${usersToCleanup.length} expired invites to cleanup`)

    let cleanedCount = 0
    for (const user of usersToCleanup) {
      try {
        console.log(`[cleanup-expired-invites] Cleaning up user: ${user.email}`)
        
        // Deletar o usuário do Supabase Auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
          console.error(`[cleanup-expired-invites] Error deleting user ${user.email}:`, deleteError)
          continue
        }

        // Limpar registros relacionados nas tabelas
        await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', user.id)

        await supabaseAdmin
          .from('company_users')
          .delete()
          .eq('auth_user_id', user.id)

        // Se for uma empresa, limpar também a tabela companies
        if (user.user_metadata?.role === 'company') {
          await supabaseAdmin
            .from('companies')
            .delete()
            .eq('auth_user_id', user.id)
        }

        cleanedCount++
        console.log(`[cleanup-expired-invites] Successfully cleaned up user: ${user.email}`)

      } catch (error) {
        console.error(`[cleanup-expired-invites] Error processing user ${user.email}:`, error)
      }
    }

    console.log(`[cleanup-expired-invites] Cleanup completed. ${cleanedCount} users cleaned up.`)

    return new Response(
      JSON.stringify({
        message: 'Cleanup completed',
        cleanedCount,
        totalFound: usersToCleanup.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[cleanup-expired-invites] Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 