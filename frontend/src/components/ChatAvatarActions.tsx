import { useConversation } from "../context/ConversationContext";
import { IMessage, IUser } from "../types";
import { Ban, LogOut } from "lucide-react";
import React from "react";

type ChatAvatarActionsProps = {
    message: IMessage;
    me?: IUser | null;
};

const ChatAvatarActions = ({ me, message }: ChatAvatarActionsProps) => {
  const { 
    selectedConversation, 
    // setSelectedConversation 
  } = useConversation();

  const isMember = selectedConversation?.participants.includes(message.user);
  // const kickUser = useMutation(api.conversations.kickUser);
  // const createConversation = useMutation(api.conversations.createConversation);
  const fromAI = false;
  const isGroup = selectedConversation?.is_group;
  const handleKickUser = async (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log("Kick user..")
  };

  const handleCreateConversation = async () => {
      console.log("create convo..")
  };

  return (
    <div
      className='text-[11px] flex gap-4 justify-between font-bold cursor-pointer group'
      onClick={handleCreateConversation}
    >
      {isGroup && message.user.username}  
      {!isMember && !fromAI && isGroup && <Ban size={16} className='text-red-500' />}
      {isGroup && isMember && selectedConversation?.admin === me && (
          <LogOut size={16} className='text-red-500 opacity-0 group-hover:opacity-100' onClick={handleKickUser} />
      )}
    </div>
  );
};

export default ChatAvatarActions;
