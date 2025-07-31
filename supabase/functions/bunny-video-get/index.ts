import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GetVideoRequest {
  videoId: string;
  libraryId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('Request body received')
    
    const { videoId, libraryId } = body as GetVideoRequest
    
    // Validações
    if (!videoId) {
      throw new Error('videoId é obrigatório')
    }
    if (!libraryId) {
      throw new Error('libraryId é obrigatório')
    }

    const apiKey = Deno.env.get('BUNNY_STREAM_API_KEY')
    console.log('API Key exists:', !!apiKey)
    console.log('Video ID:', videoId)
    console.log('Library ID:', libraryId)

    if (!apiKey) {
      throw new Error('BUNNY_STREAM_API_KEY não configurada')
    }

    console.log('Buscando vídeo no Bunny.net:', { videoId, libraryId })

    // Buscar vídeo no Bunny.net
    const getVideoResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: 'GET',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('Bunny.net response status:', getVideoResponse.status)

    if (!getVideoResponse.ok) {
      const errorText = await getVideoResponse.text()
      console.error('Erro ao buscar vídeo no Bunny.net:', errorText)
      throw new Error(`Falha ao buscar vídeo no Bunny.net: ${getVideoResponse.status} - ${errorText}`)
    }

    const videoData = await getVideoResponse.json()
    console.log('Video data from Bunny.net:', videoData)
    console.log('Duration from Bunny.net:', videoData.duration)
    console.log('Type of duration:', typeof videoData.duration)
    
    // Mapear status do Bunny.net para nosso sistema
    let status = 'unknown'
    if (videoData.encoded) {
      status = 'ready'
    } else if (videoData.processing) {
      status = 'processing'
    } else if (videoData.error) {
      status = 'error'
    } else {
      status = 'pending'
    }

    // Gerar URL de embed
    const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`

    const response = {
      videoId: videoData.guid,
      title: videoData.title,
      status: status,
      embedUrl: embedUrl,
      libraryId: libraryId,
      duration: videoData.duration,
      thumbnailUrl: videoData.thumbnail,
      createdAt: videoData.dateCreated,
      updatedAt: videoData.dateUpdated,
      size: videoData.size,
      width: videoData.width,
      height: videoData.height,
      fps: videoData.fps,
      bitrate: videoData.bitrate,
    }

    console.log('Response:', response)
    console.log('Duration in response:', response.duration)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in bunny-video-get:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 