
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, X, BookOpen } from 'lucide-react';
import { ChatHeaderProps } from './types';

export const ChatHeader = ({ lessonId, onClose }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-slate-700/50 bg-slate-900/20 flex-shrink-0">
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4 text-emerald-400" />
        <h3 className="text-sm font-medium text-white">Assistente IA</h3>
        {lessonId && (
          <div className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 rounded-full">
            <BookOpen className="h-3 w-3" />
            <span>Contexto da Lição</span>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-6 w-6 p-0 hover:bg-slate-800/50 text-slate-300"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
