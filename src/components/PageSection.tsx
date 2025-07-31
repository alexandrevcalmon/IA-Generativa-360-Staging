import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface PageSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  headerContent?: ReactNode;
  transparent?: boolean;
  noPadding?: boolean;
  variant?: 'default' | 'adapta-red' | 'adapta-green' | 'adapta-purple';
}

export function PageSection({
  title,
  description,
  children,
  className,
  contentClassName,
  headerClassName,
  headerContent,
  transparent = false,
  noPadding = false,
  variant = 'default',
}: PageSectionProps) {
  // Se for transparente, renderiza sem o Card
  if (transparent) {
    return (
      <div className={cn("space-y-3 sm:space-y-4", className)}>
        {(title || description || headerContent) && (
          <div className={cn("space-y-1", headerClassName)}>
            <div className="flex items-center justify-between">
              <div>
                {title && <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>}
                {description && <p className="text-xs sm:text-sm text-slate-300">{description}</p>}
              </div>
              {headerContent && <div>{headerContent}</div>}
            </div>
          </div>
        )}
        <div className={contentClassName}>{children}</div>
      </div>
    );
  }

  // Escolhe a classe do card com base na variante
  const getCardClass = () => {
    switch (variant) {
      case 'adapta-red':
        return 'card-adapta-red';
      case 'adapta-green':
        return 'card-adapta-green';
      case 'adapta-purple':
        return 'card-adapta-purple';
      default:
        return 'card-premium';
    }
  };

  // Caso contrário, renderiza com o Card
  return (
    <Card className={cn(getCardClass(), className)}>
      {(title || description || headerContent) && (
        <CardHeader className={cn("pb-2", headerClassName)}>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle className={variant === 'default' ? "section-title" : "text-white font-semibold text-lg sm:text-xl"}>{title}</CardTitle>}
              {description && <CardDescription className={variant === 'default' ? "section-description" : "text-white/80 text-xs sm:text-sm"}>{description}</CardDescription>}
            </div>
            {headerContent && <div>{headerContent}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(noPadding ? "p-0" : "", contentClassName)}>
        <div className="animate-fade-in">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
