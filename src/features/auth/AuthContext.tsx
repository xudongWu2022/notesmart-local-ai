import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../shared/types/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  testCredentials: {
    email: string;
    password: string;
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

const TEST_USER: User & { password: string } = {
  id: 1,
  email: 'test@example.com',
  password: '123456',
  name: 'Test User',
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      if (credentials.password === TEST_USER.password) {
        setIsAuthenticated(true);
        setUser({ id: TEST_USER.id, email: TEST_USER.email, name: TEST_USER.name });
        return true;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        testCredentials: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
