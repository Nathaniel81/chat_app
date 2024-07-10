import { useEffect, useCallback, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Video, X } from "lucide-react";
import MessageInput from "./MessageInput";
import MessageContainer from "./MessageContainer";
import ChatPlaceHolder from "./ChatPlaceholder";
import { useConversation } from "../context/ConversationContext";
import { useUser } from "../context/UserContext";
import { IMessage } from "../types";

const RightPanel = () => {
  const { selectedConversation } = useConversation();
  const { user: loggedUser } = useUser();
  const clientRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);  
  const connectWebSocket = useCallback((roomName: string) => {
    if (clientRef.current) {
        clientRef.current.close();
    }
    const newClient = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/?user_id=${loggedUser?.id}`);
    // const newClient = new WebSocket(`wss://chat-api-e2xv.onrender.com/ws/chat/${roomName}/?user_id=${loggedUser?.id}`);
    clientRef.current = newClient;
    newClient.onopen = () => {
        console.log('WebSocket Client Connected');
    };

    newClient.onmessage = (message) => {
        const data = JSON.parse(message.data as string);
        setMessages((prevMessages) => [...prevMessages, data]);
    };

    newClient.onclose = () => {
        console.log('WebSocket Client Disconnected');
    };

    }, [loggedUser, setMessages]);

  useEffect(() => {
    if (!loggedUser) return;
    if (selectedConversation) {
        connectWebSocket(selectedConversation.chat_room);
    }
  }, [selectedConversation, loggedUser, connectWebSocket]); 
  if (!selectedConversation) return <ChatPlaceHolder />; 
  const conversationName = selectedConversation.is_group
    ? selectedConversation.group_name
    : selectedConversation.participants.find((user) => user.id !== loggedUser?.id)?.username;

  return (
    <div className='w-3/4 flex flex-col'>
      <div className='w-full sticky top-0 z-50'>
        <div className='flex justify-between bg-gray-primary p-3'>
          <div className='flex gap-3 items-center'>
            <Avatar>
              <AvatarImage src={"./public/placeholder.png"} className='object-cover' />
              <AvatarFallback>
                  <div className='animate-pulse bg-gray-tertiary w-full h-full rounded-full'></div>
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <p className='font-semibold'>{conversationName}</p>
            </div>
          </div>
          <div className='flex gap-3'>
            <Video size={20} className='cursor-pointer' />
            <X size={20} className='cursor-pointer' />
          </div>
        </div>
      </div>
      <div className='overflow-y-scroll flex flex-col gap-3 p-5'>
        <MessageContainer messages={messages} />
      </div>
      <MessageInput clientRef={clientRef} loggedUser={loggedUser} />
    </div>
  );
};

export default RightPanel;
