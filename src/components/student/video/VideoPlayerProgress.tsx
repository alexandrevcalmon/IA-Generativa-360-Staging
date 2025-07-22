
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProgressProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
}

export const VideoPlayerProgress = ({ currentTime, duration, onSeek }: VideoPlayerProgressProps) => {
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    console.log('Progress bar seek:', value[0]);
    onSeek(value);
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 pointer-events-auto">
      <span className="text-white text-[10px] sm:text-xs font-mono min-w-[32px] sm:min-w-[40px] lg:min-w-[45px] text-center">
        {formatTime(currentTime)}
      </span>
      <div className="flex-1">
        <Slider
          value={[currentTime]}
          onValueChange={handleSeek}
          max={duration || 100}
          step={1}
          className="w-full cursor-pointer touch-manipulation [&_.slider-track]:h-1.5 sm:[&_.slider-track]:h-2 [&_.slider-thumb]:h-4 [&_.slider-thumb]:w-4 sm:[&_.slider-thumb]:h-5 sm:[&_.slider-thumb]:w-5 [&_.slider-thumb]:touch-manipulation [&_.slider-thumb]:cursor-pointer"
        />
      </div>
      <span className="text-white text-[10px] sm:text-xs font-mono min-w-[32px] sm:min-w-[40px] lg:min-w-[45px] text-center">
        {formatTime(duration)}
      </span>
    </div>
  );
};
