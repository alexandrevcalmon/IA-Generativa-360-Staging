
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
      <div className="space-y-3 p-1">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <Bot className="h-6 w-6 mt-1 text-blue-600 flex-shrink-0" />
            )}
            <div
              className={`max-w-[75%] p-3 rounded-lg text-sm leading-relaxed break-words ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
            {message.role === 'user' && (
              <User className="h-6 w-6 mt-1 text-gray-600 flex-shrink-0" />
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <Bot className="h-6 w-6 mt-1 text-blue-600 flex-shrink-0" />
            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando conteúdo...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  );
};
