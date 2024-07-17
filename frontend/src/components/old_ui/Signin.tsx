import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const SignIn: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSignIn = async () => {
    const url = '/api/user/login/';
    const data = { username, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const responseData = await response.json();
        localStorage.setItem('user', JSON.stringify(responseData));
        setUser(responseData);
        navigate('/');
      } else {
        console.error('Login failed. Check your credentials or API response.');
      }
    } catch (error) {
      console.error('Error making the request:', error);
    }
  };

  return (
    <div className="signin-container flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl mb-4">Sign In</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 border rounded mb-4"
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded mb-4"
        placeholder="Password"
      />
      <button onClick={handleSignIn} className="bg-blue-500 text-white p-2 rounded">
        Sign In
      </button>
    </div>
  );
};

export default SignIn;
