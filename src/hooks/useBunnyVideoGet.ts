import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BunnyVideoInfo {
  videoId: string;
  title: string;
  status: string;
  embedUrl: string;
  libraryId?: string;
  duration?: number;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  size?: number;
  width?: number;
  height?: number;
  fps?: number;
  bitrate?: number;
}

export const useBunnyVideoGet = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getVideo = async (
    videoId: string,
    libraryId: string
  ): Promise<BunnyVideoInfo | null> => {
    try {
      setIsLoading(true);

      console.log('Buscando vídeo no Bunny.net:', { videoId, libraryId });

      const { data, error } = await supabase.functions.invoke('bunny-video-get', {
        body: {
          videoId,
          libraryId,
        },
      });

      if (error) {
        console.error('Erro na Edge Function:', error);
        throw new Error(`Erro ao buscar vídeo: ${error.message}`);
      }

      if (!data || !data.videoId || !data.embedUrl) {
        throw new Error('Vídeo não encontrado ou dados inválidos');
      }

      console.log('Vídeo encontrado:', data);

      toast({
        title: "Sucesso",
        description: `Vídeo "${data.title}" encontrado! Status: ${data.status}`,
      });

      return data as BunnyVideoInfo;
    } catch (error) {
      console.error('Get video error:', error);
      toast({
        title: "Erro",
        description: `Erro ao buscar vídeo: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getVideo,
    isLoading,
  };
}; 
