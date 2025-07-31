import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface Activity {
  id?: string | number;
  title: string;
  description?: string;
  time: string;
  type?: string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'default';
  points?: number;
}

interface RecentActivitiesProps {
  title?: string;
  activities: Activity[];
  className?: string;
  showPoints?: boolean;
  emptyMessage?: string;
}

export function RecentActivities({
  title = "Atividades Recentes",
  activities,
  className,
  showPoints = false,
  emptyMessage = "Nenhuma atividade recente encontrada."
}: RecentActivitiesProps) {
  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={cn("card-premium", className)}>
      <CardHeader>
        <CardTitle className="section-title-gradient">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <ul className="space-y-4">
            {activities.map((activity, index) => (
              <li 
                key={activity.id || index} 
                className="flex items-center justify-between border-b border-calmon-100 pb-3 last:border-0 last:pb-0 hover:bg-calmon-50/50 p-2 rounded-lg transition-all duration-300"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-calmon-800">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activity.type && (
                    <Badge className={cn(
                      getStatusColor(activity.status),
                      "badge-glass text-xs"
                    )}>
                      {activity.type}
                    </Badge>
                  )}
                  {showPoints && activity.points !== undefined && (
                    <Badge className="badge-premium text-xs">
                      +{activity.points} pts
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-muted-foreground glass-effect p-8 rounded-lg">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
