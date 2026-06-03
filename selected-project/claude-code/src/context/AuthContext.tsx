import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock login - replace with actual API call
      const mockUsers = [
        {
          id: '1',
          username: 'john_doe',
          email: 'john@example.com',
          fullName: 'John Doe',
          bio: 'Software developer and tech enthusiast',
          profilePicture: 'https://via.placeholder.com/150',
          coverPhoto: 'https://via.placeholder.com/800x200',
          gender: 'male' as const,
          dateOfBirth: '1990-01-01',
          location: 'New York, NY',
          privacySettings: {
            profileVisibility: 'public' as const,
            friendRequests: 'everyone' as const,
            commentVisibility: 'everyone' as const,
            messageVisibility: 'friends' as const,
          },
          role: 'user' as const,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        {
          id: '2',
          username: 'admin_user',
          email: 'admin@example.com',
          fullName: 'Admin User',
          bio: 'System administrator',
          profilePicture: 'https://via.placeholder.com/150',
          coverPhoto: 'https://via.placeholder.com/800x200',
          gender: 'other' as const,
          dateOfBirth: '1985-01-01',
          location: 'San Francisco, CA',
          privacySettings: {
            profileVisibility: 'public' as const,
            friendRequests: 'everyone' as const,
            commentVisibility: 'everyone' as const,
            messageVisibility: 'everyone' as const,
          },
          role: 'admin' as const,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
      ];

      const foundUser = mockUsers.find(u => u.email === email);
      
      if (foundUser && password === 'password') {
        setUser(foundUser);
        localStorage.setItem('token', 'mock-jwt-token');
        localStorage.setItem('user', JSON.stringify(foundUser));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock registration - replace with actual API call
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username || userData.email?.split('@')[0] || 'user',
        email: userData.email || '',
        fullName: userData.fullName || '',
        bio: userData.bio || '',
        profilePicture: userData.profilePicture,
        coverPhoto: userData.coverPhoto,
        gender: userData.gender,
        dateOfBirth: userData.dateOfBirth,
        location: userData.location,
        privacySettings: {
          profileVisibility: 'public',
          friendRequests: 'everyone',
          commentVisibility: 'everyone',
          messageVisibility: 'friends',
        },
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(newUser);
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}