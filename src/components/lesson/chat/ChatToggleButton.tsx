
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { ChatToggleButtonProps } from './types';

export const ChatToggleButton = ({ onClick, className }: ChatToggleButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-4 right-4 rounded-full px-3 sm:px-4 py-2 sm:py-3 shadow-lg z-50 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 ${className}`}
      size="lg"
    >
      <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
      <span className="text-xs sm:text-sm font-medium hidden sm:inline">Tire Dúvidas Sobre Esta Aula com IA</span>
      <span className="text-xs sm:text-sm font-medium sm:hidden">Dúvidas</span>
    </Button>
  );
};
