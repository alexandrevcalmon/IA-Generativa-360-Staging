import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Video, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { useBunnyVideoUpload } from '@/hooks/useBunnyVideoUpload';
import { useBunnyVideoGet } from '@/hooks/useBunnyVideoGet';
import { useToast } from '@/hooks/use-toast';

interface BunnyVideoUploadFieldProps {
  onChange: (videoId: string | null, embedUrl: string | null) => void;
  onVideoInfoReceived?: (durationInSeconds: number) => void;
  className?: string;
}

export const BunnyVideoUploadField: React.FC<BunnyVideoUploadFieldProps> = ({
  onChange,
  onVideoInfoReceived,
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    videoId: string;
    embedUrl: string;
    status: string;
  } | null>(null);
  
  const { uploadVideo } = useBunnyVideoUpload();
  const { getVideo } = useBunnyVideoGet();
  const { toast } = useToast();
  
  const libraryId = import.meta.env.VITE_BUNNY_LIBRARY_ID;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      console.log('Iniciando upload do vídeo:', file.name);
      
      const result = await uploadVideo(file);
      
      if (result.videoId && result.embedUrl) {
        console.log('Upload concluído:', result);
        setVideoInfo({
          videoId: result.videoId,
          embedUrl: result.embedUrl,
          status: result.status || 'uploaded'
        });
        
        onChange(result.videoId, result.embedUrl);
        
        // Buscar informações detalhadas do vídeo para obter a duração
        if (result.videoId && libraryId) {
          try {
            const videoDetails = await getVideo(result.videoId, libraryId);
            if (videoDetails && videoDetails.duration) {
              console.log('Duração do vídeo obtida:', videoDetails.duration);
              onVideoInfoReceived?.(videoDetails.duration);
            }
          } catch (detailError) {
            console.warn('Erro ao buscar detalhes do vídeo:', detailError);
          }
        }
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setError(error.message);
      onChange(null, null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setVideoInfo(null);
    setError(null);
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-900/20 text-green-400 border-green-800';
      case 'processing':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-800';
      case 'error':
        return 'bg-red-900/20 text-red-400 border-red-800';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-800';
    }
  };

  return (
    <Card className={`bg-gray-800/50 border-gray-600 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-400" />
          Upload de Vídeo - Bunny.net
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!videoInfo ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-300">
              Faça upload direto para o Bunny.net para melhor performance e CDN global.
            </div>
            
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <Label htmlFor="video-upload" className="text-gray-300 cursor-pointer">
                Clique para selecionar um vídeo
              </Label>
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                disabled={uploading}
              />
              <p className="text-xs text-gray-400 mt-2">
                Formatos: MP4, WebM, OGG, AVI, MOV. Máx: 512MB
              </p>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Fazendo upload...</span>
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-2">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-green-400" />
                <span className="text-white font-medium">Vídeo enviado com sucesso!</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-gray-700/50 rounded p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">ID:</span>
                <code className="text-green-400 text-sm">{videoInfo.videoId}</code>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">Status:</span>
                <Badge className={getStatusColor(videoInfo.status)}>
                  {getStatusIcon(videoInfo.status)}
                  <span className="ml-1 capitalize">{videoInfo.status}</span>
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
