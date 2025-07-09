
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{upcomingMentorships.length}</p>
              <p className="text-sm text-gray-600">Próximas Sessões</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{pastMentorships.length}</p>
              <p className="text-sm text-gray-600">Concluídas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{companyMentorships.length}</p>
              <p className="text-sm text-gray-600">Da Empresa</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold">{collectiveMentorships.length}</p>
              <p className="text-sm text-gray-600">Coletivas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
