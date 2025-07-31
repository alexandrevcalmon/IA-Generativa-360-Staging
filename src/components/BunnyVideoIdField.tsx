import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Video, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import { useBunnyVideoGet, BunnyVideoInfo } from '@/hooks/useBunnyVideoGet';
import { useToast } from '@/hooks/use-toast';

interface BunnyVideoIdFieldProps {
  value?: string;
  onChange: (videoInfo: BunnyVideoInfo | null) => void;
  onVideoInfoReceived?: (durationInSeconds: number) => void;
  libraryId: string;
  disabled?: boolean;
}

export const BunnyVideoIdField: React.FC<BunnyVideoIdFieldProps> = ({
  value,
  onChange,
  onVideoInfoReceived,
  libraryId,
  disabled = false,
}) => {
  const [videoId, setVideoId] = useState(value || '');
  const [videoInfo, setVideoInfo] = useState<BunnyVideoInfo | null>(null);
  const { getVideo, isLoading } = useBunnyVideoGet();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!videoId.trim() || !libraryId) {
      toast({
        title: "Erro",
        description: "Por favor, insira um ID de vídeo válido",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Buscando vídeo...",
      description: `Buscando vídeo com ID: ${videoId.trim()}`,
    });

    try {
      const result = await getVideo(videoId.trim(), libraryId);
      
      console.log('Resultado da busca do vídeo:', result);
      console.log('Duração do vídeo:', result?.duration);
      console.log('Tipo da duração:', typeof result?.duration);
      
      if (result) {
        setVideoInfo(result);
        onChange(result);
        
        // Passar a duração do vídeo se disponível
        if (result.duration) {
          console.log('Chamando onVideoInfoReceived com duração:', result.duration);
          onVideoInfoReceived?.(result.duration);
        } else {
          console.log('Duração não disponível no resultado');
        }
      } else {
        toast({
          title: "Vídeo não encontrado",
          description: `Vídeo com ID ${videoId.trim()} não encontrado.`,
          variant: "destructive",
        });
        onChange(null);
      }
    } catch (error: any) {
      console.error('Erro ao buscar vídeo:', error);
      toast({
        title: "Erro ao buscar vídeo",
        description: error.message || 'Erro ao buscar vídeo',
        variant: "destructive",
      });
      onChange(null);
    }
  };

  const handleRemove = () => {
    setVideoId('');
    setVideoInfo(null);
    onChange(null);
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="video-id" className="text-sm font-medium text-gray-300">ID do Vídeo no Bunny.net</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="video-id"
              placeholder="Cole o ID do vídeo aqui..."
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              disabled={disabled || isLoading}
              className="bg-gray-800/50 border-gray-600 text-gray-300 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              type="button"
              onClick={handleSearch}
              disabled={disabled || isLoading || !videoId.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {videoInfo && (
        <Card className="border-green-800/50 bg-green-900/10 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-200">
                <Video className="h-4 w-4 text-green-400" />
                Vídeo Encontrado
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(videoInfo.status)} border`}>
                {getStatusIcon(videoInfo.status)}
                {videoInfo.status === 'ready' && 'Pronto'}
                {videoInfo.status === 'processing' && 'Processando'}
                {videoInfo.status === 'error' && 'Erro'}
                {videoInfo.status === 'pending' && 'Pendente'}
              </Badge>
            </div>
            
            <div>
              <p className="font-medium text-sm text-gray-200">{videoInfo.title}</p>
              <p className="text-xs text-gray-500">ID: {videoInfo.videoId}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div>Duração: {formatDuration(videoInfo.duration)}</div>
              <div>Tamanho: {formatFileSize(videoInfo.size)}</div>
              {videoInfo.width && videoInfo.height && (
                <div>Resolução: {videoInfo.width}x{videoInfo.height}</div>
              )}
              {videoInfo.fps && (
                <div>FPS: {videoInfo.fps}</div>
              )}
            </div>

            {videoInfo.thumbnailUrl && (
              <div className="mt-2">
                <img
                  src={videoInfo.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full h-20 object-cover rounded border border-gray-700"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-gray-500 bg-gray-800/30 p-3 rounded-lg border border-gray-700">
        <p className="font-medium text-gray-300 mb-2">💡 <strong>Como usar:</strong></p>
        <ol className="list-decimal list-inside space-y-1 text-gray-400">
          <li>Faça o upload do vídeo diretamente no painel do Bunny.net</li>
          <li>Copie o ID do vídeo (ex: 8a3b9e9b-0d35-4a37-b30c-9a23e232e193)</li>
          <li>Cole o ID no campo acima e clique em buscar</li>
          <li>O sistema verificará se o vídeo existe e está disponível</li>
        </ol>
      </div>
    </div>
  );
}; 
