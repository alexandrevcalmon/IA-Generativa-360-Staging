
import React from 'react';
import { ChatContextIndicatorProps } from './types';

export const ChatContextIndicator = ({ lessonId, materialsCount }: ChatContextIndicatorProps) => {
  if (!lessonId) return null;

  const hasContent = materialsCount > 0;

  return (
    <div className={`text-xs p-2 rounded text-center ${
      hasContent 
        ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20' 
        : 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
    }`}>
      {hasContent ? (
        <>
          📚 Tenho acesso ao conteúdo da lição e {materialsCount} material(is) de apoio
        </>
      ) : (
        <>
          📖 Tenho acesso ao conteúdo da lição básica
          <div className="text-xs mt-1 text-amber-400">
            💡 Adicione materiais de apoio para respostas mais detalhadas
          </div>
        </>
      )}
    </div>
  );
};
