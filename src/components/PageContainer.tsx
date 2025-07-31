import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
  noPadding?: boolean;
}

/**
 * Componente para padronizar o container das páginas
 * Permite definir largura máxima, centralização e padding
 */
export function PageContainer({
  children,
  className,
  maxWidth = 'full',
  centered = true,
  noPadding = false,
}: PageContainerProps) {
  // Define a classe de largura máxima
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-screen-sm';
      case 'md':
        return 'max-w-screen-md';
      case 'lg':
        return 'max-w-screen-lg';
      case 'xl':
        return 'max-w-screen-xl';
      case '2xl':
        return 'max-w-screen-2xl';
      case 'full':
      default:
        return 'max-w-full';
    }
  };

  return (
    <div
      className={cn(
        getMaxWidthClass(),
        centered && 'mx-auto',
        !noPadding && 'px-3 sm:px-4 lg:px-6',
        className
      )}
    >
      {children}
    </div>
  );
}
