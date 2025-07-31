
import React, { useRef, useEffect } from 'react';
import { Bot, User, Loader2 } from 'lucide-react';
import { ChatMessagesProps } from './types';

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto overflow-x-hidden"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div className="space-y-2 sm:space-y-3 p-1">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 mt-1 text-emerald-400 flex-shrink-0" />
            )}
            <div
              className={`max-w-[80%] sm:max-w-[75%] p-2 sm:p-3 rounded-lg text-xs sm:text-sm leading-relaxed break-words ${
                message.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-sm shadow-sm'
                  : 'bg-slate-800/50 text-slate-200 rounded-bl-sm border border-slate-700/50 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
            {message.role === 'user' && (
              <User className="h-5 w-5 sm:h-6 sm:w-6 mt-1 text-slate-400 flex-shrink-0" />
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <Bot className="h-5 w-5 sm:h-6 sm:w-6 mt-1 text-emerald-400 flex-shrink-0" />
            <div className="bg-slate-800/50 border border-slate-700/50 p-2 sm:p-3 rounded-lg rounded-bl-sm text-xs sm:text-sm flex items-center gap-2 text-slate-300">
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              Analisando conteúdo...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  );
};
