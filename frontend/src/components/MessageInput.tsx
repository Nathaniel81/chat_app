import { Laugh, Mic, Send } from "lucide-react";
import { Input } from "./ui/input";
import React, { useState } from "react";
import { Button } from "./ui/button";
import useClickOutside from "../hooks/useClickOutside";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { IUser } from "../types";

interface MessageInputProps {
  clientRef: React.MutableRefObject<WebSocket | null>;
  loggedUser: IUser | null;
}

const MessageInput: React.FC<MessageInputProps> = ({ clientRef, loggedUser }) => {
  const [msgText, setMsgText] = useState("");
  const { ref, isComponentVisible, setIsComponentVisible } = useClickOutside(false);
  const handleSendTextMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (msgText.trim() !== '' && clientRef.current) {
        const message = { text: msgText, user: loggedUser?.username };
        clientRef.current.send(JSON.stringify(message));
        setMsgText('');
    }
  };

  return (
    <div className='bg-gray-primary p-2 flex gap-4 items-center mt-auto'>
      <div className='relative flex gap-2 ml-2'>
        <div ref={ref} onClick={() => setIsComponentVisible(true)}>
          {isComponentVisible && (
            <EmojiPicker
              theme={Theme.DARK}
              onEmojiClick={(emojiObject) => {
                  setMsgText((prev) => prev + emojiObject.emoji);
              }}
              style={{ position: "absolute", bottom: "1.5rem", left: "1rem", zIndex: 50 }}
            />
          )}
          <Laugh className='text-gray-600 dark:text-gray-400' />
        </div>
      </div>
      <form onSubmit={handleSendTextMsg} className='w-full flex gap-3'>
        <div className='flex-1'>
          <Input
            type='text'
            placeholder='Type a message'
            className='py-2 text-sm w-full rounded-lg shadow-sm bg-gray-tertiary focus-visible:ring-transparent'
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
          />
        </div>
        <div className='mr-4 flex items-center gap-3'>
          {msgText.length > 0 ? (
            <Button
              type='submit'
              size={"sm"}
              className='bg-transparent text-foreground hover:bg-transparent'
            >
            <Send />
            </Button>
          ) : (
            <Button
              type='submit'
              size={"sm"}
              className='bg-transparent text-foreground hover:bg-transparent'
            >
            <Mic />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
