
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, CheckCircle, Users, Globe } from "lucide-react";
import { CompanyMentorship } from "@/hooks/useCompanyMentorships";

interface MentorshipStatsGridProps {
  mentorships: CompanyMentorship[];
}

export const MentorshipStatsGrid = ({ mentorships }: MentorshipStatsGridProps) => {
  const upcomingMentorships = mentorships.filter(m => 
    new Date(m.scheduled_at) > new Date() && m.status === 'scheduled'
  );

  const pastMentorships = mentorships.filter(m => 
    new Date(m.scheduled_at) <= new Date() || m.status === 'completed'
  );

  const companyMentorships = mentorships.filter(m => m.type === 'company');
  const collectiveMentorships = mentorships.filter(m => m.type === 'collective');
  const exclusiveMentorships = mentorships.filter(m => m.type === 'exclusive');

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-blue-900/20 border border-blue-500/30">
              <CalendarDays className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{upcomingMentorships.length}</p>
              <p className="text-sm text-gray-400">Próximas Sessões</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-emerald-900/20 border border-emerald-500/30">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pastMentorships.length}</p>
              <p className="text-sm text-gray-400">Concluídas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-purple-900/20 border border-purple-500/30">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{companyMentorships.length}</p>
              <p className="text-sm text-gray-400">Da Empresa</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-indigo-900/20 border border-indigo-500/30">
              <Globe className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{collectiveMentorships.length}</p>
              <p className="text-sm text-gray-400">Coletivas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/30 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-orange-900/20 border border-orange-500/30">
              <Users className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{exclusiveMentorships.length}</p>
              <p className="text-sm text-gray-400">Exclusivas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
