import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StatusRequest {
  videoId: string;
  libraryId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoId, libraryId }: StatusRequest = await req.json()
    const apiKey = Deno.env.get('BUNNY_STREAM_API_KEY')

    if (!apiKey) {
      throw new Error('Bunny.net API key não configurada')
    }

    if (!videoId || !libraryId) {
      throw new Error('Video ID e Library ID são obrigatórios')
    }

    console.log('Verificando status do vídeo:', { videoId, libraryId })

    // Buscar informações do vídeo no Bunny.net
    const videoResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: 'GET',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text()
      console.error('Erro ao buscar vídeo no Bunny.net:', errorText)
      throw new Error(`Falha ao buscar vídeo no Bunny.net: ${videoResponse.status}`)
    }

    const videoData = await videoResponse.json()
    
    // Mapear status do Bunny.net para nosso sistema
    let status: 'pending' | 'processing' | 'ready' | 'error' = 'pending'
    
    if (videoData.status === 'encoded') {
      status = 'ready'
    } else if (videoData.status === 'processing') {
      status = 'processing'
    } else if (videoData.status === 'error') {
      status = 'error'
    }

    console.log('Status do vídeo:', status)

    return new Response(
      JSON.stringify({
        status,
        videoData,
        embedUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 