
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { ChatInputProps } from './types';

export const ChatInput = ({ 
  inputMessage, 
  onInputChange, 
  onSubmit, 
  isDisabled, 
  lessonId 
}: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Manter o foco no input quando não estiver desabilitado
  useEffect(() => {
    if (!isDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDisabled]);

  // Manter o foco quando a mensagem for limpa (após envio)
  useEffect(() => {
    if (inputMessage === '' && !isDisabled && inputRef.current) {
      // Usar setTimeout para garantir que o foco seja aplicado após a re-renderização
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [inputMessage, isDisabled]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('Form submitted with message:', inputMessage);
    if (inputMessage?.trim() && !isDisabled) {
      onSubmit(); // Chama sem evento
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input value changed:', e.target.value);
    onInputChange(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage?.trim() && !isDisabled) {
        handleSubmit(); // Chama sem evento
      }
    }
  };

  console.log('ChatInput render:', { 
    inputMessage, 
    isDisabled, 
    hasLessonId: !!lessonId,
    inputLength: inputMessage?.length || 0
  });

  return (
    <div className="border-t border-slate-700/50 bg-slate-900 p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
        <Input
          ref={inputRef}
          value={inputMessage || ''}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={lessonId ? "Pergunte sobre a lição..." : "Digite sua pergunta..."}
          className="flex-1 text-sm sm:text-base border-slate-600 bg-slate-800/50 text-slate-200 placeholder:text-slate-400"
          disabled={isDisabled}
          autoComplete="off"
          autoFocus={false}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!inputMessage?.trim() || isDisabled}
          className="px-3 sm:px-4 h-10 sm:h-12 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-700/50 disabled:text-slate-500"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </form>
    </div>
  );
};
