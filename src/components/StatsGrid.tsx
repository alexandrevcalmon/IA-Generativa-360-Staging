import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface StatItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
  footer?: React.ReactNode;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const getColumnsClass = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className={cn(`grid gap-4 ${getColumnsClass()}`, className)}>
      {stats.map((stat, index) => (
        <Card key={`${stat.title}-${index}`} className="overflow-hidden hover:scale-105 transition-transform duration-300 !bg-gray-800 !border-gray-700 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption mb-1 !text-gray-300">{stat.title}</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">{stat.value}</p>
                {stat.footer && <div className="mt-2">{stat.footer}</div>}
              </div>
              <div className={cn(
                'p-3 rounded-lg shadow-lg',
                stat.bgColor || 'bg-gradient-to-r from-orange-500 to-red-500'
              )}>
                <stat.icon className={cn(
                  'h-6 w-6 text-white',
                  stat.color
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}