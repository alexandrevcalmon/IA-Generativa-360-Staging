import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UploadRequest {
  fileName: string;
  fileSize: number;
  title: string;
  libraryId: string;
  fileData: string; // Base64 encoded file data
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('Request body received')
    
    const { fileName, fileSize, title, libraryId, fileData } = body as UploadRequest
    
    // Validações
    if (!fileName) {
      throw new Error('fileName é obrigatório')
    }
    if (!fileSize) {
      throw new Error('fileSize é obrigatório')
    }
    if (!title) {
      throw new Error('title é obrigatório')
    }
    if (!libraryId) {
      throw new Error('libraryId é obrigatório')
    }
    if (!fileData) {
      throw new Error('fileData é obrigatório')
    }

    const apiKey = Deno.env.get('BUNNY_STREAM_API_KEY')
    console.log('API Key exists:', !!apiKey)
    console.log('Library ID:', libraryId)

    if (!apiKey) {
      throw new Error('BUNNY_STREAM_API_KEY não configurada')
    }

    console.log('Criando vídeo no Bunny.net:', { fileName, fileSize, title, libraryId })

    // Criar vídeo no Bunny.net
    const createVideoResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: 'POST',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
        }),
      }
    )

    console.log('Bunny.net response status:', createVideoResponse.status)

    if (!createVideoResponse.ok) {
      const errorText = await createVideoResponse.text()
      console.error('Erro ao criar vídeo no Bunny.net:', errorText)
      throw new Error(`Falha ao criar vídeo no Bunny.net: ${createVideoResponse.status} - ${errorText}`)
    }

    const videoData = await createVideoResponse.json()
    console.log('Video data from Bunny.net:', videoData)
    
    const videoId = videoData.guid

    if (!videoId) {
      throw new Error('Video ID não retornado pelo Bunny.net')
    }

    console.log('Vídeo criado com sucesso:', videoId)

    // Converter base64 para buffer
    const fileBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0))

    // Upload do arquivo diretamente na Edge Function
    console.log('Fazendo upload do arquivo...')
    const uploadResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: 'PUT',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/octet-stream',
        },
        body: fileBuffer,
      }
    )

    console.log('Upload response status:', uploadResponse.status)

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Erro no upload do arquivo:', errorText)
      throw new Error(`Falha no upload do arquivo: ${uploadResponse.status} - ${errorText}`)
    }

    console.log('Upload concluído com sucesso')

    // Gerar URL de embed
    const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`

    const response = {
      videoId,
      embedUrl,
      status: 'uploaded'
    }

    console.log('Response:', response)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in bunny-video-upload:', error)
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