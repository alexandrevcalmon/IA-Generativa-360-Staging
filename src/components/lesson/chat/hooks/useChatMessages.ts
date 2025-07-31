
import { useState } from 'react';
import { useSendChatMessage, ChatMessage } from '@/hooks/useAIChatSessions';

export const useChatMessages = () => {
  const [hasLessonContext, setHasLessonContext] = useState(false);
  const sendMessageMutation = useSendChatMessage();

  const handleSendMessage = async (
    inputMessage: string,
    currentSessionId: string | null,
    messages: ChatMessage[],
    setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void,
    lessonId?: string
  ) => {
    if (!inputMessage.trim() || !currentSessionId) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const response = await sendMessageMutation.mutateAsync({
        sessionId: currentSessionId,
        messages: updatedMessages,
        lessonId
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString()
      };

      setMessages((prev: ChatMessage[]) => [...prev, assistantMessage]);
      
      // Update context indicator if response includes lesson context
      if ('hasLessonContext' in response) {
        setHasLessonContext(response.hasLessonContext);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the user message if sending fails
      setMessages(messages);
    }
  };

  return {
    hasLessonContext,
    handleSendMessage,
    sendMessageMutation
  };
};
