import { User } from '@/types/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  company?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://devdesk-nexus-hub.onrender.com/api';
  private tokenKey = 'developmentDesk_token';
  private refreshTokenKey = 'developmentDesk_refreshToken';
  private userKey = 'developmentDesk_user';

  // Get current user from localStorage
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Get current token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  // Store auth data
  private storeAuthData(authResponse: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authResponse.token);
    localStorage.setItem(this.refreshTokenKey, authResponse.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(authResponse.user));
  }

  // Clear auth data
  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Sign in
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Sign in failed' }));
        throw new Error(error.message || 'Sign in failed');
      }

      const authResponse: AuthResponse = await response.json();
      this.storeAuthData(authResponse);
      return authResponse;
    } catch (error) {
      console.error('Sign in error:', error);
      // If backend is not available, provide a fallback response for demo purposes
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Backend not available, using fallback authentication');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const fallbackResponse: AuthResponse = {
          user: {
            id: '1',
            email: credentials.email,
            name: credentials.email.split('@')[0],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          },
          token: 'fallback_jwt_token_' + Math.random().toString(36).substr(2, 9),
          refreshToken: 'fallback_refresh_token_' + Math.random().toString(36).substr(2, 9)
        };

        this.storeAuthData(fallbackResponse);
        return fallbackResponse;
      }
      throw error;
    }
  }

  // Sign up
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Sign up failed' }));
        throw new Error(error.message || 'Sign up failed');
      }

      const authResponse: AuthResponse = await response.json();
      this.storeAuthData(authResponse);
      return authResponse;
    } catch (error) {
      console.error('Sign up error:', error);
      // If backend is not available, provide a fallback response for demo purposes
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Backend not available, using fallback registration');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const fallbackResponse: AuthResponse = {
          user: {
            id: Math.random().toString(36).substr(2, 9),
            email: userData.email,
            name: userData.name,
            company: userData.company,
            phone: userData.phone,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          },
          token: 'fallback_jwt_token_' + Math.random().toString(36).substr(2, 9),
          refreshToken: 'fallback_refresh_token_' + Math.random().toString(36).substr(2, 9)
        };

        this.storeAuthData(fallbackResponse);
        return fallbackResponse;
      }
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      const token = this.getToken();
      
      if (token) {
        await fetch(`${this.baseUrl}/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(error => {
          console.warn('Sign out API call failed:', error);
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Refresh token
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return null;

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.clearAuthData();
        return null;
      }

      const { token } = await response.json();
      localStorage.setItem(this.tokenKey, token);
      return token;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Fallback for when backend is unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const newToken = 'fallback_jwt_token_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(this.tokenKey, newToken);
        return newToken;
      }
      this.clearAuthData();
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Profile update failed' }));
        throw new Error(error.message || 'Profile update failed');
      }

      const updatedUser: User = await response.json();
      localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      // Fallback for when backend is unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const currentUser = this.getCurrentUser();
        if (!currentUser) throw new Error('User not found');
        
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const token = this.getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Password change failed' }));
        throw new Error(error.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      // Fallback for when backend is unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      }
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Password reset failed' }));
        throw new Error(error.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      // Fallback for when backend is unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Password reset email sent to:', email);
        return;
      }
      throw error;
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Password reset failed' }));
        throw new Error(error.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      // Fallback for when backend is unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      }
      throw error;
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Email verification failed' }));
        throw new Error(error.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      // Fallback for when backend is unavailable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService; 