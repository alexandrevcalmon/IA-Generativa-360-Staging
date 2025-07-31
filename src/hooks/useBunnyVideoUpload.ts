import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BunnyVideoUploadOptions {
  libraryId: string;
  title: string;
}

export interface BunnyVideoResult {
  videoId: string;
  embedUrl: string;
  status: string;
}

export const useBunnyVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadVideo = async (
    file: File,
    options: BunnyVideoUploadOptions
  ): Promise<BunnyVideoResult | null> => {
    try {
      setIsUploading(true);

      console.log('Iniciando upload para Bunny.net:', {
        fileName: file.name,
        fileSize: file.size,
        title: options.title,
        libraryId: options.libraryId
      });

      // Converter arquivo para base64
      const fileBuffer = await file.arrayBuffer();
      const fileData = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

      // Chamar Edge Function para upload via Bunny.net
      const { data, error } = await supabase.functions.invoke('bunny-video-upload', {
        body: {
          fileName: file.name,
          fileSize: file.size,
          title: options.title,
          libraryId: options.libraryId,
          fileData: fileData,
        },
      });

      if (error) {
        console.error('Erro na Edge Function:', error);
        throw new Error(`Erro ao fazer upload: ${error.message}`);
      }

      if (!data || !data.videoId || !data.embedUrl) {
        throw new Error('Resposta inválida da Edge Function');
      }

      console.log('Upload concluído com sucesso');

      toast({
        title: "Sucesso",
        description: "Vídeo enviado com sucesso! Aguardando processamento...",
      });

      return {
        videoId: data.videoId,
        embedUrl: data.embedUrl,
        status: data.status,
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: `Erro ao fazer upload do vídeo: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const checkVideoStatus = async (
    videoId: string,
    libraryId: string
  ): Promise<{ status: string; embedUrl?: string } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('bunny-video-status', {
        body: { videoId, libraryId },
      });

      if (error) {
        console.error('Erro ao verificar status:', error);
        return null;
      }

      return {
        status: data.status,
        embedUrl: data.embedUrl,
      };
    } catch (error) {
      console.error('Erro ao verificar status do vídeo:', error);
      return null;
    }
  };

  return {
    uploadVideo,
    checkVideoStatus,
    isUploading,
  };
}; 
