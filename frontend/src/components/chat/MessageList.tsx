import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useEffect, useRef } from "react";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { useUserContext } from "../../context/UserContext";
import { IMessage } from "../../types";

interface MessageListProps {
  messages: IMessage[];
  messagesLoading: boolean;
}

const MessageList = ({ messages, messagesLoading }: MessageListProps) => {
  const { selectedUser, user: currentUser } = useUserContext();
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the message container when new messages are added
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={messageContainerRef} className="w-full overflow-y-auto overflow-x-hidden h-full flex flex-col">
      <AnimatePresence>
        {!messagesLoading &&
          messages?.map((message, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: "spring",
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2,
                },
              }}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
              className={cn(
                "flex flex-col gap-2 p-4 whitespace-pre-wrap",
                message.user.id === currentUser?.id ? "items-end" : "items-start"
              )}
            >
              <div className="flex gap-3 items-center">
                {message.user.id == selectedUser?.id && (
                  <Avatar className="flex justify-center items-center">
                    <AvatarImage
                      src={selectedUser?.image || "/user-placeholder.png"}
                      alt="User Image"
                      className="border-2 border-white rounded-full"
                    />
                  </Avatar>
                )}
                {message.message_type === "text" ? (
                  <p className={`bg-accent p-3 mr-2 rounded-md text-sm font-light`}>{message.text}</p>
                ) : (
                  <img
                    src={message.text}
                    alt="Message Image"
                    className="border p-2 rounded h-40 md:h-52 object-cover"
                  />
                )}
                {message.user.id === currentUser?.id && (
                  <Avatar className="flex justify-center items-center mt-auto">
                    <AvatarImage
                      src={currentUser?.image || "/user-placeholder.png"}
                      alt="User Image"
                      className="border-2 border-white rounded-full"
                    />
                  </Avatar>
                )}
              </div>
            </motion.div>
          ))}
        {messagesLoading && (
          <>
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;
