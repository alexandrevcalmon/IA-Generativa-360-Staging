
import { Trophy, BookOpen, CheckCircle, Star, Zap, Crown, Target, Flame, Diamond, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAvailableAchievements } from '@/hooks/gamification/useAvailableAchievements';
import { useStudentAchievements } from '@/hooks/gamification/useStudentAchievements';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';

interface StudentAchievementsProps {
  coursesInProgress: number;
  completedCourses: number;
  totalPoints: number;
}

export const StudentAchievements = ({ 
  coursesInProgress, 
  completedCourses, 
  totalPoints 
}: StudentAchievementsProps) => {
  const { user } = useAuth();

  // Buscar todas as conquistas disponíveis
  const { data: allAchievements = [], isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['all-achievements-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Buscar conquistas do usuário
  const { data: studentAchievements = [], isLoading: isLoadingStudentAchievements } = useQuery({
    queryKey: ['student-achievements-simple', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Buscar o company_user_id
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (companyUserError || !companyUser) {
        return [];
      }

      const { data, error } = await supabase
        .from('student_achievements')
        .select('achievement_id')
        .eq('student_id', companyUser.id);

      if (error) {
        console.error('Error fetching student achievements:', error);
        return [];
      }

      return (data || []) as { achievement_id: string }[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Buscar progresso de lições para verificar conquistas baseadas em progresso real
  const { data: lessonProgress = [], isLoading: isLoadingLessonProgress } = useQuery({
    queryKey: ['lesson-progress-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (error) {
        console.error('Error fetching lesson progress:', error);
        return [];
      }

      return (data || []) as { lesson_id: string; completed: boolean }[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Criar um Set com os IDs das conquistas já conquistadas
  const unlockedAchievementIds = new Set(
    studentAchievements.map((sa: { achievement_id: string }) => sa.achievement_id)
  );

  // Verificar conquistas baseadas em progresso real
  const hasCompletedFirstLesson = lessonProgress.length > 0;

  // Combinar todas as conquistas com informação de status
  const achievementsWithStatus = allAchievements.map((achievement: any) => {
    const nameLower = achievement.name.toLowerCase();
    let isUnlocked = unlockedAchievementIds.has(achievement.id);
    
    // Lógica especial para "Primeira Lição" - só desbloqueia se realmente completou uma lição
    if (nameLower.includes('primeira lição') || nameLower.includes('first lesson')) {
      isUnlocked = hasCompletedFirstLesson;
    }
    
    return {
      ...achievement,
      isUnlocked
    };
  });

  // Definir cores e ícones baseados no nome da conquista e status
  const getAchievementStyle = (name: string, index: number, isUnlocked: boolean) => {
    const nameLower = name.toLowerCase();
    
    if (isUnlocked) {
      // Cores vibrantes para conquistas conquistadas
      if (nameLower.includes('primeira lição') || nameLower.includes('first lesson')) {
        return {
          icon: '📚',
          bgColor: 'rgba(59, 130, 246, 0.15)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          iconBg: 'rgba(59, 130, 246, 0.25)',
          textColor: '#60a5fa'
        };
      } else if (nameLower.includes('streak') || nameLower.includes('dias')) {
        return {
          icon: '🔥',
          bgColor: 'rgba(245, 158, 11, 0.15)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          iconBg: 'rgba(245, 158, 11, 0.25)',
          textColor: '#fbbf24'
        };
      } else if (nameLower.includes('mentoria') || nameLower.includes('mentorship')) {
        return {
          icon: '👨‍🏫',
          bgColor: 'rgba(168, 85, 247, 0.15)',
          borderColor: 'rgba(168, 85, 247, 0.3)',
          iconBg: 'rgba(168, 85, 247, 0.25)',
          textColor: '#a78bfa'
        };
      } else if (nameLower.includes('participação') || nameLower.includes('postagens')) {
        return {
          icon: '💬',
          bgColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          iconBg: 'rgba(16, 185, 129, 0.25)',
          textColor: '#34d399'
        };
      } else if (nameLower.includes('primeiro curso') || nameLower.includes('first course')) {
        return {
          icon: '🎓',
          bgColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          iconBg: 'rgba(239, 68, 68, 0.25)',
          textColor: '#f87171'
        };
      } else {
        // Cores padrão para conquistas conquistadas
        const colors = [
          { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', icon: 'rgba(59, 130, 246, 0.25)', text: '#60a5fa' },
          { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', icon: 'rgba(16, 185, 129, 0.25)', text: '#34d399' },
          { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', icon: 'rgba(168, 85, 247, 0.25)', text: '#a78bfa' },
          { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', icon: 'rgba(245, 158, 11, 0.25)', text: '#fbbf24' },
          { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: 'rgba(239, 68, 68, 0.25)', text: '#f87171' }
        ];
        return {
          icon: '🏆',
          bgColor: colors[index % colors.length].bg,
          borderColor: colors[index % colors.length].border,
          iconBg: colors[index % colors.length].icon,
          textColor: colors[index % colors.length].text
        };
      }
    } else {
      // Cores em cinza para conquistas não conquistadas
      if (nameLower.includes('primeira lição') || nameLower.includes('first lesson')) {
        return {
          icon: '📚',
          bgColor: 'rgba(71, 85, 105, 0.15)',
          borderColor: 'rgba(71, 85, 105, 0.3)',
          iconBg: 'rgba(71, 85, 105, 0.25)',
          textColor: '#94a3b8'
        };
      } else if (nameLower.includes('streak') || nameLower.includes('dias')) {
        return {
          icon: '🔥',
          bgColor: 'rgba(71, 85, 105, 0.15)',
          borderColor: 'rgba(71, 85, 105, 0.3)',
          iconBg: 'rgba(71, 85, 105, 0.25)',
          textColor: '#94a3b8'
        };
      } else if (nameLower.includes('mentoria') || nameLower.includes('mentorship')) {
        return {
          icon: '👨‍🏫',
          bgColor: 'rgba(71, 85, 105, 0.15)',
          borderColor: 'rgba(71, 85, 105, 0.3)',
          iconBg: 'rgba(71, 85, 105, 0.25)',
          textColor: '#94a3b8'
        };
      } else if (nameLower.includes('participação') || nameLower.includes('postagens')) {
        return {
          icon: '💬',
          bgColor: 'rgba(71, 85, 105, 0.15)',
          borderColor: 'rgba(71, 85, 105, 0.3)',
          iconBg: 'rgba(71, 85, 105, 0.25)',
          textColor: '#94a3b8'
        };
      } else if (nameLower.includes('primeiro curso') || nameLower.includes('first course')) {
        return {
          icon: '🎓',
          bgColor: 'rgba(71, 85, 105, 0.15)',
          borderColor: 'rgba(71, 85, 105, 0.3)',
          iconBg: 'rgba(71, 85, 105, 0.25)',
          textColor: '#94a3b8'
        };
      } else {
        // Cores padrão em cinza para não conquistadas
        return {
          icon: '⭐',
          bgColor: 'rgba(71, 85, 105, 0.15)',
          borderColor: 'rgba(71, 85, 105, 0.3)',
          iconBg: 'rgba(71, 85, 105, 0.25)',
          textColor: '#94a3b8'
        };
      }
    }
  };

  // Mostrar loading se estiver carregando
  if (isLoadingAchievements || isLoadingStudentAchievements || isLoadingLessonProgress) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-slate-800/50 border-slate-600 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-slate-600"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-600 rounded w-3/4"></div>
            <div className="h-3 bg-slate-600 rounded w-1/2"></div>
          </div>
          <div className="w-12 h-6 bg-slate-600 rounded"></div>
        </div>
      </div>
    );
  }

  // Se não há conquistas disponíveis
  if (achievementsWithStatus.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-slate-400 text-sm">
          Nenhuma conquista disponível no momento.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {achievementsWithStatus.slice(0, 5).map((achievement: any, index: number) => {
        const style = getAchievementStyle(achievement.name, index, achievement.isUnlocked);
        
        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
              achievement.isUnlocked 
                ? "bg-slate-800/50 border-slate-600" 
                : "bg-slate-800/30 border-slate-600/50 opacity-60"
            )}
            style={{
              backgroundColor: style.bgColor,
              borderColor: style.borderColor
            }}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: style.iconBg }}
            >
              {style.icon}
            </div>
            <div className="flex-1">
              <p 
                className="font-medium"
                style={{ color: style.textColor }}
              >
                {achievement.name}
              </p>
              <p className="text-sm text-slate-400">
                {achievement.description}
              </p>
            </div>
            <Badge 
              className="text-xs font-bold"
              style={{
                backgroundColor: style.iconBg,
                color: style.textColor,
                borderColor: style.borderColor
              }}
            >
              {achievement.points_required} pts
            </Badge>
          </motion.div>
        );
      })}
      
      {achievementsWithStatus.length > 5 && (
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            +{achievementsWithStatus.length - 5} conquistas disponíveis
          </p>
        </div>
      )}
    </div>
  );
};
