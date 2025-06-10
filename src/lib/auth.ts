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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
const TOKEN_KEY = 'devdesk_auth_token';
const REFRESH_TOKEN_KEY = 'devdesk_refresh_token';
const USER_KEY = 'devdesk_user';

class AuthService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Store authentication data securely
  private storeAuthData(authResponse: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
  }

  // Clear stored authentication data
  private clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Get current user from storage
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  // Make authenticated API request
  private async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Create demo user for development
  private createDemoUser(email: string, name?: string): User {
    return {
      id: `demo_${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isEmailVerified: true,
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          slack: false,
        },
        timezone: 'UTC',
        language: 'en',
      },
    };
  }

  // Create demo auth response
  private createDemoAuthResponse(email: string, name?: string): AuthResponse {
    const user = this.createDemoUser(email, name);
    return {
      user,
      token: `demo_token_${Date.now()}`,
      refreshToken: `demo_refresh_${Date.now()}`,
    };
  }

  // Sign in
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Try real API first
      const response = await this.apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      this.storeAuthData(response);
      return response;
    } catch (error) {
      console.warn('Real authentication failed, using demo authentication:', error);
      
      // Fallback to demo authentication for development
      if (import.meta.env.VITE_ENABLE_MOCK_AUTH !== 'false') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Demo authentication logic
        if (credentials.email && credentials.password.length >= 6) {
          const authResponse = this.createDemoAuthResponse(credentials.email);
          this.storeAuthData(authResponse);
          return authResponse;
        } else {
          throw new Error('Invalid email or password (must be at least 6 characters)');
        }
      }
      
      throw error;
    }
  }

  // Sign up
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      // Try real API first
      const response = await this.apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      this.storeAuthData(response);
      return response;
    } catch (error) {
      console.warn('Real registration failed, using demo authentication:', error);
      
      // Fallback to demo authentication for development
      if (import.meta.env.VITE_ENABLE_MOCK_AUTH !== 'false') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Demo registration logic
        if (userData.email && userData.password.length >= 6 && userData.name) {
          const authResponse = this.createDemoAuthResponse(userData.email, userData.name);
          this.storeAuthData(authResponse);
          return authResponse;
        } else {
          throw new Error('Please fill in all required fields (password must be at least 6 characters)');
        }
      }
      
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      // Try to notify the server about logout
      await this.apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout API call failed, clearing local data:', error);
    }
    
    // Always clear local auth data
    this.clearAuthData();
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      // Try real API first
      const response = await this.apiRequest<{ user: User }>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      
      // Update stored user data
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.warn('Profile update failed, using local update:', error);
      
      // Fallback to local update for demo
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      throw new Error('No user session found');
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch (error) {
      console.warn('Password change failed:', error);
      throw new Error('Failed to change password. Please try again.');
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    try {
      await this.apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.warn('Forgot password failed:', error);
      throw new Error('Failed to send password reset email. Please try again.');
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await this.apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    } catch (error) {
      console.warn('Password reset failed:', error);
      throw new Error('Failed to reset password. Please try again.');
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    try {
      await this.apiRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.warn('Email verification failed:', error);
      throw new Error('Failed to verify email. Please try again.');
    }
  }

  // Refresh token
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.apiRequest<{ token: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      
      return response.token;
    } catch (error) {
      console.warn('Token refresh failed:', error);
      this.clearAuthData();
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.getToken() && this.getCurrentUser());
  }
}

export const authService = new AuthService();

// Export types for convenience
export type { User, LoginCredentials, SignUpData, AuthResponse }; 