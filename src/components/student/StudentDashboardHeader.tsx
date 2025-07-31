
import { useAuth } from '@/hooks/auth/useAuth';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp } from 'lucide-react';

interface StudentDashboardHeaderProps {
  totalPoints: number;
  currentStreak: number;
}

export const StudentDashboardHeader = ({ totalPoints, currentStreak }: StudentDashboardHeaderProps) => {
  const { companyUserData } = useAuth();

  return (
    <div className="bg-calmon-gradient border-b p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Olá, {companyUserData?.name || 'Estudante'}! 👋
          </h1>
          <p className="text-calmon-100">
            Continue sua jornada de aprendizado
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
            <Trophy className="w-3 h-3 mr-1" />
            {totalPoints} pontos
          </Badge>
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
            <TrendingUp className="w-3 h-3 mr-1" />
            {currentStreak} dias seguidos
          </Badge>
        </div>
      </div>
    </div>
  );
};

