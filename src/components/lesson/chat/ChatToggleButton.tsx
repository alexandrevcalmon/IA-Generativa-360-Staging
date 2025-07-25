
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { ChatToggleButtonProps } from './types';

export const ChatToggleButton = ({ onClick, className }: ChatToggleButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-4 right-4 rounded-full px-4 py-2 shadow-lg z-50 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 ${className}`}
      size="lg"
    >
      <Bot className="h-5 w-5" />
      <span className="text-sm font-medium">Tire suas dúvidas</span>
    </Button>
  );
};
