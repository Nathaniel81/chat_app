import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader, SendHorizontal, ThumbsUp, Image as ImageIcon } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { IUser } from "../../types";
import EmojiPicker from "./EmojiPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "../ui/dialog";

interface ChatBottomBarProps {
  clientRef: React.MutableRefObject<WebSocket | null>;
  loggedUser: IUser | null;
}

const ChatBottomBar: React.FC<ChatBottomBarProps> = ({ clientRef, loggedUser }) => {
  const [msgText, setMsgText] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const isPending = false;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setMsgText(msgText + "\n");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (msgText.trim() !== '' && clientRef.current) {
      const message = { text: msgText, userId: loggedUser?.id, messageType: 'text' };
      clientRef.current.send(JSON.stringify(message));
      setMsgText('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chat_images");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dqm9mc5da/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setImgUrl(data.secure_url);
    } catch (error) {
      console.error("Image upload error:", error);
    }
  };

  return (
    <div className='p-2 flex justify-between w-full items-center gap-2'>
      {!msgText.trim() && (
        <label>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          <ImageIcon
            size={20}
            className='cursor-pointer text-muted-foreground'
          />
        </label>
      )}

      <Dialog open={!!imgUrl}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>
              This is a preview of the image you are about to send.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-center items-center relative h-96 w-full mx-auto'>
            <img src={imgUrl!} alt='Image Preview' className='object-contain' />
          </div>
          <DialogFooter>
            <Button
              type='submit'
              onClick={() => {
                if (clientRef.current && imgUrl) {
                  const message = { text: imgUrl, userId: loggedUser?.id, messageType: "image" };
                  clientRef.current.send(JSON.stringify(message));
                  setImgUrl(null);
                }
              }}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        <motion.div
          layout
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.5 },
            layout: {
              type: "spring",
              bounce: 0.15,
            },
          }}
          className='w-full relative'
        >
          <Textarea
            autoComplete='off'
            placeholder='Aa'
            rows={1}
            className='w-full border rounded-full flex items-center h-9 resize-none overflow-hidden bg-background min-h-0'
            value={msgText}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setMsgText(e.target.value);
            }}
            ref={textAreaRef}
          />
          <div className='absolute right-2 bottom-0.5'>
            <EmojiPicker
              onChange={(emoji) => {
                setMsgText(msgText + emoji);
                if (textAreaRef.current) {
                  textAreaRef.current.focus();
                }
              }}
            />
          </div>
        </motion.div>

        {msgText.trim() ? (
          <Button
            className='h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0'
            variant={"ghost"}
            size={"icon"}
            onClick={handleSendMessage}
          >
            <SendHorizontal size={20} className='text-muted-foreground' />
          </Button>
        ) : (
          <Button
            className='h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0'
            variant={"ghost"}
            size={"icon"}
          >
            {!isPending && (
              <ThumbsUp
                size={20}
                className='text-muted-foreground'
                onClick={() => {
                  if (clientRef.current) {
                    const message = { text: "👍", userId: loggedUser?.id, messageType: "text" };
                    clientRef.current.send(JSON.stringify(message));
                  }
                }}
              />
            )}
            {isPending && <Loader size={20} className='animate-spin' />}
          </Button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBottomBar;
