import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader2, AlertCircle } from 'lucide-react';

interface BunnyVideoPlayerProps {
  videoId: string;
  libraryId: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
}

export const BunnyVideoPlayer = ({ 
  videoId, 
  libraryId, 
  onTimeUpdate,
  className 
}: BunnyVideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Verificar se o script já foi carregado
    if ((window as any).playerjs) {
      initializePlayer();
    } else {
      // Carregar o script do player.js apenas uma vez
      const existingScript = document.querySelector('script[src="https://cdn.embed.ly/player-0.1.0.min.js"]');
      if (existingScript) {
        // Script já existe, apenas inicializar o player
        initializePlayer();
      } else {
        // Carregar o script pela primeira vez
        const script = document.createElement('script');
        script.src = 'https://cdn.embed.ly/player-0.1.0.min.js';
        script.async = true;

        script.onload = () => {
          initializePlayer();
        };

        script.onerror = () => {
          setError('Erro ao carregar o player');
        };

        document.head.appendChild(script);
      }
    }

    function initializePlayer() {
      try {
        // Aguardar um pouco para o iframe carregar
        setTimeout(() => {
          if (iframe.contentWindow && (window as any).playerjs) {
            // Limpar player anterior se existir
            if (playerRef.current) {
              try {
                playerRef.current.off('ready');
                playerRef.current.off('timeupdate');
                playerRef.current.off('play');
                playerRef.current.off('pause');
                playerRef.current.off('ended');
                playerRef.current.off('error');
              } catch (err) {
                console.warn('Erro ao limpar player anterior:', err);
              }
            }

            const player = new (window as any).playerjs.Player(iframe);
            playerRef.current = player;
            
            player.on('ready', () => {
              console.log('Bunny player ready');
              setIsReady(true);
              setError(null);
            });

            player.on('timeupdate', (data: any) => {
              setCurrentTime(data.seconds || 0);
              setDuration(data.duration || 0);
              
              if (onTimeUpdate) {
                onTimeUpdate(data.seconds || 0, data.duration || 0);
              }
            });

            player.on('play', () => {
              setIsPlaying(true);
            });

            player.on('pause', () => {
              setIsPlaying(false);
            });

            player.on('ended', () => {
              setIsPlaying(false);
            });

            player.on('error', (data: any) => {
              console.error('Player error:', data);
              setError('Erro ao carregar o vídeo');
            });

            // Armazenar referência do player para controles
            (iframe as any).player = player;
          }
        }, 1000);
      } catch (err) {
        console.error('Erro ao inicializar player:', err);
        setError('Erro ao inicializar o player');
      }
    }

    return () => {
      // Cleanup do player
      if (playerRef.current) {
        try {
          playerRef.current.off('ready');
          playerRef.current.off('timeupdate');
          playerRef.current.off('play');
          playerRef.current.off('pause');
          playerRef.current.off('ended');
          playerRef.current.off('error');
          playerRef.current = null;
        } catch (err) {
          console.warn('Erro no cleanup do player:', err);
        }
      }
    };
  }, [videoId, libraryId, onTimeUpdate]);

  const togglePlay = () => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    } catch (err) {
      console.error('Erro ao controlar reprodução:', err);
    }
  };

  const seekTo = (time: number) => {
    if (!playerRef.current) return;

    try {
      playerRef.current.seek(time);
    } catch (err) {
      console.error('Erro ao buscar tempo:', err);
    }
  };

  if (error) {
    return (
      <Card className={`w-full overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center p-4">
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
              <div className="text-center p-4">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-emerald-500 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-slate-400">Carregando vídeo...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
              <div className="text-center p-4">
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            key={`${libraryId}-${videoId}`} // Forçar re-render quando mudar o vídeo
          />
        </div>
      </CardContent>
    </Card>
  );
}; 
