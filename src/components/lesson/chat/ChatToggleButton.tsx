
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { ChatToggleButtonProps } from './types';

export const ChatToggleButton = ({ onClick, className }: ChatToggleButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50 ${className}`}
      size="lg"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};
