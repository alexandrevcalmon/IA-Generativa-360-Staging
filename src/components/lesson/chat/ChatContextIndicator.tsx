
import React from 'react';
import { ChatContextIndicatorProps } from './types';

export const ChatContextIndicator = ({ lessonId, materialsCount }: ChatContextIndicatorProps) => {
  if (!lessonId) return null;

  const hasContent = materialsCount > 0;

  return (
    <div className={`text-xs sm:text-sm p-2 sm:p-3 rounded text-center ${
      hasContent 
        ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20' 
        : 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
    }`}>
      {hasContent ? (
        <>
          <span className="hidden sm:inline">📚 Tenho acesso ao conteúdo da lição e {materialsCount} material(is) de apoio</span>
          <span className="sm:hidden">📚 Acesso a {materialsCount} material(is) de apoio</span>
        </>
      ) : (
        <>
          <span className="hidden sm:inline">📖 Tenho acesso ao conteúdo da lição básica</span>
          <span className="sm:hidden">📖 Acesso ao conteúdo básico</span>
          <div className="text-xs mt-1 text-amber-400">
            <span className="hidden sm:inline">💡 Adicione materiais de apoio para respostas mais detalhadas</span>
            <span className="sm:hidden">💡 Adicione materiais para respostas melhores</span>
          </div>
        </>
      )}
    </div>
  );
};
