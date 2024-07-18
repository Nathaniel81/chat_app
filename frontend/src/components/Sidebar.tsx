import { LogOut } from "lucide-react";
import { useUserContext } from "../context/UserContext";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { ThemeSwitch } from "./ThemeSwitch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./ui/tooltip";
import { useEffect, useRef } from "react";
import { useToast } from "./ui/use-toast";
import { getCookie } from "../lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const clientRef = useRef<WebSocket | null>(null);
  const { 
    selectedUser, 
    setSelectedUser, 
    user, 
    users, 
    setUsers,
    updateUserStatus, 
    logout
  } = useUserContext();
  const { toast } = useToast();

  const fetchUsers = async () => {
    const token = getCookie('access_token');

    if (!token) {
      console.error('No access token found in cookies');
      logout();
      return;
    }

    if (!user || !user.id) {
      console.error('Current user is not defined');
      return;
    }
  
    try {
      const response = await fetch(`/api/user/list/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }  
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
      const newClient = new WebSocket(`ws://127.0.0.1:8000/ws/chat/global/?user_id=${user?.id}`);
      clientRef.current = newClient;
      newClient.onmessage = (message) => {
        const data = JSON.parse(message.data as string);
        if (data.type === 'user_status') {
          updateUserStatus(data.user, data.status === 'online');
        }
        if (data.type === 'global_message') {
          const { message, room_name } = data;
          const userIds = room_name.split('_').map(Number);
          // Check if the current user is in the userIds array
          if (userIds.includes(user?.id) && message.user.id !== user?.id) {
            // Check if the message is from the selected user
            if (!selectedUser || selectedUser?.id !== message.user.id) {
              toast({
                title: `${message.user.username}`,
                description: message.text,
              });
            }
          }
        }
      };
      return () => {
        newClient.close();
      };
    }
  }, [user]);
  
  return (
    <div className='group relative flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2  max-h-full overflow-auto bg-background'>
      {!isCollapsed && (
        <div className='flex justify-between p-2 items-center'>
          <div className='flex gap-2 items-center text-2xl'>
            <p className='font-medium'>Chats</p>
          </div>
        </div>
      )}

      <ScrollArea className='gap-2 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2'>
        {users.map((user, idx) =>
          isCollapsed ? (
            <TooltipProvider key={idx}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <>
                    <Avatar className='my-1 flex justify-center items-center overflow-visible relative'>
                      {user?.is_online && (
                        <div className='absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground' />
                      )}
                      <AvatarImage
                        src={user.image || "/user-placeholder.png"}
                        alt='User Image'
                        className='border-2 border-white rounded-full w-10 h-10'
                      />
                      <AvatarFallback>{user.username}</AvatarFallback>
                    </Avatar>
                    <span className='sr-only'>{user.username}</span>
                  </>
                </TooltipTrigger>
                <TooltipContent side='right' className='flex items-center gap-4'>
                  {user.username}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              key={idx}
              variant={"grey"}
              size='xl'
              className={cn(
                "w-full justify-start gap-4 my-1",
                selectedUser?.username === user.username &&
                  "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white shrink"
              )}
              onClick={() => setSelectedUser(user)}
            >
              <Avatar className='flex justify-center items-center relative overflow-visible'>
                {user?.is_online && (
                  <div className='absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-foreground' />
                )}
                <AvatarImage
                  src={user.image || "/user-placeholder.png"}
                  alt={"User image"}
                  className='w-10 h-10'
                />
                <AvatarFallback>{user.username}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col max-w-28'>
                <span>{user.username}</span>
              </div>
            </Button>
          )
        )}
      </ScrollArea>

      {/* logout section */}
      <div className='mt-auto'>
        <div className='flex justify-between items-center gap-2 md:px-6 py-2'>
          {!isCollapsed && (
            <div className='hidden md:flex gap-2 items-center'>
              <Avatar className='flex justify-center items-center'>
                <AvatarImage
                  src={user?.image || "/user-placeholder.png"}
                  alt='avatar'
                  referrerPolicy='no-referrer'
                  className='w-8 h-8 border-2 border-white rounded-full'
                />
              </Avatar>
              <p className='font-bold'>{user?.username}</p>
            </div>
          )}
          {isCollapsed ? (
            <div className='space-y-4 flex-col items-center justify-center ml-5 md:ml-0'>
              <div className='-ml-[8px]'>
                <ThemeSwitch />
              </div>
              <LogOut size={22} cursor={"pointer"} onClick={logout} />
            </div>
            ): (
            <div className='flex items-center justify-between gap-3'>
              <ThemeSwitch />
              <LogOut size={22} cursor={"pointer"} onClick={logout} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
