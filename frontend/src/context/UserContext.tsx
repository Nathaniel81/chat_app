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
  selectedUser: IUser | null;
  setSelectedUser: (user: IUser | null) => void;
  fetchUsers: () => void;
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

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const fetchUsers = async () => {
    if (!user || !user.id) {
      console.error('Current user is not defined');
      return;
    }
  
    try {
      const response = await fetch(`/api/user/list/?user_id=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
  

  const updateUserStatus = (username: string, is_online: boolean) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.username === username ? { ...user, is_online } : user
      )
    );
  };

  useEffect(() => {
    fetchUsers();
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
      selectedUser, 
      setSelectedUser, 
      fetchUsers, 
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
