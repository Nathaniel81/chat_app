import { Avatar, AvatarImage } from "../ui/avatar";
import { Info, X } from "lucide-react";
import { useUserContext } from "../../context/UserContext";

const ChatTopBar = () => {
  const { selectedUser, setSelectedUser } = useUserContext();

  return (
    <div className='w-full h-20 flex p-4 justify-between items-center border-b'>
      <div className='flex items-center gap-2'>
        <Avatar className='flex justify-center items-center relative overflow-visible'>
          {selectedUser?.is_online && (
            <div className='absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground' />
          )}
          <AvatarImage
            src={selectedUser?.image || "/user-placeholder.png"}
            alt='User Image'
            className='w-10 h-10 object-cover rounded-full'
          />
        </Avatar>
        <span className='font-medium'>{selectedUser?.username}</span>
      </div>  
        <div className='flex gap-2'>
          <Info className='text-muted-foreground cursor-pointer hover:text-primary' />
          <X
            className='text-muted-foreground cursor-pointer hover:text-primary'
            onClick={() => setSelectedUser(null)}
          />
        </div>
    </div>
  );
};

export default ChatTopBar;
