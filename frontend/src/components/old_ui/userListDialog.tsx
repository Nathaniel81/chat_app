import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage} from "./ui/avatar";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ImageIcon, MessageSquareDiff } from "lucide-react";
import { IUser } from "../types";
import { useConversation } from "../context/ConversationContext";
import { useUser } from "../context/UserContext";

const UserListDialog = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [renderedImage, setRenderedImage] = useState("");

  const { addConversation, setSelectedConversation, conversations } = useConversation();
  const { user: me } = useUser();
  const imgRef = useRef<HTMLInputElement>(null);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);  
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user/list');
      const data = await response.json();
      setSelectedUsers([]);
      setUsers(data);
    } catch (error) {
        console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
      fetchUsers();
  }, []);

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return;
    setIsLoading(true);
    try {
      const isGroup = selectedUsers.length > 1;
      const room_name = [me?.username, ...selectedUsers.map(user => user.username)].sort().join('_');
      
      // Check if the conversation already exists in the conversation store
      const existingConversation = conversations.find(convo => {
        const participantUsernames = convo.participants.map(user => user.username).sort();
        return !convo.is_group && participantUsernames.includes(me?.username ?? '') && participantUsernames.includes(selectedUsers[0].username);
      });  
      if (existingConversation) {
        // If conversation exists, set it as the selected conversation
        setSelectedConversation(existingConversation);
        dialogCloseRef.current?.click();
      } else {
          // If conversation does not exist, make the API call to create a new conversation
          const response = await fetch('/api/user/conversations/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                is_group: isGroup,
                group_name: isGroup ? groupName : null,
                participants: [me, ...selectedUsers],
                room_name,
            }),
          });

          if (!response.ok) {
              throw new Error('Failed to create conversation');
          }

          const newConversation = await response.json();
          addConversation(newConversation);
          setSelectedConversation(newConversation);
        }

      dialogCloseRef.current?.click();
      setSelectedUsers([]);
      setGroupName("");
      setSelectedImage(null);
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };    

  useEffect(() => {
    if (!selectedImage) return setRenderedImage("");
    const reader = new FileReader();
    reader.onload = (e) => setRenderedImage(e.target?.result as string);
    reader.readAsDataURL(selectedImage);
  }, [selectedImage]);

    return (
      <Dialog>
        <DialogTrigger>
          <MessageSquareDiff size={20} />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogClose ref={dialogCloseRef} />
              <DialogTitle>USERS</DialogTitle>
            </DialogHeader>

            <DialogDescription>Start a new chat</DialogDescription>
            {renderedImage && (
              <div className='w-16 h-16 relative mx-auto'>
                <img src={renderedImage} alt='user image' className='rounded-full object-cover' />
              </div>
            )}
            <input
              type='file'
              accept='image/*'
              ref={imgRef}
              hidden
              onChange={(e) => setSelectedImage(e.target.files![0])}
            />
            {selectedUsers.length > 1 && (
              <>
                <Input
                    placeholder='Group Name'
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                />
                <Button className='flex gap-2' onClick={() => imgRef.current?.click()}>
                    <ImageIcon size={20} />
                    Group Image
                </Button>
              </>
            )}
            <div className='flex flex-col gap-3 overflow-auto max-h-60'>
              {users?.map((user: IUser) => (
                <div
                  key={user.id}
                  className={`flex gap-3 items-center p-2 rounded cursor-pointer active:scale-95 transition-all ease-in-out duration-300
                     ${selectedUsers.includes(user) ? "bg-green-primary" : ""}`}
                  onClick={() => {
                    if (selectedUsers.includes(user)) {
                      setSelectedUsers(selectedUsers.filter((u) => u !== user));
                    } else {
                      setSelectedUsers([...selectedUsers, user]);
                    }
                  }}
                >
                <Avatar className='overflow-visible'>
                  {user.is_online && (
                    <div className='absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground' />
                  )}
                  <AvatarImage src={user.image} className='rounded-full object-cover' />
                  <AvatarFallback>
                    <div className='animate-pulse bg-gray-tertiary w-full h-full rounded-full'></div>
                  </AvatarFallback>
                </Avatar>
                  <div className='w-full '>
                    <div className='flex items-center justify-between'>
                      <p className='text-md font-medium'>{user.username || user.email.split("@")[0]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className='flex justify-between'>
              <Button variant={"outline"}>Cancel</Button>
                <Button
                  onClick={handleCreateConversation}
                  disabled={selectedUsers.length === 0 || (selectedUsers.length > 1 && !groupName) || isLoading}
                >
                  {isLoading ? (
                    <div className='w-5 h-5 border-t-2 border-b-2  rounded-full animate-spin' />
                      ) : (
                      "Create"
                    )}
                </Button>
              </div>
          </DialogContent>
      </Dialog>
    );
};

export default UserListDialog;
