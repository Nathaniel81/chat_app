import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PreferencesTab from '../components/PreferencesTab';
import { useUserContext } from '../context/UserContext';
import ChatLayout from '../components/chat/ChatLayout';
import Cookies from "js-cookie";

const Home = () => {
  const { users, user } = useUserContext();
  const layout = Cookies.get("react-resizable-panels:layout");
  const defaultLayout = layout ? JSON.parse(layout) : undefined;

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/signin')
    }
  }, [user, navigate]);

  return (
    <main className='flex h-screen flex-col items-center justify-center p-4 md:px-24 py-32 gap-4'>
      <PreferencesTab />
  
      {/* dotted bg */}
      <div
        className='absolute top-0 z-[-2] h-screen w-screen dark:bg-[#000000] dark:bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] 
        dark:bg-[size:20px_20px] bg-[#ffffff] bg-[radial-gradient(#00000033_1px,#ffffff_1px)] bg-[size:20px_20px]'
        aria-hidden='true'
      />
  
      <div className='z-10 border rounded-lg max-w-5xl w-full min-h-[85vh] text-sm lg:flex'>
        <ChatLayout defaultLayout={defaultLayout} users={users} />
      </div>
    </main>
  )
}

export default Home
