
import React from 'react';
import { ChatContextIndicatorProps } from './types';

export const ChatContextIndicator = ({ lessonId, materialsCount }: ChatContextIndicatorProps) => {
  if (!lessonId) return null;

  const hasContent = materialsCount > 0;

  return (
    <div className={`text-xs p-2 rounded text-center ${
      hasContent 
        ? 'text-blue-600 bg-blue-50' 
        : 'text-amber-600 bg-amber-50'
    }`}>
      {hasContent ? (
        <>
          📚 Tenho acesso ao conteúdo da lição e {materialsCount} material(is) de apoio
        </>
      ) : (
        <>
          📖 Tenho acesso ao conteúdo da lição básica
          <div className="text-xs mt-1 text-amber-700">
            💡 Adicione materiais de apoio para respostas mais detalhadas
          </div>
        </>
      )}
    </div>
  );
};
