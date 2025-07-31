import { useState, useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AchievementBannerProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    points_required: number;
  };
  isVisible: boolean;
  onClose: () => void;
}

export const AchievementBanner = ({ achievement, isVisible, onClose }: AchievementBannerProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ease-out ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-2xl p-4 min-w-[320px] max-w-[400px]">
        <div className="flex items-start gap-3">
          {/* Ícone da conquista */}
          <div className="w-12 h-12 rounded-full bg-slate-700/80 flex items-center justify-center text-2xl flex-shrink-0">
            {achievement.icon}
          </div>
          
          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <h3 className="font-bold text-white text-sm">
                Nova Conquista Desbloqueada!
              </h3>
            </div>
            
            <h4 className="font-semibold text-white text-base mb-1">
              {achievement.name}
            </h4>
            
            <p className="text-slate-300 text-sm mb-2">
              {achievement.description}
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Recompensa:</span>
              <span className="px-2 py-1 bg-slate-700/60 rounded text-xs font-medium text-yellow-400">
                +{achievement.points_required} pontos
              </span>
            </div>
          </div>
          
          {/* Botão fechar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Barra de progresso da animação */}
        <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-5000 ease-linear"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}; 
