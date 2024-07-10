import { 
  createContext, 
  useState, 
  useContext, 
  ReactNode, 
  useEffect 
} from 'react';
import { Conversation } from '../types';

interface ConversationContextType {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  setSelectedConversation: (conversation: Conversation | null) => void;
  addConversation: (conversation: Conversation) => void;
  fetchConversations: () => void;
  updateConversation: (conversationId: number, updatedFields: Partial<Conversation>) => void;
  updateUserStatus: (username: string, is_online: boolean) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/user/conversations/', {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const updateConversation = (conversationId: number, updatedFields: Partial<Conversation>) => {
    setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === conversationId ? { ...conv, ...updatedFields } : conv
        )
    );
  };

  const addConversation = (conversation: Conversation) => {
    setConversations((prevConversations) => [conversation, ...prevConversations]);
  };

  const updateUserStatus = (username: string, is_online: boolean) => {
    setConversations((prevConversations) =>
        prevConversations.map((conv) => ({
            ...conv,
            participants: conv.participants.map((user) =>
                user.username === username ? { ...user, is_online } : user
            ),
        }))
    );
};

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <ConversationContext.Provider value={{ 
      conversations, 
      selectedConversation, 
      setSelectedConversation, 
      addConversation, 
      fetchConversations,
      updateConversation,
      updateUserStatus,
      }}>
      {children}
    </ConversationContext.Provider>
  );
};

// eslint-disable-next-line
export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};
