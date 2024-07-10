import RightPanel from '../components/RightPanel';
import LeftPanel from '../components/LeftPanel';
import SignIn from './Signin';
import { useUser } from '../context/UserContext';

const MainApp = () => {
  const { user } = useUser();

  if (!user) {
    return <SignIn />;
  }

  return (
    <div className='flex overflow-y-hidden h-[calc(100vh-50px)] max-w-[1700px] mx-auto bg-left-panel'>
      <div className='fixed top-0 left-0 w-full h-36 bg-green-primary dark:bg-transparent -z-30' />
      <LeftPanel />
      <RightPanel />
    </div>
  );
};

export default MainApp;
