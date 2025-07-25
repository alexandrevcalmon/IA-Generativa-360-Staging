
import { PageLayout } from '@/components/PageLayout';
import { useStudentPoints, useStudentAchievements, useAvailableAchievements, usePointsHistory, useAchievementNotification } from '@/hooks/useStudentGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Zap, Award, TrendingUp, Calendar, ChevronDown, ChevronUp, BookOpen, MessageSquare, Heart, Target } from 'lucide-react';
import Ranking from './Ranking';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AchievementBanner } from '@/components/AchievementBanner';

const StudentGamification = () => {
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);
  
  const { data: studentPoints } = useStudentPoints();
  const { data: studentAchievements } = useStudentAchievements();
  const { data: availableAchievements } = useAvailableAchievements();
  const { data: pointsHistory } = usePointsHistory();
  const { showBanner, newAchievement, closeBanner } = useAchievementNotification();

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
    <>
      {/* Banner de Conquista */}
      {newAchievement && (
        <AchievementBanner
          achievement={newAchievement}
          isVisible={showBanner}
          onClose={closeBanner}
        />
      )}
      
      <PageLayout
        title="Gamificação"
        subtitle="Acompanhe seu progresso e conquistas"
        headerContent={headerContent}
        background="dark"
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
                      // Definir cores e ícones baseados no nome da conquista (em cinza para não conquistadas)
                      const getAchievementStyle = (name: string, index: number) => {
                        const nameLower = name.toLowerCase();
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
                      };

                      const style = getAchievementStyle(achievement.name, index);

                      return (
                        <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-105 opacity-60" style={{ 
                          backgroundColor: style.bgColor,
                          borderColor: style.borderColor
                        }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: style.iconBg }}>
                            {style.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-300">{achievement.name}</p>
                            <p className="text-sm text-slate-400">{achievement.description}</p>
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

            {/* Regras de Gamificação */}
            <Card className="border-slate-700/50 bg-slate-900/20 shadow-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
              <Collapsible open={isRulesExpanded} onOpenChange={setIsRulesExpanded}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="bg-slate-900/20 text-white border-b border-slate-700/50 cursor-pointer hover:bg-slate-800/30 transition-colors" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                    <CardTitle className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-400" />
                        Regras de Gamificação
                      </div>
                      {isRulesExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="bg-slate-900/20" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
                    <div className="space-y-6">
                      {/* Introdução */}
                      <div className="text-center p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <p className="text-white font-medium mb-2">
                          🎯 Como Ganhar Pontos na Plataforma
                        </p>
                        <p className="text-slate-300 text-sm">
                          Descubra todas as formas de acumular pontos e subir no ranking!
                        </p>
                      </div>

                      {/* Categorias de Atividades */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Aprendizado */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            📚 Aprendizado
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                              <div>
                                <p className="font-medium text-white">Concluir Lição</p>
                                <p className="text-sm text-slate-300">Complete qualquer lição do curso</p>
                              </div>
                              <Badge className="bg-blue-600 text-white">+5 pts</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <div>
                                <p className="font-medium text-white">Concluir Módulo</p>
                                <p className="text-sm text-slate-300">Complete todos os módulos de um curso</p>
                              </div>
                              <Badge className="bg-green-600 text-white">+20 pts</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                              <div>
                                <p className="font-medium text-white">Concluir Curso</p>
                                <p className="text-sm text-slate-300">Complete um curso inteiro</p>
                              </div>
                              <Badge className="bg-yellow-600 text-white">+50 pts</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <div>
                                <p className="font-medium text-white">Passar no Quiz</p>
                                <p className="text-sm text-slate-300">Aprove em um teste de conhecimento</p>
                              </div>
                              <Badge className="bg-purple-600 text-white">+20 pts</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Comunidade */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            💬 Comunidade
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <div>
                                <p className="font-medium text-white">Criar Tópico</p>
                                <p className="text-sm text-slate-300">Inicie uma discussão na comunidade</p>
                              </div>
                              <Badge className="bg-purple-600 text-white">+10 pts</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                              <div>
                                <p className="font-medium text-white">Responder Tópico</p>
                                <p className="text-sm text-slate-300">Resposta com mais de 100 caracteres</p>
                                <p className="text-xs text-slate-400">⚠️ Limite: 10 respostas/dia</p>
                              </div>
                              <Badge className="bg-indigo-600 text-white">+10 pts</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                              <div>
                                <p className="font-medium text-white">Curtir Tópico/Resposta</p>
                                <p className="text-sm text-slate-300">Dar ou receber curtidas</p>
                                <p className="text-xs text-slate-400">⚠️ Limite: 20 curtidas/dia</p>
                              </div>
                              <Badge className="bg-pink-600 text-white">+1 pt</Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Outras Atividades */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          🎯 Outras Atividades
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div>
                              <p className="font-medium text-white">Participar de Mentoria</p>
                              <p className="text-sm text-slate-300">Compareça a uma sessão de mentoria</p>
                            </div>
                            <Badge className="bg-red-600 text-white">+10 pts</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <div>
                              <p className="font-medium text-white">Desbloquear Conquista</p>
                              <p className="text-sm text-slate-300">Alcance uma conquista especial</p>
                            </div>
                            <Badge className="bg-orange-600 text-white">+20 pts</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Regras Importantes */}
                      <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                        <h4 className="text-lg font-semibold text-white mb-3">⚠️ Regras Importantes</h4>
                        <div className="space-y-2 text-sm text-slate-300">
                          <div className="flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            <span>Respostas na comunidade precisam ter <strong>mais de 100 caracteres</strong> para dar pontos</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            <span>Limite de <strong>10 respostas pontuadas por dia</strong> na comunidade</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            <span>Limite de <strong>20 curtidas por dia</strong> (dar e receber)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            <span>Pontos por <strong>primeira resposta</strong> em cada tópico (não duplica)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            <span>Níveis aumentam a cada <strong>100 pontos</strong> acumulados</span>
                          </div>
                        </div>
                      </div>

                      {/* Dica */}
                      <div className="text-center p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                        <p className="text-emerald-400 font-medium mb-2">
                          💡 Dica Pro
                        </p>
                        <p className="text-slate-300 text-sm">
                          Combine diferentes atividades para maximizar seus pontos! Participe da comunidade, 
                          complete lições e participe de mentorias para subir rapidamente no ranking.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
        </div>
      </PageLayout>
    </>
  );
};

export default StudentGamification;
