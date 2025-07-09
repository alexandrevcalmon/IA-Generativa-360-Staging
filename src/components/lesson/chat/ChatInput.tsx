
import React from 'react';
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with message:', inputMessage);
    if (inputMessage?.trim() && !isDisabled) {
      onSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input value changed:', e.target.value);
    onInputChange(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage?.trim() && !isDisabled) {
        const fakeEvent = new Event('submit') as any;
        handleSubmit(fakeEvent);
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
    <div className="border-t bg-white p-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={inputMessage || ''}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={lessonId ? "Pergunte sobre a lição..." : "Digite sua pergunta..."}
          className="flex-1 text-sm"
          disabled={isDisabled}
          autoComplete="off"
          autoFocus={false}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!inputMessage?.trim() || isDisabled}
          className="px-3 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
