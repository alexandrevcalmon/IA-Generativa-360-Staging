import { useState, useEffect, useRef } from 'react';
import { useStudentAchievements } from './useStudentAchievements';

export const useAchievementNotification = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);
  const previousAchievementsRef = useRef<string[]>([]);
  const { data: studentAchievements } = useStudentAchievements();

  useEffect(() => {
    if (studentAchievements && studentAchievements.length > 0) {
      const currentAchievementIds = studentAchievements.map((a: any) => a.id);
      const previousAchievementIds = previousAchievementsRef.current;
      
      // Se há conquistas novas (mais conquistas do que antes)
      if (currentAchievementIds.length > previousAchievementIds.length) {
        // Encontrar a conquista mais recente
        const latestAchievement = studentAchievements
          .sort((a: any, b: any) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())[0];
        
        // Verificar se é uma conquista realmente nova (últimos 30 segundos)
        const isRecent = new Date().getTime() - new Date(latestAchievement.unlocked_at).getTime() < 30000;
        
        if (isRecent) {
          setNewAchievement(latestAchievement.achievements);
          setShowBanner(true);
        }
      }
      
      // Atualizar referência
      previousAchievementsRef.current = currentAchievementIds;
    }
  }, [studentAchievements]);

  const closeBanner = () => {
    setShowBanner(false);
    setNewAchievement(null);
  };

  return {
    showBanner,
    newAchievement,
    closeBanner
  };
}; 
