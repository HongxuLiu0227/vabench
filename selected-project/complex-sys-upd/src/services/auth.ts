import { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
};

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = LoginCredentials & {
  name: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
        const mockUser: User = {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        navigate('/dashboard');
      } else if (credentials.email === 'user@example.com' && credentials.password === 'user123') {
        const mockUser: User = {
          id: '2',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user'
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        navigate('/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        email: data.email,
        name: data.name,
        role: 'user'
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      navigate('/dashboard');
      message.success('Registration successful!');
    } catch (error) {
      message.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth
  };
};

export const login = async () => {};
export const logout = async () => {};
export const refreshToken = async () => {};

export const authService = {
  async validateToken(token: string): Promise<User | null> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }
};