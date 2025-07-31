
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerVolumeProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (value: number[]) => void;
  onToggleMute: () => void;
}

export const VideoPlayerVolume = ({ 
  volume, 
  isMuted, 
  onVolumeChange, 
  onToggleMute 
}: VideoPlayerVolumeProps) => {
  return (
    <div className="flex items-center space-x-2 ml-2 sm:ml-4">
      <Button
        onClick={onToggleMute}
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10 p-0"
      >
        {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
      </Button>
      <Slider
        value={[isMuted ? 0 : volume]}
        onValueChange={onVolumeChange}
        max={1}
        step={0.1}
        className="w-16 sm:w-20"
      />
    </div>
  );
};
