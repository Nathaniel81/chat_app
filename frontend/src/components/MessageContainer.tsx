// import { messages } from "../dummy-data/db";
import { useConversation } from "../context/ConversationContext";
import ChatBubble from "./ChatBubble";
import { useEffect, useState, useRef } from 'react';
import { IMessage, IUser } from "../types";

interface MessageContainerProps {
  messages: IMessage[];
  loggedUser?: IUser | null;
}

const MessageContainer: React.FC<MessageContainerProps> = ({ messages: msgs }) => {
  const { selectedConversation, updateConversation } = useConversation();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.chat_room);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (msgs.length > 0 && selectedConversation) {
      const newMessage = msgs[msgs.length - 1];
      setMessages((prevMessages) => [...prevMessages, ...msgs]);
      // Update the last message of the selected conversation
      updateConversation(selectedConversation.id, { last_message: newMessage });
    }
    //eslint-disable-next-line
  }, [msgs]);

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  const fetchMessages = async (chatRoom: string) => {
    try {
      const response = await fetch(`/api/messages/${chatRoom}/`, {
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  if (!selectedConversation) {
    return null;
  }

  return (
    <div className='relative p-3 flex-1 overflow-auto h-full bg-chat-tile-light dark:bg-chat-tile-dark'>
      <div className='mx-12 flex flex-col gap-3'>
        {messages?.map((msg, idx) => (
          <div key={idx} ref={lastMessageRef}>
            <ChatBubble message={msg} previousMessage={idx > 0 ? messages[idx - 1] : undefined} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageContainer;
