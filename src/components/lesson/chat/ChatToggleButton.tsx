
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { ChatToggleButtonProps } from './types';

export const ChatToggleButton = ({ onClick, className }: ChatToggleButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50 bg-emerald-600 hover:bg-emerald-700 text-white ${className}`}
      size="lg"
    >
      <Bot className="h-6 w-6" />
    </Button>
  );
};
