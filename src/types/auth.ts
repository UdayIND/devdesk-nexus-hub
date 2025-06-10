export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
  company?: string;
  phone?: string;
  createdAt: string;
  lastLoginAt: string;
  isEmailVerified?: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
  };
  timezone: string;
  language: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  company?: string;
  phone?: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt?: string;
}

export interface AuthError {
  message: string;
  code: string;
  field?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerification {
  token: string;
}

export interface OAuthProvider {
  name: string;
  id: 'google' | 'github' | 'microsoft';
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthState {
  provider: string;
  action: 'signin' | 'signup';
  redirectTo?: string;
}

export interface OAuthResponse {
  provider: string;
  code: string;
  state: string;
  error?: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  lastActivity: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

export interface UseAuthReturn extends AuthContextType {
  // Additional hook-specific methods can be added here
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: AuthError;
  timestamp: string;
}

export interface AuthApiResponse extends ApiResponse<{
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}> {}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  backupCodes: string[];
  trustedDevices: TrustedDevice[];
  loginHistory: LoginAttempt[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  lastUsed: string;
  ipAddress: string;
  userAgent: string;
}

export interface LoginAttempt {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason?: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  token: string;
  backupCode?: string;
} 