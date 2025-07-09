
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface Activity {
  type: string;
  title: string;
  time: string;
  points: number;
}

interface StudentRecentActivitiesProps {
  activities: Activity[];
}

export const StudentRecentActivities = ({ activities }: StudentRecentActivitiesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  +{activity.points}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma atividade recente ainda.</p>
            <p className="text-sm text-gray-400 mt-1">Comece a estudar para ver suas atividades aqui!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
