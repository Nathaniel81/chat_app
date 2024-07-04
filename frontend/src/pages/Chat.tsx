import React, { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

interface Message {
  text: string;
  user: string;
}

interface User {
  id: number;
  username: string;
}

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const clientRef = useRef<WebSocket | null>(null);
  const loggedUser = useRef(JSON.parse(localStorage.getItem('user') || 'null'));
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async (roomName: string) => {
    try {
      const response = await fetch(`/api/messages/${roomName}/`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const connectWebSocket = useCallback((roomName: string) => {
    if (clientRef.current) {
      clientRef.current.close();
    }

    const newClient = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/?user_id=${loggedUser?.current.id}`);
    clientRef.current = newClient;

    newClient.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    newClient.onmessage = (message) => {
      const data = JSON.parse(message.data as string);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    newClient.onclose = () => {
      console.log('WebSocket Client Disconnected');
    };
  }, []);

  useEffect(() => {
    if (!loggedUser.current) {
      navigate('/signin');
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedUser) {
      const roomName = [loggedUser.current.username, selectedUser.username].sort().join('_');
      fetchMessages(roomName);
      connectWebSocket(roomName);
    }
  }, [selectedUser, connectWebSocket]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() !== '' && clientRef.current) {
      const message = { text: input, user: loggedUser.current.username };
      clientRef.current.send(JSON.stringify(message));
      setInput('');
    }
  };

  return (
    <div className="chat-app flex">
      <Sidebar onUserSelect={setSelectedUser} />
      {selectedUser ? (
        <form className="chat-container p-4 w-3/4" onSubmit={handleSend}>
          <div className="messages overflow-auto h-[70vh] mb-4 flex flex-col">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message p-2 my-2 rounded flex ${
                  msg.user === loggedUser.current.username
                    ? 'bg-blue-500 text-white self-end justify-end'
                    : 'bg-gray-200 text-black self-start'
                }`}
              >
                <strong>{msg.user}:</strong> {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-container flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow p-2 border rounded"
            />
            <button
              type="submit"
              className="ml-2 bg-blue-500 text-white p-2 rounded"
            >
              Send
            </button>
          </div>
        </form>
      ) : (
        <div className="w-3/4 flex items-center justify-center">
          <p>Select a user to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default Chat;
