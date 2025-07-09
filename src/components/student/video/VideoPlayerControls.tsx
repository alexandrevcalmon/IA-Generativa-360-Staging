
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, RotateCw, Maximize } from 'lucide-react';
import { VideoPlayerProgress } from './VideoPlayerProgress';
import { VideoPlayerVolume } from './VideoPlayerVolume';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isMobile: boolean;
  onTogglePlay: () => void;
  onSeek: (value: number[]) => void;
  onVolumeChange: (value: number[]) => void;
  onToggleMute: () => void;
  onSkip: (seconds: number) => void;
  onToggleFullscreen: () => void;
}

export const VideoPlayerControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isMobile,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onSkip,
  onToggleFullscreen,
}: VideoPlayerControlsProps) => {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Play/Pause button clicked');
    onTogglePlay();
  };

  const handleSkipBackward = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Skip backward clicked');
    onSkip(-10);
  };

  const handleSkipForward = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Skip forward clicked');
    onSkip(10);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Fullscreen button clicked');
    onToggleFullscreen();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4 pointer-events-auto">
      {/* Progress Bar */}
      <VideoPlayerProgress
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
      />

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            onClick={handlePlayClick}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20 touch-manipulation min-h-[48px] min-w-[48px] sm:h-12 sm:w-12 lg:h-14 lg:w-14 p-0 rounded-full"
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6" />}
          </Button>

          <Button
            onClick={handleSkipBackward}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20 touch-manipulation min-h-[48px] min-w-[48px] sm:h-12 sm:w-12 lg:h-14 lg:w-14 p-0 rounded-full"
            aria-label="Voltar 10 segundos"
          >
            <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          <Button
            onClick={handleSkipForward}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20 touch-manipulation min-h-[48px] min-w-[48px] sm:h-12 sm:w-12 lg:h-14 lg:w-14 p-0 rounded-full"
            aria-label="Avançar 10 segundos"
          >
            <RotateCw className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {/* Volume controls - hidden on mobile */}
          {!isMobile && (
            <div className="ml-2">
              <VideoPlayerVolume
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={onVolumeChange}
                onToggleMute={onToggleMute}
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleFullscreen}
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20 touch-manipulation min-h-[48px] min-w-[48px] sm:h-12 sm:w-12 lg:h-14 lg:w-14 p-0 rounded-full"
          aria-label="Tela cheia"
        >
          <Maximize className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>
    </div>
  );
};
