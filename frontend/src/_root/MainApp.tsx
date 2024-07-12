import { useEffect, useRef } from 'react';
import RightPanel from '../components/RightPanel';
import LeftPanel from '../components/LeftPanel';
import SignIn from './Signin';
import { useUser } from '../context/UserContext';
import { useConversation } from '../context/ConversationContext';
import { useToast } from '../components/ui/use-toast';
// import { ToastAction } from '../components/ui/toast';


const MainApp = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const { updateUserStatus, updateLastMessage, selectedConversation } = useConversation();
  const clientRef = useRef<WebSocket | null>(null);
  const selectedConversationRef = useRef(selectedConversation);
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
    console.log("Updated selectedConversationRef:", selectedConversationRef.current);
  }, [selectedConversation]);

  useEffect(() => {
    if (user) {
      const newClient = new WebSocket(`ws://127.0.0.1:8000/ws/chat/global/?user_id=${user?.id}`);
      clientRef.current = newClient;
      newClient.onmessage = (message) => {
        const data = JSON.parse(message.data as string);
        if (data.type === 'user_status') {
          updateUserStatus(data.user, data.status === 'online');
        }
        if (data.type === 'global_message') {
          const { room_name, last_message } = data;
          const currentSelectedConversation = selectedConversationRef.current;
          console.log("Current Selected Conversation:", currentSelectedConversation);

          // Check if the message is from the selected conversation
          if ((!currentSelectedConversation || 
            currentSelectedConversation.chat_room !== room_name) && 
            last_message?.user?.id !== user?.id) {
            toast({
              title: `${last_message.user.username}`,
              description: last_message.text,
            });
          }
          updateLastMessage(room_name, last_message);
        }
      };
      return () => {
        newClient.close();
      };
    }
  }, [user]);

    if (!user) {
        return <SignIn />;
    }

    return (
      <div className='flex overflow-y-hidden h-[calc(100vh-50px)] max-w-[1700px] mx-auto bg-left-panel'>
        <div className='fixed top-0 left-0 w-full h-36 bg-green-primary dark:bg-transparent -z-30' />
          <LeftPanel />
          <RightPanel />
      </div>
    );
};

export default MainApp;
