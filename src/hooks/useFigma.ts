import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FigmaAPI, { 
  FigmaFileResponse, 
  FigmaNode, 
  FigmaProjectFile, 
  FigmaImagesResponse,
  FigmaOAuthConfig,
  FigmaTokenResponse,
  RateLimitInfo,
  FigmaAPIError
} from '@/lib/figma-api';

interface UseFigmaOptions {
  accessToken?: string;
  refreshToken?: string;
  fileKey?: string;
  teamId?: string;
  oauthConfig?: FigmaOAuthConfig;
  enableAutoRefresh?: boolean;
}

interface FigmaAuthState {
  isAuthenticated: boolean;
  user: any;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export const useFigma = (options: UseFigmaOptions = {}) => {
  const [figmaAPI, setFigmaAPI] = useState(() => new FigmaAPI(options.accessToken, options.refreshToken));
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [authState, setAuthState] = useState<FigmaAuthState>({
    isAuthenticated: !!options.accessToken,
    user: null,
    accessToken: options.accessToken,
    refreshToken: options.refreshToken,
  });
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({ remaining: 1000, reset: Date.now() + 3600000, limit: 1000 });
  const [exportProgress, setExportProgress] = useState<{ completed: number; total: number } | null>(null);
  
  const queryClient = useQueryClient();
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  // OAuth Authentication Methods
  const generateOAuthUrl = useCallback((state?: string): string => {
    if (!options.oauthConfig) {
      throw new Error('OAuth configuration is required');
    }
    return FigmaAPI.generateOAuthUrl(options.oauthConfig, state);
  }, [options.oauthConfig]);

  const exchangeCodeForToken = useCallback(async (code: string): Promise<FigmaTokenResponse> => {
    if (!options.oauthConfig) {
      throw new Error('OAuth configuration is required');
    }
    
    const tokenResponse = await FigmaAPI.exchangeCodeForToken(code, options.oauthConfig);
    
    // Update auth state
    const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
    setAuthState({
      isAuthenticated: true,
      user: null, // Will be fetched separately
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt,
    });
    
    // Update API instance
    figmaAPI.updateAccessToken(tokenResponse.access_token, tokenResponse.refresh_token);
    
    // Store tokens securely (in production, use secure storage)
    localStorage.setItem('figma_access_token', tokenResponse.access_token);
    localStorage.setItem('figma_refresh_token', tokenResponse.refresh_token);
    localStorage.setItem('figma_expires_at', expiresAt.toString());
    
    // Schedule token refresh
    if (options.enableAutoRefresh) {
      scheduleTokenRefresh(tokenResponse.expires_in);
    }
    
    return tokenResponse;
  }, [options.oauthConfig, options.enableAutoRefresh, figmaAPI]);

  const refreshAccessToken = useCallback(async (): Promise<FigmaTokenResponse | null> => {
    if (!options.oauthConfig || !authState.refreshToken) {
      return null;
    }
    
    try {
      const tokenResponse = await figmaAPI.refreshAccessToken(options.oauthConfig);
      
      const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
      setAuthState(prev => ({
        ...prev,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt,
      }));
      
      // Update stored tokens
      localStorage.setItem('figma_access_token', tokenResponse.access_token);
      localStorage.setItem('figma_refresh_token', tokenResponse.refresh_token);
      localStorage.setItem('figma_expires_at', expiresAt.toString());
      
      // Schedule next refresh
      if (options.enableAutoRefresh) {
        scheduleTokenRefresh(tokenResponse.expires_in);
      }
      
      return tokenResponse;
    } catch (error) {
      console.error('Token refresh failed:', error);
      signOut();
      return null;
    }
  }, [options.oauthConfig, authState.refreshToken, figmaAPI, options.enableAutoRefresh]);

  const scheduleTokenRefresh = useCallback((expiresIn: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Refresh 5 minutes before expiry
    const refreshTime = Math.max(0, (expiresIn - 300) * 1000);
    refreshTimeoutRef.current = setTimeout(() => {
      refreshAccessToken();
    }, refreshTime);
  }, [refreshAccessToken]);

  const signOut = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
    });
    
    // Clear stored tokens
    localStorage.removeItem('figma_access_token');
    localStorage.removeItem('figma_refresh_token');
    localStorage.removeItem('figma_expires_at');
    
    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Clear queries
    queryClient.clear();
  }, [queryClient]);

  // Initialize auth state from storage
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('figma_access_token');
    const storedRefreshToken = localStorage.getItem('figma_refresh_token');
    const storedExpiresAt = localStorage.getItem('figma_expires_at');
    
    if (storedAccessToken && storedRefreshToken && storedExpiresAt) {
      const expiresAt = parseInt(storedExpiresAt, 10);
      const now = Date.now();
      
      if (expiresAt > now) {
        setAuthState({
          isAuthenticated: true,
          user: null,
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          expiresAt,
        });
        
        setFigmaAPI(new FigmaAPI(storedAccessToken, storedRefreshToken));
        
        // Schedule refresh if auto-refresh is enabled
        if (options.enableAutoRefresh) {
          const timeUntilExpiry = Math.floor((expiresAt - now) / 1000);
          scheduleTokenRefresh(timeUntilExpiry);
        }
      } else {
        // Token expired, try to refresh
        if (options.enableAutoRefresh) {
          refreshAccessToken();
        } else {
          signOut();
        }
      }
    }
  }, [options.enableAutoRefresh, refreshAccessToken, scheduleTokenRefresh, signOut]);

  // Update rate limit info periodically
  useEffect(() => {
    const updateRateLimit = () => {
      const info = figmaAPI.getRateLimitInfo();
      setRateLimitInfo(info);
    };
    
    const interval = setInterval(updateRateLimit, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [figmaAPI]);

  // Get current user with error handling
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['figma', 'user'],
    queryFn: async () => {
      try {
        const userData = await figmaAPI.getUser();
        setAuthState(prev => ({ ...prev, user: userData }));
        return userData;
      } catch (error) {
        if ((error as FigmaAPIError).status === 401) {
          // Try to refresh token
          if (options.enableAutoRefresh && authState.refreshToken) {
            await refreshAccessToken();
            return figmaAPI.getUser();
          } else {
            signOut();
            throw error;
          }
        }
        throw error;
      }
    },
    enabled: authState.isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get file data with enhanced error handling
  const {
    data: fileData,
    isLoading: fileLoading,
    error: fileError,
    refetch: refetchFile
  } = useQuery({
    queryKey: ['figma', 'file', options.fileKey],
    queryFn: async () => {
      try {
        return await figmaAPI.getFile(options.fileKey!);
      } catch (error) {
        if ((error as FigmaAPIError).status === 401) {
          if (options.enableAutoRefresh && authState.refreshToken) {
            await refreshAccessToken();
            return figmaAPI.getFile(options.fileKey!);
          } else {
            signOut();
            throw error;
          }
        }
        throw error;
      }
    },
    enabled: !!options.fileKey && authState.isAuthenticated,
    retry: (failureCount, error) => {
      const figmaError = error as FigmaAPIError;
      // Don't retry on auth errors or rate limits
      if (figmaError.status === 401 || figmaError.status === 429) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get team projects
  const {
    data: teamProjects,
    isLoading: projectsLoading,
    error: projectsError
  } = useQuery({
    queryKey: ['figma', 'team', options.teamId, 'projects'],
    queryFn: () => figmaAPI.getTeamProjects(options.teamId!),
    enabled: !!options.teamId && authState.isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Enhanced export images mutation with progress tracking
  const exportImagesMutation = useMutation({
    mutationFn: async ({ 
      fileKey, 
      nodeIds, 
      format = 'png', 
      scale = 1,
      version
    }: { 
      fileKey: string; 
      nodeIds: string[]; 
      format?: 'jpg' | 'png' | 'svg' | 'pdf'; 
      scale?: number;
      version?: string;
    }) => {
      return figmaAPI.getFileImages(fileKey, nodeIds, format, scale, version);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['figma', 'exports'] });
    },
    onError: (error: FigmaAPIError) => {
      if (error.status === 401 && options.enableAutoRefresh) {
        refreshAccessToken();
      }
    },
  });

  // Batch export mutation with progress tracking
  const batchExportMutation = useMutation({
    mutationFn: async ({
      fileKey,
      exports
    }: {
      fileKey: string;
      exports: Array<{ nodeIds: string[]; format: 'jpg' | 'png' | 'svg' | 'pdf'; scale: number }>;
    }) => {
      setExportProgress({ completed: 0, total: exports.length });
      
      const results = await figmaAPI.batchExport(
        fileKey,
        exports,
        (completed, total) => {
          setExportProgress({ completed, total });
        }
      );
      
      setExportProgress(null);
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['figma', 'exports'] });
    },
    onError: () => {
      setExportProgress(null);
    },
  });

  // Post comment mutation
  const postCommentMutation = useMutation({
    mutationFn: async ({ 
      fileKey, 
      message, 
      clientMeta 
    }: { 
      fileKey: string; 
      message: string; 
      clientMeta: Record<string, unknown>; 
    }) => {
      return figmaAPI.postComment(fileKey, message, clientMeta);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['figma', 'comments'] });
    },
  });

  // Get file comments with pagination support
  const {
    data: comments,
    isLoading: commentsLoading,
    error: commentsError
  } = useQuery({
    queryKey: ['figma', 'comments', options.fileKey],
    queryFn: () => figmaAPI.getFileComments(options.fileKey!),
    enabled: !!options.fileKey && authState.isAuthenticated,
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Health check query
  const {
    data: healthStatus,
    isLoading: healthLoading
  } = useQuery({
    queryKey: ['figma', 'health'],
    queryFn: () => figmaAPI.healthCheck(),
    enabled: authState.isAuthenticated,
    refetchInterval: 60 * 1000, // Check every minute
    retry: false,
  });

  // Utility functions
  const extractFrames = useCallback((document?: FigmaNode): FigmaNode[] => {
    if (!document) return [];
    return figmaAPI.extractFrames(document);
  }, [figmaAPI]);

  const extractComponents = useCallback((document?: FigmaNode): FigmaNode[] => {
    if (!document) return [];
    return figmaAPI.extractComponents(document);
  }, [figmaAPI]);

  const getExportableNodes = useCallback((document?: FigmaNode): FigmaNode[] => {
    if (!document) return [];
    return figmaAPI.getExportableNodes(document);
  }, [figmaAPI]);

  const selectNode = useCallback((nodeId: string) => {
    setSelectedNodes(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId);
      }
      return [...prev, nodeId];
    });
  }, []);

  const selectMultipleNodes = useCallback((nodeIds: string[]) => {
    setSelectedNodes(prev => {
      const newSelection = [...prev];
      nodeIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodes([]);
  }, []);

  const exportSelectedNodes = useCallback(async (
    format: 'jpg' | 'png' | 'svg' | 'pdf' = 'png',
    scale: number = 1,
    version?: string
  ) => {
    if (!options.fileKey || selectedNodes.length === 0) return;
    
    return exportImagesMutation.mutateAsync({
      fileKey: options.fileKey,
      nodeIds: selectedNodes,
      format,
      scale,
      version,
    });
  }, [options.fileKey, selectedNodes, exportImagesMutation]);

  const batchExportNodes = useCallback(async (
    exports: Array<{ nodeIds: string[]; format: 'jpg' | 'png' | 'svg' | 'pdf'; scale: number }>
  ) => {
    if (!options.fileKey) return;
    
    return batchExportMutation.mutateAsync({
      fileKey: options.fileKey,
      exports,
    });
  }, [options.fileKey, batchExportMutation]);

  const downloadExportedImages = useCallback(async (exportData: FigmaImagesResponse, filename?: string) => {
    if (!exportData?.images) return;

    const downloads = Object.entries(exportData.images).map(async ([nodeId, imageUrl]) => {
      if (typeof imageUrl === 'string') {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = filename || `figma-export-${nodeId}.png`;
          link.setAttribute('aria-label', `Download ${filename || `figma-export-${nodeId}.png`}`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error(`Failed to download image for node ${nodeId}:`, error);
        }
      }
    });

    await Promise.all(downloads);
  }, []);

  const postComment = useCallback(async (message: string, position?: { x: number; y: number }) => {
    if (!options.fileKey) return;

    const clientMeta: Record<string, unknown> = position ? {
      node_id: selectedNodes[0] || null,
      node_offset: position,
    } : {};

    return postCommentMutation.mutateAsync({
      fileKey: options.fileKey,
      message,
      clientMeta,
    });
  }, [options.fileKey, selectedNodes, postCommentMutation]);

  // Check if API is configured and authenticated
  const isConfigured = !!options.oauthConfig || !!authState.accessToken;
  const hasFileAccess = isConfigured && !!options.fileKey && authState.isAuthenticated;

  // Loading states
  const isLoading = userLoading || fileLoading || projectsLoading;
  
  // Error states
  const hasError = userError || fileError || projectsError || commentsError;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    // API instance
    figmaAPI,
    
    // Authentication
    authState,
    isAuthenticated: authState.isAuthenticated,
    generateOAuthUrl,
    exchangeCodeForToken,
    refreshAccessToken,
    signOut,
    
    // Configuration
    isConfigured,
    hasFileAccess,
    
    // Data
    user,
    fileData,
    teamProjects,
    comments,
    healthStatus,
    
    // Rate limiting
    rateLimitInfo,
    
    // Loading states
    isLoading,
    userLoading,
    fileLoading,
    projectsLoading,
    commentsLoading,
    healthLoading,
    
    // Error states
    hasError,
    userError,
    fileError,
    projectsError,
    commentsError,
    
    // Selection
    selectedNodes,
    selectNode,
    selectMultipleNodes,
    clearSelection,
    
    // Utility functions
    extractFrames,
    extractComponents,
    getExportableNodes,
    
    // Actions
    refetchFile,
    refetchUser,
    exportSelectedNodes,
    batchExportNodes,
    downloadExportedImages,
    postComment,
    
    // Export progress
    exportProgress,
    
    // Mutation states
    isExporting: exportImagesMutation.isPending,
    exportError: exportImagesMutation.error,
    isBatchExporting: batchExportMutation.isPending,
    batchExportError: batchExportMutation.error,
    isPostingComment: postCommentMutation.isPending,
    commentError: postCommentMutation.error,
  };
}; 