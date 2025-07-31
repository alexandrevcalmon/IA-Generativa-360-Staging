
import { useState, useEffect } from 'react';
import { useAIChatSessions, useCreateChatSession, ChatMessage } from '@/hooks/useAIChatSessions';
import { toast } from 'sonner';

export const useChatSession = (lessonId?: string, companyId?: string) => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { data: sessions = [] } = useAIChatSessions(lessonId);
  const createSessionMutation = useCreateChatSession();

  // Load existing session or create new one when widget opens
  useEffect(() => {
    if (currentSessionId === null && sessions.length > 0) {
      const latestSession = sessions[0];
      setCurrentSessionId(latestSession.id);
      setMessages(latestSession.session_data || []);
    }
  }, [sessions, currentSessionId]);

  const handleCreateSession = async () => {
    try {
      const session = await createSessionMutation.mutateAsync({
        lessonId,
        companyId
      });
      setCurrentSessionId(session.id);
      setMessages([]);
      
      // Add welcome message from assistant with more context
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: lessonId 
          ? `Olá! Sou seu assistente de IA para esta lição. Tenho acesso ao conteúdo da lição e posso responder suas dúvidas sobre o material apresentado.

🎯 **Como posso ajudar:**
• Explicar conceitos da lição
• Esclarecer dúvidas sobre o conteúdo
• Fornecer exemplos práticos
• Resumir pontos importantes

📚 **Dica:** Se houver materiais de apoio carregados para esta lição, terei acesso a informações ainda mais detalhadas!

Como posso ajudá-lo com o conteúdo desta lição?` 
          : 'Olá! Sou seu assistente de IA. Como posso ajudá-lo hoje?',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Erro ao iniciar conversa com IA');
    }
  };

  return {
    currentSessionId,
    messages,
    setMessages,
    handleCreateSession,
    createSessionMutation,
    sessions
  };
};
