
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { messages, sessionId, lessonId, userId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    // Get AI configuration - first try to get a company-specific one, then global
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configurations')
      .select(`
        *,
        ai_providers (
          name,
          display_name,
          api_endpoint
        )
      `)
      .eq('is_active', true)
      .order('company_id', { ascending: false, nullsLast: false })
      .limit(1)
      .single();

    if (configError || !aiConfig) {
      console.error('No active AI configuration found:', configError);
      throw new Error('No AI configuration available');
    }

    console.log('Using AI configuration:', aiConfig.id, 'Provider:', aiConfig.ai_providers?.name);

    // Fetch lesson content and materials if lessonId is provided
    let lessonContext = '';
    if (lessonId) {
      console.log('Fetching lesson content for:', lessonId);
      
      // Get lesson details
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select(`
          id,
          title,
          content,
          module_id,
          course_modules (
            title,
            course_id,
            courses (
              title,
              description
            )
          )
        `)
        .eq('id', lessonId)
        .single();

      if (!lessonError && lesson) {
        console.log('Lesson found:', lesson.title);
        
        // Build lesson context
        const courseInfo = lesson.course_modules?.courses;
        const moduleInfo = lesson.course_modules;
        
        lessonContext += `\n=== CONTEXTO DA LIÇÃO ===\n`;
        if (courseInfo) {
          lessonContext += `Curso: ${courseInfo.title}\n`;
          if (courseInfo.description) {
            lessonContext += `Descrição do Curso: ${courseInfo.description}\n`;
          }
        }
        if (moduleInfo) {
          lessonContext += `Módulo: ${moduleInfo.title}\n`;
        }
        lessonContext += `Lição: ${lesson.title}\n`;
        
        if (lesson.content) {
          lessonContext += `\nConteúdo da Lição:\n${lesson.content}\n`;
        }

        // Get lesson materials
        const { data: materials, error: materialsError } = await supabase
          .from('lesson_materials')
          .select('file_name, extracted_content, file_type')
          .eq('lesson_id', lessonId);

        if (!materialsError && materials && materials.length > 0) {
          console.log('Found materials:', materials.length);
          lessonContext += `\n=== MATERIAIS DA LIÇÃO ===\n`;
          
          materials.forEach((material, index) => {
            lessonContext += `\nMaterial ${index + 1}: ${material.file_name} (${material.file_type})\n`;
            if (material.extracted_content) {
              lessonContext += `Conteúdo:\n${material.extracted_content}\n`;
            }
          });
        }
        
        lessonContext += `\n=== FIM DO CONTEXTO ===\n`;
      } else {
        console.log('Lesson not found or error:', lessonError);
      }
    }

    // Enhanced system prompt with lesson context
    let enhancedSystemPrompt = aiConfig.system_prompt;
    
    if (lessonContext) {
      enhancedSystemPrompt = `${aiConfig.system_prompt}

${lessonContext}

INSTRUÇÕES IMPORTANTES:
- Use APENAS as informações fornecidas no contexto da lição acima para responder perguntas específicas sobre o conteúdo.
- Se a pergunta for sobre o conteúdo da lição, cite especificamente as informações do contexto.
- Se a pergunta não puder ser respondida com as informações do contexto, informe que você precisa de mais informações sobre esse tópico específico.
- Seja didático e organize suas respostas de forma clara e estruturada.
- Quando apropriado, faça referência aos materiais específicos mencionados no contexto.`;
    }

    // Prepare the request based on the provider
    let apiResponse;
    
    if (aiConfig.ai_providers?.name === 'gemini') {
      // Gemini API format
      const apiKey = aiConfig.api_key_encrypted;
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const geminiMessages = messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const requestBody = {
        contents: geminiMessages,
        generationConfig: {
          temperature: aiConfig.temperature,
          maxOutputTokens: aiConfig.max_tokens,
        },
        systemInstruction: {
          parts: [{ text: enhancedSystemPrompt }]
        }
      };

      console.log('Sending request to Gemini with enhanced context');

      apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.model_name}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );
    } else {
      // OpenAI-compatible format (for other providers)
      const apiKey = aiConfig.api_key_encrypted;
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const requestBody = {
        model: aiConfig.model_name,
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          ...messages
        ],
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.max_tokens,
      };

      console.log('Sending request to OpenAI-compatible API with enhanced context');

      apiResponse = await fetch(aiConfig.ai_providers?.api_endpoint || 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    }

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('AI API Error:', errorText);
      throw new Error(`AI API request failed: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    let assistantMessage = '';

    // Parse response based on provider
    if (aiConfig.ai_providers?.name === 'gemini') {
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        assistantMessage = data.candidates[0].content.parts[0].text;
      } else {
        console.error('Invalid Gemini response:', data);
        throw new Error('Invalid response from Gemini API');
      }
    } else {
      // OpenAI format
      if (data.choices && data.choices[0] && data.choices[0].message) {
        assistantMessage = data.choices[0].message.content;
      } else {
        console.error('Invalid OpenAI response:', data);
        throw new Error('Invalid response from AI API');
      }
    }

    console.log('AI response generated successfully');

    // Save messages to database if sessionId is provided
    if (sessionId && userId) {
      // Save user message
      const userMessage = messages[messages.length - 1];
      await supabase.from('ai_chat_messages').insert({
        session_id: sessionId,
        role: 'user',
        content: userMessage.content
      });

      // Save assistant message
      await supabase.from('ai_chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: assistantMessage
      });

      // Update session data
      await supabase
        .from('ai_chat_sessions')
        .update({
          session_data: [...messages, { role: 'assistant', content: assistantMessage }],
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    }

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        model: aiConfig.model_name,
        provider: aiConfig.ai_providers?.display_name,
        hasLessonContext: !!lessonContext
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while processing your request' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
