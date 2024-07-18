import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage } from '../components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { useUserContext } from '../context/UserContext';
import { useToast } from '../components/ui/use-toast';

const SignUp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useUserContext();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast({
        description: 'Passwords do not match',
      });
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);

    if (image) {
      formData.append('profile_picture', image);
    }

    try {
      const response = await fetch('/api/user/register/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      localStorage.setItem('user', JSON.stringify(responseData));
      setUser(responseData);
      navigate('/');
    } catch (error) {
      console.error('Failed to sign up:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-transparent">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      <form className="grid w-full max-w-sm items-center gap-2.5" onSubmit={handleSignUp}>
        <Label htmlFor="username">Username</Label>
        <Input 
          type="text" 
          id="username" 
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)} />

        <Label htmlFor="email">Email</Label>
        <Input 
          type="email" 
          id="email" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} />

        <Label htmlFor="image">Image</Label>
        <Input 
          type="file" 
          id="image" 
          onChange={handleImageChange} />
        
        {imagePreview && (
          <Avatar className="mt-2">
            <AvatarImage
              src={imagePreview}
              alt="User Image"
              className="border-2 border-white rounded-full"
            />
          </Avatar>
        )}

        <Label htmlFor="password">Password</Label>
        <Input 
          type="password" 
          id="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />

        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input 
          type="password" 
          id="confirm-password" 
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)} />

        {loading ? (
          <Button className="w-full mt-4" disabled>
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Please wait...
          </Button>
        ) : (
          <Button className="w-full mt-4" type='submit'>
            Sign Up
          </Button>
        )}
      </form>
    </div>
  );
};

export default SignUp;
