import React, { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

const SignIn: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserContext();

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
    } finally {
      setLoading(false);
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-transparent">
      <h1 className="text-2xl mb-4">Sign In</h1>
      <form className="grid w-full max-w-sm items-center gap-2.5" onSubmit={handleSignIn}>
        <Label htmlFor="username">Username</Label>
        <Input 
          type="text" 
          id="username" 
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)} />

        <Label htmlFor="password">Password</Label>
        <Input 
          type="password" 
          id="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />

        {loading ? (
          <Button className="w-full mt-4" disabled>
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Please wait...
          </Button>
        ) : (
          <Button className="w-full mt-4" type='submit'>
            Sign In
          </Button>
        )}
      </form>
      <p className="mt-4">
        Don't have an account? <Link to="/signup" className="text-blue-500">Sign up</Link>
      </p>
    </div>
  );
};

export default SignIn;
