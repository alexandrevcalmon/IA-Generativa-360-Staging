
import { Trophy, BookOpen, CheckCircle, Star, Zap, Crown, Target, Flame, Diamond, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const achievements = [
    {
      title: "Primeira Semana",
      icon: Flame,
      gradient: "from-orange-400 via-red-500 to-pink-600",
      bgGradient: "from-orange-400/20 via-red-500/15 to-pink-600/20",
      description: "7 dias seguidos"
    },
    {
      title: "Cursos Ativos",
      icon: BookOpen,
      gradient: "from-emerald-400 via-green-500 to-teal-600",
      bgGradient: "from-emerald-400/20 via-green-500/15 to-teal-600/20",
      value: coursesInProgress,
      description: "em andamento"
    },
    {
      title: "Conquistas",
      icon: CheckCircle,
      gradient: "from-blue-400 via-cyan-500 to-blue-600",
      bgGradient: "from-blue-400/20 via-cyan-500/15 to-blue-600/20",
      value: completedCourses,
      description: "cursos concluídos"
    },
    {
      title: "Pontos",
      icon: Trophy,
      gradient: "from-purple-400 via-violet-500 to-purple-600",
      bgGradient: "from-purple-400/20 via-violet-500/15 to-purple-600/20",
      value: totalPoints,
      description: "acumulados"
    }
  ];

  return (
    <div className="space-y-4">
      {achievements.map((achievement, index) => (
        <motion.div
          key={achievement.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
          whileHover={{ 
            x: 4,
            transition: { duration: 0.2 }
          }}
        >
          <div className={cn(
            "relative overflow-hidden p-4 rounded-2xl border border-slate-700/50 bg-slate-800/60 backdrop-blur-sm transition-all duration-300 group cursor-pointer",
            "hover:bg-slate-800/80 hover:border-slate-600/60 hover:shadow-xl"
          )}>
            {/* Animated background gradient premium dark */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              achievement.bgGradient
            )} />
            
            <div className="relative flex items-center gap-4">
              <motion.div 
                className={cn(
                  "p-3 rounded-xl bg-gradient-to-br shadow-xl group-hover:scale-110 transition-transform duration-300",
                  achievement.gradient
                )}
                whileHover={{ rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <achievement.icon className="h-5 w-5 text-white" />
              </motion.div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-200 group-hover:text-white transition-colors duration-300">
                    {achievement.title}
                  </h3>
                  {achievement.value !== undefined && (
                    <span className={cn(
                      "text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent",
                      achievement.gradient
                    )}>
                      {achievement.value}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {achievement.description}
                </p>
              </div>
              
              {/* Progress indicator for some achievements */}
              {achievement.title === "Primeira Semana" && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 via-red-500 to-pink-600"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Motivational message premium dark */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-purple-400/20 via-violet-500/15 to-purple-600/20 border border-purple-500/30"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600 shadow-xl">
            <Gem className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              Continue assim!
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Cada conquista te aproxima do sucesso
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
