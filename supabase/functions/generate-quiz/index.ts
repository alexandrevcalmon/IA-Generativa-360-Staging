import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Payload recebido:', body);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { content, type, lessonId, moduleId, numQuestions = 5 } = body;

    if (!content || typeof content !== 'string') {
      throw new Error('Content (texto da aula/módulo) é obrigatório');
    }

    // Buscar configuração ativa de IA
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configurations')
      .select(`*, ai_providers (name, display_name, api_endpoint)`)
      .eq('is_active', true)
      .order('company_id', { ascending: false, nullsLast: false })
      .limit(1)
      .single();

    if (configError || !aiConfig) {
      throw new Error('Nenhuma configuração de IA ativa encontrada');
    }

    // Montar prompt para geração de quiz
    const prompt = `Gere ${numQuestions} perguntas de múltipla escolha sobre o seguinte conteúdo. Para cada pergunta, forneça 4 alternativas e indique a correta. Responda em JSON: [{"pergunta":..., "alternativas":[...], "correta":...}].\n\nCONTEÚDO:\n${content}`;

    let apiResponse;
    let questions = [];

    if (aiConfig.ai_providers?.name === 'gemini') {
      const apiKey = aiConfig.api_key_encrypted;
      if (!apiKey) throw new Error('Gemini API key não configurada');
      const requestBody = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: aiConfig.temperature,
          maxOutputTokens: aiConfig.max_tokens,
        },
        systemInstruction: {
          parts: [{ text: aiConfig.system_prompt }]
        }
      };
      apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.model_name}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );
      const result = await apiResponse.json();
      // Extrair JSON do texto retornado
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      try {
        questions = JSON.parse(text.match(/\[.*\]/s)?.[0] || '[]');
      } catch (e) {
        throw new Error('Erro ao extrair perguntas do retorno da IA');
      }
    } else {
      // OpenAI ou compatível
      const apiKey = aiConfig.api_key_encrypted;
      if (!apiKey) throw new Error('API key não configurada');
      const requestBody = {
        model: aiConfig.model_name,
        messages: [
          { role: 'system', content: aiConfig.system_prompt },
          { role: 'user', content: prompt }
        ],
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.max_tokens,
      };
      apiResponse = await fetch(aiConfig.ai_providers?.api_endpoint || 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const result = await apiResponse.json();
      const text = result.choices?.[0]?.message?.content || '';
      try {
        questions = JSON.parse(text.match(/\[.*\]/s)?.[0] || '[]');
      } catch (e) {
        throw new Error('Erro ao extrair perguntas do retorno da IA');
      }
    }

    // Logar tentativa (opcional)
    await supabase.from('quiz_generation_logs').insert({
      lesson_id: lessonId || null,
      module_id: moduleId || null,
      provider: aiConfig.ai_providers?.name,
      model: aiConfig.model_name,
      num_questions: numQuestions,
      success: questions.length > 0,
      created_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Erro interno na função generate-quiz:', err);
    return new Response(JSON.stringify({ error: 'Erro interno', details: err.message }), { status: 500, headers: corsHeaders });
  }
}); 