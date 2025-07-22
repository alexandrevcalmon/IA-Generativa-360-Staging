
import { PageLayout } from '@/components/PageLayout';
import { useStudentPoints, useStudentAchievements, useAvailableAchievements, usePointsHistory } from '@/hooks/useStudentGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Award, TrendingUp, Calendar } from 'lucide-react';
import Ranking from './Ranking';

const StudentGamification = () => {
  const { data: studentPoints } = useStudentPoints();
  const { data: studentAchievements } = useStudentAchievements();
  const { data: availableAchievements } = useAvailableAchievements();
  const { data: pointsHistory } = usePointsHistory();

  const currentLevel = studentPoints?.level || 1;
  const currentPoints = studentPoints?.points || 0;
  const totalPoints = studentPoints?.total_points || 0;
  const streakDays = studentPoints?.streak_days || 0;
  
  // Calculate points needed for next level (100 points per level)
  const pointsForNextLevel = currentLevel * 100;
  const pointsProgress = (currentPoints % 100);

  // Header content com badges
  const headerContent = (
    <div className="flex items-center gap-4">
      <Badge className="px-4 py-2 text-sm font-bold" style={{ 
        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(168, 85, 247, 0.2))',
        color: '#c4b5fd',
        border: '1px solid rgba(147, 51, 234, 0.4)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(147, 51, 234, 0.2)'
      }}>
        <div className="w-4 h-4 mr-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
          <Trophy className="w-2.5 h-2.5 text-white" />
        </div>
        Nível {currentLevel}
      </Badge>
      <Badge className="px-4 py-2 text-sm font-bold" style={{ 
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2))',
        color: '#fcd34d',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
      }}>
        <div className="w-4 h-4 mr-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
          <Star className="w-2.5 h-2.5 text-white" />
        </div>
        {totalPoints} pontos totais
      </Badge>
    </div>
  );

  return (
    <div className="dark-theme-override min-h-screen" style={{ 
      backgroundColor: '#0f172a',
      color: 'white',
      '--background': '240 10% 3.9%',
      '--foreground': '0 0% 98%',
      '--card': '240 10% 3.9%',
      '--card-foreground': '0 0% 98%',
      '--popover': '240 10% 3.9%',
      '--popover-foreground': '0 0% 98%',
      '--primary': '0 0% 98%',
      '--primary-foreground': '240 5.9% 10%',
      '--secondary': '240 3.7% 15.9%',
      '--secondary-foreground': '0 0% 98%',
      '--muted': '240 3.7% 15.9%',
      '--muted-foreground': '240 5% 64.9%',
      '--accent': '240 3.7% 15.9%',
      '--accent-foreground': '0 0% 98%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 98%',
      '--border': 'transparent',
      '--input': '240 3.7% 15.9%',
      '--ring': '240 4.9% 83.9%'
    } as React.CSSProperties}>
      <PageLayout
        title="Gamificação"
        subtitle="Acompanhe seu progresso e conquistas"
        headerContent={headerContent}
        background="dark"
        className="dark-theme-override"
        contentClassName="!bg-slate-900"
      >
      <div className="space-y-6" style={{ 
        backgroundColor: '#0f172a',
        minHeight: '100vh'
      }}>
          {/* Level Progress */}
          <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
            <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Progresso do Nível
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{currentLevel}</span>
                    </div>
                    <span className="text-sm font-medium text-white">Nível {currentLevel}</span>
                  </div>
                  <span className="text-sm text-slate-400">
                    {pointsProgress}/100 pontos
                  </span>
                </div>
                <div className="relative">
                  <Progress value={pointsProgress} className="h-4" style={{ 
                    backgroundColor: 'rgba(71, 85, 105, 0.3)',
                    borderRadius: '8px'
                  }} />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 pointer-events-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/15 to-amber-500/15 border border-yellow-500/30">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{currentPoints}</p>
                      <p className="text-xs text-slate-300">pontos atuais</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{streakDays}</p>
                      <p className="text-xs text-slate-300">dias seguidos</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ranking Global */}
          <div>
            <Ranking />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Achievements */}
            <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Suas Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                <div className="space-y-3">
                  {studentAchievements?.length ? (
                    studentAchievements.map((achievement: any, index: number) => {
                      // Definir cores e ícones para conquistas conquistadas
                      const getAchievedStyle = (name: string, index: number) => {
                        const nameLower = name.toLowerCase();
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
                            bgColor: 'rgba(239, 68, 68, 0.15)',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            iconBg: 'rgba(239, 68, 68, 0.25)',
                            textColor: '#f87171'
                          };
                        } else if (nameLower.includes('mentoria') || nameLower.includes('mentorship')) {
                          return {
                            icon: '👨‍🏫',
                            bgColor: 'rgba(16, 185, 129, 0.15)',
                            borderColor: 'rgba(16, 185, 129, 0.3)',
                            iconBg: 'rgba(16, 185, 129, 0.25)',
                            textColor: '#34d399'
                          };
                        } else if (nameLower.includes('participação') || nameLower.includes('postagens')) {
                          return {
                            icon: '💬',
                            bgColor: 'rgba(168, 85, 247, 0.15)',
                            borderColor: 'rgba(168, 85, 247, 0.3)',
                            iconBg: 'rgba(168, 85, 247, 0.25)',
                            textColor: '#a78bfa'
                          };
                        } else if (nameLower.includes('primeiro curso') || nameLower.includes('first course')) {
                          return {
                            icon: '🎓',
                            bgColor: 'rgba(245, 158, 11, 0.15)',
                            borderColor: 'rgba(245, 158, 11, 0.3)',
                            iconBg: 'rgba(245, 158, 11, 0.25)',
                            textColor: '#fbbf24'
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
                      };

                      const style = getAchievedStyle(achievement.achievements.name, index);

                      return (
                        <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-105" style={{ 
                          backgroundColor: style.bgColor,
                          borderColor: style.borderColor
                        }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: style.iconBg }}>
                            {style.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              {achievement.achievements.name}
                            </p>
                            <p className="text-sm text-slate-300">
                              {achievement.achievements.description}
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
                            +{achievement.achievements.points_required}
                          </Badge>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-400 text-lg font-medium mb-2">
                        Nenhuma conquista ainda
                      </p>
                      <p className="text-slate-500 text-sm">
                        Continue estudando para desbloquear conquistas!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available Achievements */}
            <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Star className="h-5 w-5 text-purple-400" />
                  Próximas Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                <div className="space-y-3">
                  {availableAchievements?.slice(0, 5).map((achievement, index) => {
                    // Definir cores e ícones baseados no nome da conquista
                    const getAchievementStyle = (name: string, index: number) => {
                      const nameLower = name.toLowerCase();
                      if (nameLower.includes('primeira lição') || nameLower.includes('first lesson')) {
                        return {
                          icon: '📚',
                          bgColor: 'rgba(59, 130, 246, 0.2)',
                          borderColor: 'rgba(59, 130, 246, 0.4)',
                          iconBg: 'rgba(59, 130, 246, 0.3)',
                          textColor: '#60a5fa'
                        };
                      } else if (nameLower.includes('streak') || nameLower.includes('dias')) {
                        return {
                          icon: '🔥',
                          bgColor: 'rgba(239, 68, 68, 0.2)',
                          borderColor: 'rgba(239, 68, 68, 0.4)',
                          iconBg: 'rgba(239, 68, 68, 0.3)',
                          textColor: '#f87171'
                        };
                      } else if (nameLower.includes('mentoria') || nameLower.includes('mentorship')) {
                        return {
                          icon: '👨‍🏫',
                          bgColor: 'rgba(16, 185, 129, 0.2)',
                          borderColor: 'rgba(16, 185, 129, 0.4)',
                          iconBg: 'rgba(16, 185, 129, 0.3)',
                          textColor: '#34d399'
                        };
                      } else if (nameLower.includes('participação') || nameLower.includes('postagens')) {
                        return {
                          icon: '💬',
                          bgColor: 'rgba(168, 85, 247, 0.2)',
                          borderColor: 'rgba(168, 85, 247, 0.4)',
                          iconBg: 'rgba(168, 85, 247, 0.3)',
                          textColor: '#a78bfa'
                        };
                      } else if (nameLower.includes('primeiro curso') || nameLower.includes('first course')) {
                        return {
                          icon: '🎓',
                          bgColor: 'rgba(245, 158, 11, 0.2)',
                          borderColor: 'rgba(245, 158, 11, 0.4)',
                          iconBg: 'rgba(245, 158, 11, 0.3)',
                          textColor: '#fbbf24'
                        };
                      } else {
                        // Cores padrão baseadas no índice
                        const colors = [
                          { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.4)', icon: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa' },
                          { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.4)', icon: 'rgba(16, 185, 129, 0.3)', text: '#34d399' },
                          { bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.4)', icon: 'rgba(168, 85, 247, 0.3)', text: '#a78bfa' },
                          { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.4)', icon: 'rgba(245, 158, 11, 0.3)', text: '#fbbf24' },
                          { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.4)', icon: 'rgba(239, 68, 68, 0.3)', text: '#f87171' }
                        ];
                        return {
                          icon: '⭐',
                          bgColor: colors[index % colors.length].bg,
                          borderColor: colors[index % colors.length].border,
                          iconBg: colors[index % colors.length].icon,
                          textColor: colors[index % colors.length].text
                        };
                      }
                    };

                    const style = getAchievementStyle(achievement.name, index);

                    return (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-105" style={{ 
                        backgroundColor: style.bgColor,
                        borderColor: style.borderColor
                      }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: style.iconBg }}>
                          {style.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{achievement.name}</p>
                          <p className="text-sm text-slate-300">{achievement.description}</p>
                        </div>
                        {achievement.points_required && (
                          <Badge className="text-xs font-bold" style={{ 
                            backgroundColor: style.iconBg,
                            color: style.textColor,
                            borderColor: style.borderColor
                          }}>
                            {achievement.points_required} pts
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Points History */}
          <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
            <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-emerald-500" />
                Histórico de Pontos
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <div className="space-y-3">
                {pointsHistory?.length ? (
                  pointsHistory.map((entry, index) => {
                    // Definir cores baseadas no tipo de ação
                    const getActionStyle = (actionType: string, points: number) => {
                      const actionLower = actionType?.toLowerCase() || '';
                      if (actionLower.includes('lesson') || actionLower.includes('lição')) {
                        return {
                          icon: '📚',
                          bgColor: 'rgba(59, 130, 246, 0.15)',
                          borderColor: 'rgba(59, 130, 246, 0.3)',
                          iconBg: 'rgba(59, 130, 246, 0.25)',
                          textColor: '#60a5fa'
                        };
                      } else if (actionLower.includes('streak') || actionLower.includes('consecutivo')) {
                        return {
                          icon: '🔥',
                          bgColor: 'rgba(239, 68, 68, 0.15)',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          iconBg: 'rgba(239, 68, 68, 0.25)',
                          textColor: '#f87171'
                        };
                      } else if (actionLower.includes('mentorship') || actionLower.includes('mentoria')) {
                        return {
                          icon: '👨‍🏫',
                          bgColor: 'rgba(16, 185, 129, 0.15)',
                          borderColor: 'rgba(16, 185, 129, 0.3)',
                          iconBg: 'rgba(16, 185, 129, 0.25)',
                          textColor: '#34d399'
                        };
                      } else if (actionLower.includes('community') || actionLower.includes('comunidade')) {
                        return {
                          icon: '💬',
                          bgColor: 'rgba(168, 85, 247, 0.15)',
                          borderColor: 'rgba(168, 85, 247, 0.3)',
                          iconBg: 'rgba(168, 85, 247, 0.25)',
                          textColor: '#a78bfa'
                        };
                      } else if (actionLower.includes('course') || actionLower.includes('curso')) {
                        return {
                          icon: '🎓',
                          bgColor: 'rgba(245, 158, 11, 0.15)',
                          borderColor: 'rgba(245, 158, 11, 0.3)',
                          iconBg: 'rgba(245, 158, 11, 0.25)',
                          textColor: '#fbbf24'
                        };
                      } else {
                        // Cores baseadas na quantidade de pontos
                        if (points >= 50) {
                          return {
                            icon: '🏆',
                            bgColor: 'rgba(245, 158, 11, 0.15)',
                            borderColor: 'rgba(245, 158, 11, 0.3)',
                            iconBg: 'rgba(245, 158, 11, 0.25)',
                            textColor: '#fbbf24'
                          };
                        } else if (points >= 20) {
                          return {
                            icon: '⭐',
                            bgColor: 'rgba(168, 85, 247, 0.15)',
                            borderColor: 'rgba(168, 85, 247, 0.3)',
                            iconBg: 'rgba(168, 85, 247, 0.25)',
                            textColor: '#a78bfa'
                          };
                        } else if (points >= 10) {
                          return {
                            icon: '💎',
                            bgColor: 'rgba(16, 185, 129, 0.15)',
                            borderColor: 'rgba(16, 185, 129, 0.3)',
                            iconBg: 'rgba(16, 185, 129, 0.25)',
                            textColor: '#34d399'
                          };
                        } else {
                          return {
                            icon: '✨',
                            bgColor: 'rgba(59, 130, 246, 0.15)',
                            borderColor: 'rgba(59, 130, 246, 0.3)',
                            iconBg: 'rgba(59, 130, 246, 0.25)',
                            textColor: '#60a5fa'
                          };
                        }
                      }
                    };

                    const style = getActionStyle(entry.action_type, entry.points);

                    return (
                      <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-105" style={{ 
                        backgroundColor: style.bgColor,
                        borderColor: style.borderColor
                      }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: style.iconBg }}>
                          {style.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            {entry.description || entry.action_type}
                          </p>
                          <p className="text-sm text-slate-300">
                            {new Date(entry.earned_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge className="text-xs font-bold" style={{ 
                          backgroundColor: style.iconBg,
                          color: style.textColor,
                          borderColor: style.borderColor
                        }}>
                          +{entry.points} pontos
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-400 text-lg font-medium mb-2">
                      Nenhum histórico ainda
                    </p>
                    <p className="text-slate-500 text-sm">
                      Complete atividades para ver seu histórico de pontos!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
      </div>
      </PageLayout>
    </div>
  );
};

export default StudentGamification;
