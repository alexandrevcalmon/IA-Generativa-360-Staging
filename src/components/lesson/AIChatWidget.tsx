
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useLessonMaterials } from '@/hooks/useLessonMaterials';
import { useAuth } from '@/hooks/auth';

import { ChatToggleButton } from './chat/ChatToggleButton';
import { ChatHeader } from './chat/ChatHeader';
import { ChatContextIndicator } from './chat/ChatContextIndicator';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { useChatSession } from './chat/hooks/useChatSession';
import { useChatMessages } from './chat/hooks/useChatMessages';
import { AIChatWidgetProps } from './chat/types';

export const AIChatWidget = ({ lessonId, companyId, className }: AIChatWidgetProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');

  const { data: materials = [] } = useLessonMaterials(lessonId || '');
  
  const {
    currentSessionId,
    messages,
    setMessages,
    handleCreateSession,
    createSessionMutation,
    sessions
  } = useChatSession(lessonId, companyId);

  const {
    handleSendMessage,
    sendMessageMutation
  } = useChatMessages();

  const handleOpenChat = () => {
    setIsOpen(true);
    if (!currentSessionId && sessions.length === 0) {
      handleCreateSession();
    }
  };

  const handleInputChange = (value: string) => {
    setInputMessage(value);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    
    if (!inputMessage.trim() || !currentSessionId) {
      return;
    }
    
    await handleSendMessage(
      inputMessage,
      currentSessionId,
      messages,
      setMessages,
      lessonId
    );
    
    setInputMessage('');
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <ChatToggleButton
          onClick={handleOpenChat}
          className={className}
        />
      )}

      {/* Chat Widget - Highest z-index to stay above everything */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80 h-[500px] shadow-xl z-[9999] flex flex-col">
          {/* Header - Fixed at top */}
          <ChatHeader
            lessonId={lessonId}
            onClose={() => setIsOpen(false)}
          />
          
          {/* Content area - Takes remaining space */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Context Indicator - Only show when there are materials */}
            {lessonId && materials.length > 0 && (
              <div className="px-3 pt-2 flex-shrink-0">
                <ChatContextIndicator
                  lessonId={lessonId}
                  materialsCount={materials.length}
                />
              </div>
            )}

            {/* Messages Area - Scrollable flex area */}
            <div className="flex-1 min-h-0 px-3 py-2">
              <ChatMessages
                messages={messages}
                isLoading={sendMessageMutation.isPending}
              />
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0">
              {currentSessionId ? (
                <ChatInput
                  inputMessage={inputMessage}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                  isDisabled={sendMessageMutation.isPending}
                  lessonId={lessonId}
                />
              ) : (
                <div className="p-3 border-t bg-white">
                  <Button
                    onClick={handleCreateSession}
                    variant="outline"
                    size="sm"
                    disabled={createSessionMutation.isPending}
                    className="w-full"
                  >
                    {createSessionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Iniciando...
                      </>
                    ) : (
                      'Iniciar Conversa'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
