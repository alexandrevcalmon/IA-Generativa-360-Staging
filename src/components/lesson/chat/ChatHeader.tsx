
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, X, BookOpen } from 'lucide-react';
import { ChatHeaderProps } from './types';

export const ChatHeader = ({ lessonId, onClose }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-white flex-shrink-0">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900">Assistente IA</h3>
        {lessonId && (
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <BookOpen className="h-3 w-3" />
            <span>Contexto da Lição</span>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-6 w-6 p-0 hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
