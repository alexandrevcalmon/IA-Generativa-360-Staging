import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[create-collaborator] Function invoked. Method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('[create-collaborator] Handling OPTIONS request.');
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('[DEBUG] Teste 1: Função iniciada');

  try {
    console.log('[DEBUG] Teste 2: Tentando ler variáveis de ambiente');
    const envVars = Deno.env.toObject();
    console.log('[DEBUG] Todas variáveis de ambiente:', envVars);
    console.log('[DEBUG] Teste 3: Variáveis de ambiente lidas com sucesso');
  } catch (e) {
    console.error('[DEBUG] Erro ao logar todas variáveis de ambiente:', e);
    console.log('[DEBUG] Teste 3: Erro ao ler variáveis de ambiente');
  }

  let requestBody;
  try {
    console.log('[DEBUG] Teste 4: Tentando fazer parse do JSON');
    requestBody = await req.json();
    console.log('[DEBUG] Request body:', requestBody);
    console.log('[DEBUG] Teste 5: JSON parseado com sucesso');
  } catch (e: any) {
    console.error('[create-collaborator] Error parsing request body:', e.message);
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }

  console.log('[DEBUG] Teste 6: Request body extraído com sucesso');

  console.log('[create-collaborator] Process completed successfully');
  return new Response(JSON.stringify({ 
    data: { 
      id: 'test-id',
      name: 'Test',
      email: 'test@test.com',
      company_id: 'test-company',
      position: 'test-position'
    }, 
    isReactivation: false, 
    isNewAuthUser: false,
    invitationSent: false,
    needsCompleteRegistration: true
  }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

});
