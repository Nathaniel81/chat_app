import { 
  createContext, 
  useState, 
  useContext, 
  ReactNode, 
  useEffect, 
  useRef 
} from 'react';
import { IUser } from '../types';

interface UserContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  logout: () => void;
  users: IUser[];
  setUsers: (users: IUser[]) => void;
  selectedUser: IUser | null;
  setSelectedUser: (user: IUser | null) => void;
  updateUserStatus: (username: string, is_online: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const selectedUserRef = useRef<IUser | null>(null);

  const logout = async () => {
    setSelectedUser(null);
    const url = '/api/user/logout/';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.error('Login failed. Check your credentials or API response.');
      }
    } catch (error) {
      console.error('Error making the request:', error);
    }
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUserStatus = (username: string, is_online: boolean) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.username === username ? { ...user, is_online } : user
      )
    );
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      logout, 
      users, 
      setUsers,
      selectedUser, 
      setSelectedUser, 
      updateUserStatus 
    }}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
