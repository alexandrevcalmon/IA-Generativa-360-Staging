
import { useStudentPoints, useStudentAchievements, useAvailableAchievements, usePointsHistory } from '@/hooks/useStudentGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap, Award, TrendingUp, Calendar } from 'lucide-react';

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

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gamificação
            </h1>
            <p className="text-gray-600">
              Acompanhe seu progresso e conquistas
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              <Trophy className="w-3 h-3 mr-1" />
              Nível {currentLevel}
            </Badge>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              <Star className="w-3 h-3 mr-1" />
              {totalPoints} pontos totais
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="space-y-6">
          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Progresso do Nível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nível {currentLevel}</span>
                  <span className="text-sm text-gray-500">
                    {pointsProgress}/100 pontos
                  </span>
                </div>
                <Progress value={pointsProgress} className="h-3" />
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>{currentPoints} pontos atuais</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span>{streakDays} dias seguidos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Suas Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentAchievements?.length ? (
                    studentAchievements.map((achievement: any) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Award className="h-6 w-6 text-yellow-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {achievement.achievements.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {achievement.achievements.description}
                          </p>
                        </div>
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: achievement.achievements.badge_color }}
                        >
                          +{achievement.achievements.points_required}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Nenhuma conquista ainda. Continue estudando!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  Próximas Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableAchievements?.slice(0, 5).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center">
                        <Star className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{achievement.name}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      {achievement.points_required && (
                        <Badge variant="outline" className="text-xs">
                          {achievement.points_required} pts
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Points History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Histórico de Pontos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pointsHistory?.length ? (
                  pointsHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {entry.description || entry.action_type}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(entry.earned_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        +{entry.points} pontos
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum histórico de pontos ainda.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentGamification;
