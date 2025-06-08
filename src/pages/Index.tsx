import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingPage from '@/components/LandingPage';
import SignInScreen from '@/components/SignInScreen';
import SignUpScreen from '@/components/SignUpScreen';
import Dashboard from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type AppState = 'landing' | 'signin' | 'signup' | 'dashboard';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    signIn, 
    signUp, 
    signOut, 
    clearError 
  } = useAuth();

  // Update app state based on authentication status
  useEffect(() => {
    if (isAuthenticated && user) {
      setAppState('dashboard');
    } else if (!isLoading) {
      setAppState('landing');
    }
  }, [isAuthenticated, user, isLoading]);

  // Show error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleGetStarted = () => {
    setAppState('signin');
  };

  const handleSignIn = async (credentials: { email: string; password: string }) => {
    try {
      await signIn(credentials);
      toast.success('Welcome back!');
    } catch (err) {
      // Error is handled by the useAuth hook and displayed via toast
      console.error('Sign in failed:', err);
    }
  };

  const handleSignUp = async (userData: { 
    email: string; 
    password: string; 
    name: string; 
    company?: string; 
    phone?: string; 
  }) => {
    try {
      await signUp(userData);
      toast.success('Account created successfully! Welcome to DevDesk Nexus Hub!');
    } catch (err) {
      // Error is handled by the useAuth hook and displayed via toast
      console.error('Sign up failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setAppState('landing');
      toast.success('Signed out successfully');
    } catch (err) {
      console.error('Sign out failed:', err);
      // Force state reset even if sign out fails
      setAppState('landing');
    }
  };

  const handleBack = () => {
    setAppState('landing');
  };

  const handleSwitchToSignUp = () => {
    setAppState('signup');
  };

  const handleSwitchToSignIn = () => {
    setAppState('signin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Development Desk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {appState === 'landing' && (
          <LandingPage onGetStarted={handleGetStarted} />
        )}
        {appState === 'signin' && (
          <SignInScreen 
            onSignIn={handleSignIn} 
            onBack={handleBack} 
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        )}
        {appState === 'signup' && (
          <SignUpScreen 
            onSignUp={handleSignUp} 
            onBack={handleBack} 
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        )}
        {appState === 'dashboard' && user && (
          <Dashboard user={user} onSignOut={handleSignOut} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
