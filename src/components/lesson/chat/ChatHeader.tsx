
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, X, BookOpen } from 'lucide-react';
import { ChatHeaderProps } from './types';

export const ChatHeader = ({ lessonId, onClose }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700/50 bg-slate-900/20 flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 flex-shrink-0" />
        <h3 className="text-sm sm:text-base font-medium text-white flex-shrink-0">Assistente IA</h3>
        {lessonId && (
          <div className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 rounded-full flex-shrink-0">
            <BookOpen className="h-3 w-3" />
            <span className="hidden sm:inline">Contexto da Lição</span>
            <span className="sm:hidden">Contexto</span>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 sm:h-10 sm:w-10 p-0 bg-slate-700/80 hover:bg-red-500/20 hover:text-red-400 text-white flex-shrink-0 border border-slate-500/50 hover:border-red-500/50 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm"
        title="Fechar chat"
      >
        <X className="h-6 w-6 sm:h-7 sm:w-7 text-white font-bold stroke-2" />
      </Button>
    </div>
  );
};
