import { useEffect, useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { cn } from "../../lib/utils";
import { IUser } from "../../types";
import Sidebar from "../Sidebar";
import { useUserContext } from "../../context/UserContext";
import MessageContainer from "./MessageContainer";

interface ChatLayoutProps {
  defaultLayout: number[] | undefined;
  users: IUser[];
}

const ChatLayout = ({ defaultLayout = [320, 480] }: ChatLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { selectedUser } = useUserContext();

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkScreenWidth();

    // Event listener for screen width changes
    window.addEventListener("resize", checkScreenWidth);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full items-stretch bg-background rounded-lg"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}; `;
      }}
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        collapsedSize={8}
        collapsible={true}
        minSize={isMobile ? 0 : 24}
        maxSize={isMobile ? 8 : 30}
        onCollapse={() => {
          setIsCollapsed(true);
          document.cookie = `react-resizable-panels:collapsed=true;`;
        }}
        onExpand={() => {
          setIsCollapsed(false);
          document.cookie = `react-resizable-panels:collapsed=false;`;
        }}
        className={cn(isCollapsed && "min-w-[80px] transition-all duration-300 ease-in-out")}
      >
        <Sidebar isCollapsed={isCollapsed} />
      </ResizablePanel>
      
      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
        <div className="h-full w-full">
          {selectedUser ? (
            <MessageContainer />
          ) : (
            <div className="flex justify-center items-center h-full w-full px-10">
              <div className="flex flex-col justify-center items-center gap-4">
                <img src='/logo.png' alt='Logo' className='w-[20%]' />
                <p className="text-muted-foreground text-center">Click on a chat to view the messages</p>
              </div>
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChatLayout;
