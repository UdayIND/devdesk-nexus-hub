
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingPage from '@/components/LandingPage';
import SignInScreen from '@/components/SignInScreen';
import Dashboard from '@/components/Dashboard';

type AppState = 'landing' | 'signin' | 'dashboard';

interface User {
  email: string;
  name?: string;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (simulate checking localStorage or session)
    const checkAuthStatus = async () => {
      setIsLoading(true);
      
      // Simulate auth check delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedUser = localStorage.getItem('developmentDesk_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setAppState('dashboard');
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleGetStarted = () => {
    setAppState('signin');
  };

  const handleSignIn = (credentials: { email: string; password: string }) => {
    // Simulate authentication
    const userData: User = {
      email: credentials.email,
      name: credentials.email.split('@')[0]
    };
    
    setUser(userData);
    localStorage.setItem('developmentDesk_user', JSON.stringify(userData));
    setAppState('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('developmentDesk_user');
    setAppState('landing');
  };

  const handleBack = () => {
    setAppState('landing');
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
          <SignInScreen onSignIn={handleSignIn} onBack={handleBack} />
        )}
        {appState === 'dashboard' && user && (
          <Dashboard user={user} onSignOut={handleSignOut} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
