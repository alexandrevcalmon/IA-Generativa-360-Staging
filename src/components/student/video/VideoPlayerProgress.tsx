
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
    <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 pointer-events-auto">
      <span className="text-white text-xs sm:text-sm font-mono min-w-[40px] sm:min-w-[45px] lg:min-w-[50px] text-center">
        {formatTime(currentTime)}
      </span>
      <div className="flex-1 px-1">
        <Slider
          value={[currentTime]}
          onValueChange={handleSeek}
          max={duration || 100}
          step={1}
          className="w-full cursor-pointer touch-manipulation [&_.slider-track]:h-2 sm:[&_.slider-track]:h-3 [&_.slider-thumb]:h-5 [&_.slider-thumb]:w-5 sm:[&_.slider-thumb]:h-6 sm:[&_.slider-thumb]:w-6 [&_.slider-thumb]:touch-manipulation [&_.slider-thumb]:cursor-pointer"
        />
      </div>
      <span className="text-white text-xs sm:text-sm font-mono min-w-[40px] sm:min-w-[45px] lg:min-w-[50px] text-center">
        {formatTime(duration)}
      </span>
    </div>
  );
};
