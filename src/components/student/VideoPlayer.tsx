
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoPlayer } from './video/useVideoPlayer';
import { VideoPlayerControls } from './video/VideoPlayerControls';
import { StudentLesson, StudentCourse } from '@/hooks/useStudentCourses';
import { BunnyVideoPlayer } from '@/components/BunnyVideoPlayer';

interface VideoPlayerProps {
  currentLesson: StudentLesson;
  course: StudentCourse;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export const VideoPlayer = ({ currentLesson, course, onTimeUpdate }: VideoPlayerProps) => {
  // Verificar se o vídeo é do Bunny.net
  const hasBunnyVideo = currentLesson.bunny_video_id && currentLesson.bunny_library_id;
  
  console.log('[VideoPlayer] Lesson data:', {
    id: currentLesson.id,
    title: currentLesson.title,
    bunny_video_id: currentLesson.bunny_video_id,
    bunny_library_id: currentLesson.bunny_library_id,
    bunny_video_status: currentLesson.bunny_video_status,
    bunny_embed_url: currentLesson.bunny_embed_url,
    video_url: currentLesson.video_url,
    video_file_url: currentLesson.video_file_url,
    hasBunnyVideo,
    bunny_video_id_type: typeof currentLesson.bunny_video_id,
    bunny_library_id_type: typeof currentLesson.bunny_library_id
  });
  
  // Se tem vídeo do Bunny.net, usar o player específico
  if (hasBunnyVideo) {
    console.log('[VideoPlayer] Using BunnyVideoPlayer for:', currentLesson.bunny_video_id);
    return (
      <BunnyVideoPlayer
        videoId={currentLesson.bunny_video_id!}
        libraryId={currentLesson.bunny_library_id!.toString()}
        onTimeUpdate={onTimeUpdate}
      />
    );
  }

  // Fallback para vídeos tradicionais (Supabase Storage) - apenas se não for Bunny.net
  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    showControls,
    isMobile,
    setShowControls,
    togglePlay,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    skip,
    toggleFullscreen,
  } = useVideoPlayer({ currentLesson, course, onTimeUpdate });

  const videoUrl = currentLesson.video_file_url || currentLesson.video_url;
  
  console.log('[VideoPlayer] Fallback video URL:', videoUrl);

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Video clicked');
    if (isMobile) {
      setShowControls(!showControls);
    } else {
      togglePlay();
    }
  };

  const handleCenterPlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Center play button clicked');
    togglePlay();
  };

  if (!videoUrl) {
    console.log('[VideoPlayer] No video URL found, showing placeholder');
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-white text-sm sm:text-base lg:text-lg">Vídeo não disponível</p>
      </div>
    );
  }

  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden group w-full touch-manipulation max-w-full"
      onMouseEnter={() => !isMobile && setShowControls(true)}
      onMouseLeave={() => !isMobile && setShowControls(false)}
      onTouchStart={() => isMobile && setShowControls(true)}
    >
      <video
        ref={videoRef}
        className="w-full aspect-video object-contain cursor-pointer max-h-[calc(100vh-200px)]"
        src={videoUrl}
        onClick={handleVideoClick}
        playsInline
        preload="metadata"
      />
      
      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-300 pointer-events-none ${showControls || !isPlaying || isMobile ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Play/Pause Button (Center) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <Button
              onClick={handleCenterPlayClick}
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white rounded-full p-4 sm:p-5 lg:p-6 touch-manipulation backdrop-blur-sm min-h-[64px] min-w-[64px] sm:min-h-[72px] sm:min-w-[72px] lg:min-h-[80px] lg:min-w-[80px]"
              aria-label="Reproduzir vídeo"
            >
              <Play className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
            </Button>
          </div>
        )}

        {/* Bottom Controls */}
        <VideoPlayerControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isMobile={isMobile}
          onTogglePlay={togglePlay}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
          onSkip={skip}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>
    </div>
  );
};
