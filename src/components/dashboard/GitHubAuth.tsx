import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github, Shield, Key, Users, GitBranch, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useGitHub } from '@/hooks/useGitHub';

const GitHubAuth: React.FC = () => {
  const { toast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const githubOAuthConfig = {
    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET || '',
    redirectUri: `${window.location.origin}/auth/github/callback`,
    scopes: ['repo', 'workflow', 'read:org', 'read:user', 'user:email'],
  };

  const { generateOAuthUrl, exchangeCodeForToken } = useGitHub({
    oauthConfig: githubOAuthConfig,
  });

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const state = urlParams.get('state');

      if (error) {
        setAuthError(`OAuth error: ${error}`);
        return;
      }

      if (code) {
        setIsAuthenticating(true);
        try {
          await exchangeCodeForToken(code);
          toast({
            title: "Authentication Successful",
            description: "You have been successfully authenticated with GitHub",
          });
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          const errorMessage = (error as Error).message;
          setAuthError(errorMessage);
          toast({
            title: "Authentication Failed",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    handleOAuthCallback();
  }, [exchangeCodeForToken, toast]);

  const handleGitHubAuth = () => {
    try {
      const state = Math.random().toString(36).substring(2, 15);
      const authUrl = generateOAuthUrl(state);
      
      // Store state for validation (in production, use secure storage)
      sessionStorage.setItem('github_oauth_state', state);
      
      window.location.href = authUrl;
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const requiredScopes = [
    { name: 'repo', description: 'Access to repositories', icon: GitBranch },
    { name: 'workflow', description: 'Manage GitHub Actions workflows', icon: GitBranch },
    { name: 'read:org', description: 'Read organization membership', icon: Users },
    { name: 'read:user', description: 'Read user profile information', icon: Users },
    { name: 'user:email', description: 'Access user email addresses', icon: Key },
  ];

  const securityFeatures = [
    'OAuth 2.0 secure authentication',
    'Minimal required permissions',
    'Encrypted token storage',
    'Automatic token refresh',
    'Rate limiting protection',
    'Webhook signature validation',
  ];

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authenticating...</h3>
          <p className="text-gray-600">Please wait while we complete your GitHub authentication.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full flex items-center justify-center">
            <Github className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect to GitHub</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Authenticate with GitHub to access your repositories, manage CI/CD pipelines, 
          and collaborate with your organization.
        </p>
      </motion.div>

      {authError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Authentication Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-blue-600" />
                <span>GitHub Authentication</span>
              </CardTitle>
              <CardDescription>
                Securely connect your GitHub account to enable CI/CD features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Required Permissions:</h4>
                <div className="space-y-3">
                  {requiredScopes.map((scope) => (
                    <div key={scope.name} className="flex items-center space-x-3">
                      <scope.icon className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {scope.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{scope.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGitHubAuth}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                size="lg"
              >
                <Github className="w-5 h-5 mr-2" />
                Authenticate with GitHub
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By authenticating, you agree to our terms of service and privacy policy.
                Your credentials are never stored on our servers.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Features Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Security & Privacy</span>
              </CardTitle>
              <CardDescription>
                Enterprise-grade security measures to protect your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Security Features:</h4>
                <div className="space-y-3">
                  {securityFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800">Privacy First</span>
                </div>
                <p className="text-sm text-green-700">
                  We only request the minimum permissions required for functionality. 
                  Your code and sensitive data remain secure and private.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">Token Management</span>
                </div>
                <p className="text-sm text-blue-700">
                  Access tokens are encrypted and stored securely. You can revoke 
                  access at any time from your GitHub settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Features Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>What You'll Get Access To</CardTitle>
            <CardDescription>
              Powerful CI/CD and DevOps features for your GitHub repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <GitBranch className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Workflow Management</h4>
                <p className="text-sm text-gray-600">
                  Trigger, monitor, and manage GitHub Actions workflows with real-time updates
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Organization Overview</h4>
                <p className="text-sm text-gray-600">
                  Navigate your GitHub organizations, teams, and repositories efficiently
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Security Controls</h4>
                <p className="text-sm text-gray-600">
                  Role-based access control and security settings for your pipelines
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default GitHubAuth; 