import React, { useEffect, useState, useRef } from 'react';

interface User {
  id: number;
  username: string;
  is_online: boolean;
}

interface SidebarProps {
  onUserSelect: (user: User) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onUserSelect }) => {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  console.log(currentUser)
  const [users, setUsers] = useState<User[]>([]);
  const clientRef = useRef<WebSocket | null>(null);
  console.log(users)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/user/list', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error('Error fetching users:', response.status);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const newClient = new WebSocket(`wss://chat-api-e2xv.onrender.com/ws/chat/global/?user_id=${currentUser?.id}`);
      // const newClient = new WebSocket(`ws://127.0.0.1:8000/ws/chat/global/?user_id=${currentUser?.id}`);
      clientRef.current = newClient;
      newClient.onmessage = (message) => {
        const data = JSON.parse(message.data as string);
        if (data.type === 'user_status') {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.username === data.user ? { ...user, is_online: data.status === 'online' } : user
            )
          );
        }
      }
      return () => {
        newClient.close();
      };
    }

  }, []);

  return (
    <div className="sidebar w-1/4 bg-gray-200 p-4">
      <h2 className="font-bold mb-4">Users</h2>
      <ul>
        {users.map((user) => {
          if (user.id !== currentUser.id) {
            return (
              <li
                key={user.id}
                className="py-2 border-b cursor-pointer"
                onClick={() => onUserSelect(user)}
              >
                {user.username}
                {user.is_online && <span className="ml-2 text-green-500">•</span>}
              </li>
            );
          }
          return null;
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
