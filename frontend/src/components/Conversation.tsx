import { formatDate } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageSeenSvg } from "../lib/svgs";
import { ImageIcon, Users, VideoIcon } from "lucide-react";
import { IMessage, IUser } from "../types";
import { useUser } from "../context/UserContext";

interface ConversationProps {
  conversation: {
    id: number;
    admin?: IUser;
    chat_room: string;
    participants: IUser[];
    is_group: boolean;
    created_at: string;
    last_message?: IMessage;
    group_image?: string;
    is_online?: boolean;
  };
}

const Conversation = ({ conversation }: ConversationProps) => {
  const { user } = useUser();
  const secondUser = conversation.participants.filter((p) => p.id !== user?.id)[0];
  const conversationImage = conversation.group_image || "/placeholder.png";
  const conversationName = conversation.is_group ? "Group Chat" : secondUser?.username;
  const lastMessage = conversation.last_message;
  const lastMessageType = lastMessage?.message_type;
  const messageSeen = lastMessage?.seen_by?.includes(user?.id ?? 0);
  
  return (
      <>
        <div className={`flex gap-2 items-center p-3 hover:bg-chat-hover cursor-pointer`}>
          <Avatar className='border border-gray-900 overflow-visible relative'>
            {secondUser?.is_online && (
              <div className='absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground' />
            )}
            <AvatarImage src={conversationImage} className='object-cover rounded-full' />
            <AvatarFallback>
              <div className='animate-pulse bg-gray-tertiary w-full h-full rounded-full'></div>
            </AvatarFallback>
          </Avatar>
          <div className='w-full'>
            <div className='flex items-center'>
              <h3 className='text-xs lg:text-sm font-medium'>{conversationName}</h3>
              <span className='text-[10px] lg:text-xs text-gray-500 ml-auto'>
                {formatDate(new Date(lastMessage?.created_at || conversation.created_at).getTime())}
              </span>
            </div>
            <p className='text-[12px] mt-1 text-gray-500 flex items-center gap-1 '>
              {/* {lastMessage?.user.id === user?.id && <MessageSeenSvg />} */}
              {lastMessage?.user.id === user?.id && messageSeen && <MessageSeenSvg />}
              {conversation.is_group && <Users size={16} />}
              {!lastMessage && "Say Hi!"}
              {lastMessage && lastMessageType === "text" && lastMessage?.text?.length > 30 ? (
                <span className='text-xs'>{lastMessage?.text.slice(0, 30)}...</span>
              ) : (
                <span className='text-xs'>{lastMessage?.text}</span>
              )}
              {lastMessageType === "image" && <ImageIcon size={16} />}
              {lastMessageType === "video" && <VideoIcon size={16} />}
            </p>
          </div>
        </div>
        <hr className='h-[1px] mx-10 bg-gray-primary' />
      </>
    );
  };
  
  export default Conversation;
