import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { companyId } = await req.json()

    if (!companyId) {
      return new Response(
        JSON.stringify({ error: 'companyId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`[cleanup-deleted-company] Cleaning up metadata for company: ${companyId}`)

    // Find all users associated with this company
    const { data: companyUsers, error: companyUsersError } = await supabaseAdmin
      .from('company_users')
      .select('auth_user_id')
      .eq('company_id', companyId)

    if (companyUsersError) {
      console.error('[cleanup-deleted-company] Error fetching company users:', companyUsersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch company users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!companyUsers || companyUsers.length === 0) {
      console.log(`[cleanup-deleted-company] No users found for company: ${companyId}`)
      return new Response(
        JSON.stringify({ message: 'No users found for this company' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Clean up metadata for each user
    const cleanupPromises = companyUsers.map(async ({ auth_user_id }) => {
      if (!auth_user_id) return

      try {
        // Get current user metadata
        const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(auth_user_id)
        
        if (userError || !user.user) {
          console.error(`[cleanup-deleted-company] Error fetching user ${auth_user_id}:`, userError)
          return
        }

        // Remove company-related metadata
        const updatedMetadata = {
          ...user.user.user_metadata,
          role: 'student', // Reset to default role
          company_id: null,
          company_name: null
        }

        // Update user metadata
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          auth_user_id,
          { user_metadata: updatedMetadata }
        )

        if (updateError) {
          console.error(`[cleanup-deleted-company] Error updating user ${auth_user_id}:`, updateError)
        } else {
          console.log(`[cleanup-deleted-company] Successfully cleaned metadata for user: ${auth_user_id}`)
        }

        // Update profile table
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            role: 'student',
            updated_at: new Date().toISOString()
          })
          .eq('id', auth_user_id)

        if (profileError) {
          console.error(`[cleanup-deleted-company] Error updating profile for user ${auth_user_id}:`, profileError)
        }

      } catch (error) {
        console.error(`[cleanup-deleted-company] Error processing user ${auth_user_id}:`, error)
      }
    })

    await Promise.all(cleanupPromises)

    console.log(`[cleanup-deleted-company] Cleanup completed for company: ${companyId}`)

    return new Response(
      JSON.stringify({ 
        message: 'Company cleanup completed',
        usersProcessed: companyUsers.length 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[cleanup-deleted-company] Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 