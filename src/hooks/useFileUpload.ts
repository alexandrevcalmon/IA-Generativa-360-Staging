
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileUploadOptions {
  bucket: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${Math.round(bytes / (1024 * 1024 * 1024) * 10) / 10}GB`;
    } else {
      return `${Math.round(bytes / (1024 * 1024))}MB`;
    }
  };

  const uploadFile = async (
    file: File,
    options: FileUploadOptions
  ): Promise<string | null> => {
    try {
      setIsUploading(true);

      // Validate file size
      if (options.maxSize && file.size > options.maxSize) {
        const maxSizeDisplay = formatFileSize(options.maxSize);
        
        toast({
          title: "Erro",
          description: `Arquivo muito grande. Tamanho máximo: ${maxSizeDisplay}`,
          variant: "destructive",
        });
        return null;
      }

      // Validate file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        toast({
          title: "Erro",
          description: "Tipo de arquivo não permitido",
          variant: "destructive",
        });
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      console.log('Uploading file:', fileName, 'to bucket:', options.bucket);

      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Erro",
          description: "Erro ao fazer upload do arquivo: " + error.message,
          variant: "destructive",
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      console.log('File uploaded successfully:', publicUrl);

      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso!",
      });

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao fazer upload",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (url: string, bucket: string): Promise<boolean> => {
    try {
      // Extract filename from URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    isUploading,
  };
};
