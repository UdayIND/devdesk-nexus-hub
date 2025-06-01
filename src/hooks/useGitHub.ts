import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GitHubAPI, { 
  GitHubUser,
  GitHubOrganization,
  GitHubRepository,
  GitHubBranch,
  GitHubTeam,
  GitHubWorkflow,
  GitHubWorkflowRun,
  GitHubWorkflowJob,
  GitHubOAuthConfig,
  GitHubTokenResponse,
  RateLimitInfo,
  GitHubAPIError,
  PipelineConfiguration,
  BuildHistory,
  WebhookPayload
} from '@/lib/github-api';

interface UseGitHubOptions {
  accessToken?: string;
  oauthConfig?: GitHubOAuthConfig;
  enableAutoRefresh?: boolean;
  enableRealTimeUpdates?: boolean;
  pollingInterval?: number;
}

interface GitHubAuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  accessToken?: string;
  scopes?: string[];
}

interface PipelineStatus {
  id: string;
  status: 'idle' | 'running' | 'success' | 'failure' | 'cancelled';
  progress: number;
  currentStep?: string;
  logs: string[];
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

export const useGitHub = (options: UseGitHubOptions = {}) => {
  const [githubAPI, setGitHubAPI] = useState(() => new GitHubAPI(options.accessToken));
  const [authState, setAuthState] = useState<GitHubAuthState>({
    isAuthenticated: !!options.accessToken,
    user: null,
    accessToken: options.accessToken,
  });
  const [selectedRepository, setSelectedRepository] = useState<GitHubRepository | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedOrganization, setSelectedOrganization] = useState<GitHubOrganization | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({ 
    limit: 5000, 
    remaining: 5000, 
    reset: Date.now() + 3600000, 
    used: 0, 
    resource: 'core' 
  });
  const [pipelineStatuses, setPipelineStatuses] = useState<Map<string, PipelineStatus>>(new Map());
  const [realTimeConnected, setRealTimeConnected] = useState(false);
  
  const queryClient = useQueryClient();
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const websocketRef = useRef<WebSocket>();

  // OAuth Authentication Methods
  const generateOAuthUrl = useCallback((state?: string): string => {
    if (!options.oauthConfig) {
      throw new Error('OAuth configuration is required');
    }
    return GitHubAPI.generateOAuthUrl(options.oauthConfig, state);
  }, [options.oauthConfig]);

  const exchangeCodeForToken = useCallback(async (code: string): Promise<GitHubTokenResponse> => {
    if (!options.oauthConfig) {
      throw new Error('OAuth configuration is required');
    }
    
    const tokenResponse = await GitHubAPI.exchangeCodeForToken(code, options.oauthConfig);
    
    // Update auth state
    setAuthState({
      isAuthenticated: true,
      user: null, // Will be fetched separately
      accessToken: tokenResponse.access_token,
      scopes: tokenResponse.scope?.split(' '),
    });
    
    // Update API instance
    githubAPI.updateAccessToken(tokenResponse.access_token);
    
    // Store tokens securely
    localStorage.setItem('github_access_token', tokenResponse.access_token);
    localStorage.setItem('github_token_type', tokenResponse.token_type);
    localStorage.setItem('github_scope', tokenResponse.scope);
    
    return tokenResponse;
  }, [options.oauthConfig, githubAPI]);

