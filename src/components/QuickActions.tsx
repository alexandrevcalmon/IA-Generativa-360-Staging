import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ActionItem {
  title: string;
  description?: string;
  icon: LucideIcon;
  href: string;
  color?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
}

interface QuickActionsProps {
  title?: string;
  actions: ActionItem[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function QuickActions({ 
  title = "Ações Rápidas", 
  actions, 
  className,
  columns = 2
}: QuickActionsProps) {
  const getColumnsClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 3:
        return 'grid-cols-1 sm:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
      case 2:
      default:
        return 'grid-cols-1 sm:grid-cols-2';
    }
  };

  return (
    <Card className={cn("card-premium", className)}>
      <CardHeader>
        <CardTitle className="section-title-gradient">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${getColumnsClass()} gap-4`}>
          {actions.map((action, index) => (
            <Button
              key={`${action.title}-${index}`}
              variant={action.variant || "outline"}
              className={cn(
                "h-auto flex flex-col items-center justify-center p-6 gap-3 text-center btn-glass hover:scale-105 transition-all duration-300",
                action.color
              )}
              asChild
            >
              <Link to={action.href}>
                <div className="glass-effect p-3 rounded-full mb-3">
                  <action.icon className="h-6 w-6 text-calmon-700" />
                </div>
                <div>
                  <div className="font-medium text-calmon-800">{action.title}</div>
                  {action.description && (
                    <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                  )}
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
