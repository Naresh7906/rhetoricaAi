import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeData from '../templates/employee.json';

export type UserRole = 'employee' | 'hr' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface UserContextType {
  user: User | null;
  loginWithSSO: (role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock users data
const mockUsers = {
  employee: {
    ...employeeData,
    role: 'employee' as UserRole,
  },
  hr: {
    id: '2',
    name: 'HR Admin',
    email: 'hr@rhetorica.ai',
    role: 'hr' as UserRole,
    avatar: 'https://picsum.photos/200',
  }
};

// Mock SSO authentication function
const mockSSOAuth = async (role: UserRole): Promise<User> => {
  if (!role) throw new Error('Role is required');
  
  // Simulate SSO verification delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return user based on role
  if (role === 'hr') {
    return mockUsers.hr;
  } else {
    return {
      id: mockUsers.employee.id,
      name: mockUsers.employee.name,
      email: mockUsers.employee.email,
      role: mockUsers.employee.role,
      avatar: mockUsers.employee.avatar
    };
  }
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user session on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const loginWithSSO = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const userData = await mockSSOAuth(role);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect based on role
      navigate(`/${role}/dashboard`);
    } catch (error) {
      console.error('SSO login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // In a real SSO implementation, we would also invalidate the SSO session
    navigate('/login');
  };

  return (
    <UserContext.Provider value={{ user, loginWithSSO, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 