import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Shield, 
  ArrowLeft, 
  Layers,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Github,
  Chrome,
  Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SignInScreenProps {
  onSignIn: (credentials: { email: string; password: string }) => void;
  onBack: () => void;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ onSignIn, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const shouldReduceMotion = useReducedMotion();

  // Add Mac gesture support for back navigation
  useEffect(() => {
    const handleGestureStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const startX = e.touches[0].clientX;
        
        const handleGestureMove = (moveEvent: TouchEvent) => {
          if (moveEvent.touches.length === 2) {
            const currentX = moveEvent.touches[0].clientX;
            const deltaX = currentX - startX;
            
            // Detect right swipe gesture (back navigation)
            if (deltaX > 100) {
              onBack();
              document.removeEventListener('touchmove', handleGestureMove);
              document.removeEventListener('touchend', handleGestureEnd);
            }
          }
        };
        
        const handleGestureEnd = () => {
          document.removeEventListener('touchmove', handleGestureMove);
          document.removeEventListener('touchend', handleGestureEnd);
        };
        
        document.addEventListener('touchmove', handleGestureMove);
        document.addEventListener('touchend', handleGestureEnd);
      }
    };

    // Also handle keyboard shortcut for back navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        onBack();
      }
    };

    document.addEventListener('touchstart', handleGestureStart);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('touchstart', handleGestureStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBack]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      onSignIn({ email, password });
      setIsLoading(false);
    }, 1500);
  };

  const handleSocialSignIn = (provider: string) => {
    if (provider === 'GitHub') {
      // GitHub OAuth
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      if (clientId) {
        const redirectUri = `${window.location.origin}/auth/github/callback`;
        const scope = 'read:user user:email';
        const state = Math.random().toString(36).substring(2, 15);
        
        sessionStorage.setItem('oauth_state', state);
        
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
        window.location.href = authUrl;
      } else {
        // Development mode - simulate successful login
        console.log('GitHub OAuth not configured - using demo login');
        onSignIn({ email: 'github-user@example.com', password: 'demo' });
      }
    } else if (provider === 'Google') {
      // Google OAuth
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (clientId) {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const scope = 'openid email profile';
        const state = Math.random().toString(36).substring(2, 15);
        
        sessionStorage.setItem('oauth_state', state);
        
        const authUrl = `https://accounts.google.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;
        window.location.href = authUrl;
      } else {
        // Development mode - simulate successful login
        console.log('Google OAuth not configured - using demo login');
        onSignIn({ email: 'google-user@example.com', password: 'demo' });
      }
    }
  };

  const socialProviders = [
    {
      name: 'GitHub',
      icon: <Github className="w-5 h-5" />,
      color: 'hover:bg-gray-700',
      onClick: () => handleSocialSignIn('GitHub')
    },
    {
      name: 'Google',
      icon: <Chrome className="w-5 h-5" />,
      color: 'hover:bg-blue-600',
      onClick: () => handleSocialSignIn('Google')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 relative overflow-hidden">
      {/* Simplified Background */}
      <div className="absolute inset-0">
        {/* Static gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        
        {/* Simplified grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9, rotateY: shouldReduceMotion ? 0 : -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.1 : 0.6 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.5 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Button>
          </motion.div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.5, delay: shouldReduceMotion ? 0 : 0.2 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-3">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-gray-900">DevDesk</h1>
                  <p className="text-sm text-gray-600">Nexus Hub</p>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs text-gray-700 border border-gray-200">
                  <Sparkles className="w-3 h-3 mr-1 text-yellow-500" />
                  Secure Authentication
                </span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to continue your development journey</p>
            </motion.div>

            {/* Social Login */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.5, delay: shouldReduceMotion ? 0 : 0.3 }}
              className="mb-6"
            >
              <div className="grid grid-cols-2 gap-3">
                {socialProviders.map((provider, index) => (
                  <Button
                    key={provider.name}
                    variant="outline"
                    onClick={provider.onClick}
                    className={`border-gray-300 text-gray-700 hover:text-white ${provider.color} transition-all duration-300 group`}
                  >
                    <span className="group-hover:scale-110 transition-transform mr-2">
                      {provider.icon}
                    </span>
                    {provider.name}
                  </Button>
                ))}
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or continue with email</span>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.1 : 0.5, delay: shouldReduceMotion ? 0 : 0.4 }}
              >
                <Label htmlFor="email" className="text-gray-700 mb-2 block font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    className={`pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''
                    }`}
                    placeholder="Enter your email"
                    required
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5" />
                  )}
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.1 : 0.5, delay: shouldReduceMotion ? 0 : 0.5 }}
              >
                <Label htmlFor="password" className="text-gray-700 mb-2 block font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    className={`pl-10 pr-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''
                    }`}
                    placeholder="Enter your password"
                    required
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.password && (
                    <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5" />
                  )}
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: shouldReduceMotion ? 0.1 : 0.5, delay: shouldReduceMotion ? 0 : 0.6 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="remember" className="text-gray-600 text-sm cursor-pointer">
                    Remember me for 30 days
                  </Label>
                </div>
                <Button 
                  variant="link" 
                  className="text-blue-600 hover:text-blue-700 text-sm p-0 h-auto"
                  type="button"
                >
                  Forgot Password?
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0.1 : 0.5, delay: shouldReduceMotion ? 0 : 0.7 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Lock className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Sign In Securely
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Security Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.5, delay: shouldReduceMotion ? 0 : 0.8 }}
              className="mt-8 space-y-3"
            >
              <div className="flex items-center justify-center space-x-6 text-gray-600 text-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-blue-500" />
                  <span>2FA Ready</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Protected by enterprise-grade security
                </p>
              </div>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.5, delay: shouldReduceMotion ? 0 : 0.9 }}
              className="mt-8 text-center border-t border-gray-200 pt-6"
            >
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Button 
                  variant="link" 
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto font-semibold"
                  type="button"
                >
                  Create Account
                </Button>
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.5, delay: shouldReduceMotion ? 0 : 1 }}
            className="mt-8 text-center text-xs text-gray-500"
          >
            <p>&copy; 2024 DevDesk Nexus Hub. All rights reserved.</p>
            <div className="flex items-center justify-center space-x-4 mt-2">
              <a href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-700 transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-gray-700 transition-colors">Support</a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignInScreen;