  const signOut = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: undefined,
      scopes: undefined,
    });
    
    // Clear stored tokens
    localStorage.removeItem('github_access_token');
    localStorage.removeItem('github_token_type');
    localStorage.removeItem('github_scope');
    
    // Clear selected data
    setSelectedRepository(null);
    setSelectedBranch('');
    setSelectedOrganization(null);
    
    // Clear queries
    queryClient.clear();
    
    // Disconnect real-time updates
    if (websocketRef.current) {
      websocketRef.current.close();
    }
  }, [queryClient]);

  // Initialize auth state from storage
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('github_access_token');
    const storedTokenType = localStorage.getItem('github_token_type');
    const storedScope = localStorage.getItem('github_scope');
    
    if (storedAccessToken) {
      setAuthState({
        isAuthenticated: true,
        user: null,
        accessToken: storedAccessToken,
        scopes: storedScope?.split(' '),
      });
      
      setGitHubAPI(new GitHubAPI(storedAccessToken));
    }
  }, []);

  // Update rate limit info periodically
  useEffect(() => {
    const updateRateLimit = () => {
      const info = githubAPI.getRateLimitInfo();
      setRateLimitInfo(info);
    };
    
    const interval = setInterval(updateRateLimit, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [githubAPI]);

  // Real-time updates via WebSocket (simulated for demo)
  useEffect(() => {
    if (options.enableRealTimeUpdates && authState.isAuthenticated) {
      // In a real implementation, this would connect to a WebSocket server
      // that receives GitHub webhooks and broadcasts updates
      const connectWebSocket = () => {
        try {
          // Simulated WebSocket connection
          setRealTimeConnected(true);
          
          // Simulate receiving real-time updates
          const simulateUpdates = () => {
            // This would be replaced with actual WebSocket message handling
            console.log('Real-time updates connected');
          };
          
          simulateUpdates();
        } catch (error) {
          console.error('Failed to connect to real-time updates:', error);
          setRealTimeConnected(false);
        }
      };
      
      connectWebSocket();
      
      return () => {
        if (websocketRef.current) {
          websocketRef.current.close();
        }
        setRealTimeConnected(false);
      };
    }
  }, [options.enableRealTimeUpdates, authState.isAuthenticated]);

  // Polling for workflow runs
  useEffect(() => {
    if (options.pollingInterval && selectedRepository && authState.isAuthenticated) {
      pollingIntervalRef.current = setInterval(() => {
        queryClient.invalidateQueries({ 
          queryKey: ['github', 'workflow-runs', selectedRepository.full_name] 
        });
      }, options.pollingInterval);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [options.pollingInterval, selectedRepository, authState.isAuthenticated, queryClient]);

  // Get current user
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['github', 'user'],
    queryFn: async () => {
      try {
        const userData = await githubAPI.getUser();
        setAuthState(prev => ({ ...prev, user: userData }));
        return userData;
      } catch (error) {
        if ((error as GitHubAPIError).status === 401) {
          signOut();
          throw error;
        }
        throw error;
      }
    },
    enabled: authState.isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get user organizations
  const {
    data: organizations,
    isLoading: organizationsLoading,
    error: organizationsError
  } = useQuery({
    queryKey: ['github', 'organizations'],
    queryFn: () => githubAPI.getUserOrganizations(),
    enabled: authState.isAuthenticated,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get user repositories
  const {
    data: repositories,
    isLoading: repositoriesLoading,
    error: repositoriesError
  } = useQuery({
    queryKey: ['github', 'repositories'],
    queryFn: () => githubAPI.getUserRepositories('all'),
    enabled: authState.isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get organization repositories
  const {
    data: organizationRepositories,
    isLoading: orgReposLoading,
    error: orgReposError
  } = useQuery({
    queryKey: ['github', 'org-repositories', selectedOrganization?.login],
    queryFn: () => githubAPI.getOrganizationRepositories(selectedOrganization!.login),
    enabled: !!selectedOrganization && authState.isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get repository branches
  const {
    data: branches,
    isLoading: branchesLoading,
    error: branchesError
  } = useQuery({
    queryKey: ['github', 'branches', selectedRepository?.full_name],
    queryFn: () => githubAPI.getRepositoryBranches(selectedRepository!.full_name),
    enabled: !!selectedRepository && authState.isAuthenticated,
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get repository workflows
  const {
    data: workflows,
    isLoading: workflowsLoading,
    error: workflowsError
  } = useQuery({
    queryKey: ['github', 'workflows', selectedRepository?.full_name],
    queryFn: async () => {
      const result = await githubAPI.getRepositoryWorkflows(selectedRepository!.full_name);
      return result.workflows;
    },
    enabled: !!selectedRepository && authState.isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get workflow runs
  const {
    data: workflowRuns,
    isLoading: workflowRunsLoading,
    error: workflowRunsError
  } = useQuery({
    queryKey: ['github', 'workflow-runs', selectedRepository?.full_name, selectedBranch],
    queryFn: async () => {
      const result = await githubAPI.getWorkflowRuns(
        selectedRepository!.full_name,
        undefined,
        selectedBranch || undefined
      );
      return result.workflow_runs;
    },
    enabled: !!selectedRepository && authState.isAuthenticated,
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: options.pollingInterval || 30000, // Auto-refresh every 30 seconds
  });

  // Get organization teams
  const {
    data: teams,
    isLoading: teamsLoading,
    error: teamsError
  } = useQuery({
    queryKey: ['github', 'teams', selectedOrganization?.login],
    queryFn: () => githubAPI.getOrganizationTeams(selectedOrganization!.login),
    enabled: !!selectedOrganization && authState.isAuthenticated,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Trigger workflow mutation
  const triggerWorkflowMutation = useMutation({
    mutationFn: async ({ 
      workflowId, 
      ref, 
      inputs 
    }: { 
      workflowId: number | string; 
      ref: string; 
      inputs?: Record<string, any>; 
    }) => {
      if (!selectedRepository) throw new Error('No repository selected');
      
      // Update pipeline status
      const pipelineId = `${selectedRepository.full_name}-${workflowId}-${Date.now()}`;
      setPipelineStatuses(prev => new Map(prev.set(pipelineId, {
        id: pipelineId,
        status: 'running',
        progress: 0,
        currentStep: 'Triggering workflow...',
        logs: ['Workflow triggered manually'],
        startTime: new Date(),
      })));
      
      await githubAPI.triggerWorkflow(selectedRepository.full_name, workflowId, ref, inputs);
      
      // Update status
      setPipelineStatuses(prev => new Map(prev.set(pipelineId, {
        ...prev.get(pipelineId)!,
        progress: 25,
        currentStep: 'Workflow queued',
        logs: [...(prev.get(pipelineId)?.logs || []), 'Workflow successfully triggered'],
      })));
      
      return pipelineId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['github', 'workflow-runs', selectedRepository?.full_name] 
      });
    },
    onError: (error, variables) => {
      const pipelineId = `${selectedRepository?.full_name}-${variables.workflowId}-${Date.now()}`;
      setPipelineStatuses(prev => new Map(prev.set(pipelineId, {
        id: pipelineId,
        status: 'failure',
        progress: 0,
        currentStep: 'Failed to trigger',
        logs: ['Failed to trigger workflow', (error as Error).message],
        startTime: new Date(),
        endTime: new Date(),
      })));
    },
  });

  // Cancel workflow run mutation
  const cancelWorkflowMutation = useMutation({
    mutationFn: async (runId: number) => {
      if (!selectedRepository) throw new Error('No repository selected');
      await githubAPI.cancelWorkflowRun(selectedRepository.full_name, runId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['github', 'workflow-runs', selectedRepository?.full_name] 
      });
    },
  });

  // Rerun workflow mutation
  const rerunWorkflowMutation = useMutation({
    mutationFn: async (runId: number) => {
      if (!selectedRepository) throw new Error('No repository selected');
      await githubAPI.rerunWorkflowRun(selectedRepository.full_name, runId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['github', 'workflow-runs', selectedRepository?.full_name] 
      });
    },
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: async ({ 
      url, 
      secret, 
      events 
    }: { 
      url: string; 
      secret?: string; 
      events?: string[]; 
    }) => {
      if (!selectedRepository) throw new Error('No repository selected');
      
      return githubAPI.createWebhook(
        selectedRepository.full_name,
        {
          url,
          content_type: 'json',
          secret,
          insecure_ssl: false,
        },
        events || ['push', 'pull_request']
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['github', 'webhooks', selectedRepository?.full_name] 
      });
    },
  });

  // Get workflow run details
  const getWorkflowRunDetails = useCallback(async (runId: number): Promise<{
    run: GitHubWorkflowRun;
    jobs: GitHubWorkflowJob[];
  }> => {
    if (!selectedRepository) throw new Error('No repository selected');
    
    const [run, jobsResult] = await Promise.all([
      githubAPI.getWorkflowRun(selectedRepository.full_name, runId),
      githubAPI.getWorkflowJobs(selectedRepository.full_name, runId),
    ]);
    
    return { run, jobs: jobsResult.jobs };
  }, [selectedRepository, githubAPI]);

  // Get workflow run logs
  const getWorkflowRunLogs = useCallback(async (runId: number): Promise<ArrayBuffer> => {
    if (!selectedRepository) throw new Error('No repository selected');
    return githubAPI.getWorkflowRunLogs(selectedRepository.full_name, runId);
  }, [selectedRepository, githubAPI]);

  // Utility functions
  const selectRepository = useCallback((repo: GitHubRepository) => {
    setSelectedRepository(repo);
    setSelectedBranch(repo.default_branch);
  }, []);

  const selectOrganization = useCallback((org: GitHubOrganization) => {
    setSelectedOrganization(org);
    setSelectedRepository(null);
    setSelectedBranch('');
  }, []);

  const selectBranch = useCallback((branch: string) => {
    setSelectedBranch(branch);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRepository(null);
    setSelectedBranch('');
    setSelectedOrganization(null);
  }, []);

  // Pipeline status management
  const getPipelineStatus = useCallback((pipelineId: string): PipelineStatus | undefined => {
    return pipelineStatuses.get(pipelineId);
  }, [pipelineStatuses]);

  const updatePipelineStatus = useCallback((pipelineId: string, updates: Partial<PipelineStatus>) => {
    setPipelineStatuses(prev => {
      const current = prev.get(pipelineId);
      if (!current) return prev;
      
      const updated = { ...current, ...updates };
      return new Map(prev.set(pipelineId, updated));
    });
  }, []);

  // Webhook payload processing
  const processWebhookPayload = useCallback((payload: WebhookPayload) => {
    console.log('Processing webhook payload:', payload);
    
    // Invalidate relevant queries based on the webhook event
    if (payload.action === 'completed' && payload.repository) {
      queryClient.invalidateQueries({ 
        queryKey: ['github', 'workflow-runs', payload.repository.full_name] 
      });
    }
    
    // Update pipeline statuses if needed
    // This would be more sophisticated in a real implementation
  }, [queryClient]);

  // Health check
  const {
    data: healthStatus,
    isLoading: healthLoading
  } = useQuery({
    queryKey: ['github', 'health'],
    queryFn: () => githubAPI.healthCheck(),
    enabled: authState.isAuthenticated,
    refetchInterval: 60 * 1000, // Check every minute
    retry: false,
  });

  // Loading states
  const isLoading = userLoading || organizationsLoading || repositoriesLoading;
  
  // Error states
  const hasError = userError || organizationsError || repositoriesError || workflowsError;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  return {
    // API instance
    githubAPI,
    
    // Authentication
    authState,
    isAuthenticated: authState.isAuthenticated,
    generateOAuthUrl,
    exchangeCodeForToken,
    signOut,
    
    // Data
    user,
    organizations,
    repositories,
    organizationRepositories,
    branches,
    workflows,
    workflowRuns,
    teams,
    healthStatus,
    
    // Selection
    selectedRepository,
    selectedBranch,
    selectedOrganization,
    selectRepository,
    selectBranch,
    selectOrganization,
    clearSelection,
    
    // Rate limiting
    rateLimitInfo,
    
    // Real-time updates
    realTimeConnected,
    
    // Pipeline management
    pipelineStatuses,
    getPipelineStatus,
    updatePipelineStatus,
    
    // Loading states
    isLoading,
    userLoading,
    organizationsLoading,
    repositoriesLoading,
    orgReposLoading,
    branchesLoading,
    workflowsLoading,
    workflowRunsLoading,
    teamsLoading,
    healthLoading,
    
    // Error states
    hasError,
    userError,
    organizationsError,
    repositoriesError,
    orgReposError,
    branchesError,
    workflowsError,
    workflowRunsError,
    teamsError,
    
    // Actions
    refetchUser,
    getWorkflowRunDetails,
    getWorkflowRunLogs,
    processWebhookPayload,
    
    // Mutations
    triggerWorkflow: triggerWorkflowMutation.mutateAsync,
    cancelWorkflowRun: cancelWorkflowMutation.mutateAsync,
    rerunWorkflowRun: rerunWorkflowMutation.mutateAsync,
    createWebhook: createWebhookMutation.mutateAsync,
    
    // Mutation states
    isTriggeringWorkflow: triggerWorkflowMutation.isPending,
    triggerWorkflowError: triggerWorkflowMutation.error,
    isCancellingWorkflow: cancelWorkflowMutation.isPending,
    cancelWorkflowError: cancelWorkflowMutation.error,
    isRerunningWorkflow: rerunWorkflowMutation.isPending,
    rerunWorkflowError: rerunWorkflowMutation.error,
    isCreatingWebhook: createWebhookMutation.isPending,
    createWebhookError: createWebhookMutation.error,
  };
}; 