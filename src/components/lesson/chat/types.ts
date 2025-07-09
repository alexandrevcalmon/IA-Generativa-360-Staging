
import { ChatMessage } from '@/hooks/useAIChatSessions';

export interface AIChatWidgetProps {
  lessonId?: string;
  companyId?: string;
  className?: string;
}

export interface ChatState {
  isOpen: boolean;
  currentSessionId: string | null;
  messages: ChatMessage[];
  inputMessage: string;
  hasLessonContext: boolean;
}

export interface ChatHeaderProps {
  lessonId?: string;
  onClose: () => void;
}

export interface ChatContextIndicatorProps {
  lessonId?: string;
  materialsCount: number;
}

export interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export interface ChatInputProps {
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isDisabled: boolean;
  lessonId?: string;
}

export interface ChatToggleButtonProps {
  onClick: () => void;
  className?: string;
}
