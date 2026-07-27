import type { LoginCredentials, AuthResponse } from '../../shared/types/auth';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    if (email === '123456@gmail.com' && password === '123456') {
      return {
        token: 'fake-jwt-token',
        user: {
          id: 1,
          email: '123456',
          name: 'Test User',
        },
      };
    }
    throw new Error('Invalid credentials');
  },

  async register(email: string, password: string): Promise<AuthResponse> {
    return {
      token: 'fake-jwt-token',
      user: {
        id: 1,
        email,
        name: 'New User',
      },
    };
  },

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  },
};
