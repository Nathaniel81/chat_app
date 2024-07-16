import { useEffect, useRef, useState, useCallback } from "react";
import ChatTopBar from "./ChatTopBar";
import { useUserContext } from "../../context/UserContext";
import { IMessage } from "../../types";
import MessageList from "./MessageList";
import ChatBottomBar from "./ChatBottomBar";

const MessageContainer = () => {
  const {selectedUser, setSelectedUser, user:loggedUser } = useUserContext();
  const clientRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchMessages = async (roomName: string) => {
    try {
      setMessagesLoading(true);
      const response = await fetch(`/api/messages/${roomName}/`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

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
      console.log(data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    newClient.onclose = () => {
      console.log('WebSocket Client Disconnected');
    };

    }, [loggedUser, setMessages]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedUser(null);
    };
    document.addEventListener("keydown", handleEscape);  
    return () => document.removeEventListener("keydown", handleEscape);
  }, [setSelectedUser]);

  useEffect(() => {
    if (selectedUser && loggedUser) {
      const roomName = [loggedUser.id, selectedUser.id].sort().join('_');
      fetchMessages(roomName);
      connectWebSocket(roomName);
    }
    //eslint-disable-next-line
  }, [selectedUser, connectWebSocket]);

  return (
    <div className='flex flex-col justify-between w-full h-full'>
      <ChatTopBar />  
      <div className='w-full overflow-y-auto overflow-x-hidden h-full flex flex-col'>
        <MessageList messagesLoading={messagesLoading} messages={messages}/>
        <ChatBottomBar clientRef={clientRef} loggedUser={loggedUser} />
      </div>
    </div>
  );
};

export default MessageContainer;
