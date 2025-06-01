// Enhanced Figma API Service with OAuth, Rate Limiting, and Security
// This service handles all interactions with the Figma REST API with enterprise-grade features

export interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
  version: string;
  role: string;
}

export interface FigmaProject {
  id: string;
  name: string;
  files: FigmaFile[];
}

export interface FigmaTeam {
  id: string;
  name: string;
  projects: FigmaProject[];
}

export interface FigmaFill {
  type: string;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

export interface FigmaStroke {
  type: string;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

export interface FigmaEffect {
  type: string;
  visible: boolean;
  radius?: number;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  effects?: FigmaEffect[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  exportSettings?: {
    format: string;
    suffix: string;
    constraint: {
      type: string;
      value: number;
    };
  }[];
}

export interface FigmaFileResponse {
  document: FigmaNode;
  components: Record<string, FigmaNode>;
  styles: Record<string, Record<string, unknown>>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
}

export interface FigmaTeamProject {
  id: string;
  name: string;
}

export interface FigmaProjectFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

export interface FigmaUser {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

export interface FigmaComment {
  id: string;
  message: string;
  user: FigmaUser;
  created_at: string;
  resolved_at?: string;
  client_meta: {
    node_id?: string;
    node_offset?: { x: number; y: number };
  };
}

export interface FigmaCommentsResponse {
  comments: FigmaComment[];
}

export interface FigmaImagesResponse {
  images: Record<string, string>;
  err?: string;
}

export interface FigmaOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface FigmaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: string;
}

export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

export interface FigmaAPIError extends Error {
  status?: number;
  code?: string;
  rateLimitInfo?: RateLimitInfo;
}

class FigmaAPI {
  private baseUrl = 'https://api.figma.com/v1';
  private oauthUrl = 'https://www.figma.com/oauth';
  private accessToken: string;
  private refreshToken?: string;
  private rateLimitInfo: RateLimitInfo = { remaining: 1000, reset: Date.now() + 3600000, limit: 1000 };
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  constructor(accessToken?: string, refreshToken?: string) {
    this.accessToken = accessToken || import.meta.env.VITE_FIGMA_ACCESS_TOKEN || '';
    this.refreshToken = refreshToken;
  }

  // OAuth Methods
  static generateOAuthUrl(config: FigmaOAuthConfig, state?: string): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      response_type: 'code',
      ...(state && { state })
    });
    
    return `https://www.figma.com/oauth?${params.toString()}`;
  }

  static async exchangeCodeForToken(
    code: string, 
    config: FigmaOAuthConfig
  ): Promise<FigmaTokenResponse> {
    const response = await fetch('https://www.figma.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async refreshAccessToken(config: FigmaOAuthConfig): Promise<FigmaTokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://www.figma.com/api/oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
    
    return tokenData;
  }

  // Rate Limiting and Request Queue Management
  private async processRequestQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      if (this.rateLimitInfo.remaining <= 0) {
        const waitTime = this.rateLimitInfo.reset - Date.now();
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request failed:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  private updateRateLimitInfo(headers: Headers): void {
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');
    const limit = headers.get('X-RateLimit-Limit');

    if (remaining) this.rateLimitInfo.remaining = parseInt(remaining, 10);
    if (reset) this.rateLimitInfo.reset = parseInt(reset, 10) * 1000;
    if (limit) this.rateLimitInfo.limit = parseInt(limit, 10);
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        if (!this.accessToken) {
          reject(new Error('Figma access token is required. Please authenticate first.'));
          return;
        }

        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
              'X-Figma-Token': this.accessToken,
              'Content-Type': 'application/json',
              ...options.headers,
            },
          });

          this.updateRateLimitInfo(response.headers);

          if (response.status === 429) {
            // Rate limited - implement exponential backoff
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.pow(2, 3) * 1000;
            
            setTimeout(() => {
              this.requestQueue.unshift(executeRequest);
              this.processRequestQueue();
            }, waitTime);
            return;
          }

          if (!response.ok) {
            const error = new Error(`Figma API error: ${response.status} ${response.statusText}`) as FigmaAPIError;
            error.status = response.status;
            error.rateLimitInfo = this.rateLimitInfo;
            
            if (response.status === 401) {
              error.code = 'UNAUTHORIZED';
            } else if (response.status === 403) {
              error.code = 'FORBIDDEN';
            } else if (response.status === 404) {
              error.code = 'NOT_FOUND';
            }
            
            reject(error);
            return;
          }

          const data = await response.json();
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };

      this.requestQueue.push(executeRequest);
      this.processRequestQueue();
    });
  }

  // Enhanced API Methods with Input Validation
  private validateFileKey(fileKey: string): void {
    if (!fileKey || typeof fileKey !== 'string' || !/^[a-zA-Z0-9]+$/.test(fileKey)) {
      throw new Error('Invalid Figma file key format');
    }
  }

  private validateNodeIds(nodeIds: string[]): void {
    if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
      throw new Error('Node IDs must be a non-empty array');
    }
    
    nodeIds.forEach(id => {
      if (!id || typeof id !== 'string' || !/^[\w:-]+$/.test(id)) {
        throw new Error(`Invalid node ID format: ${id}`);
      }
    });
  }

  // Get file information with enhanced error handling
  async getFile(fileKey: string): Promise<FigmaFileResponse> {
    this.validateFileKey(fileKey);
    return this.makeRequest(`/files/${fileKey}`) as Promise<FigmaFileResponse>;
  }

  // Get file nodes (specific components/frames)
  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<Record<string, FigmaNode>> {
    this.validateFileKey(fileKey);
    this.validateNodeIds(nodeIds);
    
    const ids = nodeIds.join(',');
    return this.makeRequest(`/files/${fileKey}/nodes?ids=${ids}`) as Promise<Record<string, FigmaNode>>;
  }

  // Get file images (exports) with enhanced options
  async getFileImages(
    fileKey: string, 
    nodeIds: string[], 
    format: 'jpg' | 'png' | 'svg' | 'pdf' = 'png', 
    scale: number = 1,
    version?: string
  ): Promise<FigmaImagesResponse> {
    this.validateFileKey(fileKey);
    this.validateNodeIds(nodeIds);
    
    if (![1, 2, 3, 4].includes(scale)) {
      throw new Error('Scale must be 1, 2, 3, or 4');
    }
    
    const ids = nodeIds.join(',');
    const params = new URLSearchParams({
      ids,
      format,
      scale: scale.toString(),
      ...(version && { version })
    });
    
    return this.makeRequest(`/files/${fileKey}/images?${params}`) as Promise<FigmaImagesResponse>;
  }

  // Get team projects with pagination
  async getTeamProjects(teamId: string, cursor?: string): Promise<{ projects: FigmaTeamProject[]; cursor?: string }> {
    if (!teamId || typeof teamId !== 'string') {
      throw new Error('Invalid team ID');
    }
    
    const params = cursor ? `?cursor=${cursor}` : '';
    return this.makeRequest(`/teams/${teamId}/projects${params}`) as Promise<{ projects: FigmaTeamProject[]; cursor?: string }>;
  }

  // Get project files with pagination
  async getProjectFiles(projectId: string, cursor?: string): Promise<{ files: FigmaProjectFile[]; cursor?: string }> {
    if (!projectId || typeof projectId !== 'string') {
      throw new Error('Invalid project ID');
    }
    
    const params = cursor ? `?cursor=${cursor}` : '';
    return this.makeRequest(`/projects/${projectId}/files${params}`) as Promise<{ files: FigmaProjectFile[]; cursor?: string }>;
  }

  // Get user information
  async getUser(): Promise<FigmaUser> {
    return this.makeRequest('/me') as Promise<FigmaUser>;
  }

  // Get file comments with pagination
  async getFileComments(fileKey: string, cursor?: string): Promise<FigmaCommentsResponse & { cursor?: string }> {
    this.validateFileKey(fileKey);
    
    const params = cursor ? `?cursor=${cursor}` : '';
    return this.makeRequest(`/files/${fileKey}/comments${params}`) as Promise<FigmaCommentsResponse & { cursor?: string }>;
  }

  // Post a comment with input sanitization
  async postComment(fileKey: string, message: string, clientMeta: Record<string, unknown>): Promise<FigmaComment> {
    this.validateFileKey(fileKey);
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Comment message is required');
    }
    
    if (message.length > 10000) {
      throw new Error('Comment message too long (max 10000 characters)');
    }
    
    // Sanitize message (basic HTML/script tag removal)
    const sanitizedMessage = message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    const response = await fetch(`${this.baseUrl}/files/${fileKey}/comments`, {
      method: 'POST',
      headers: {
        'X-Figma-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: sanitizedMessage,
        client_meta: clientMeta,
      }),
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<FigmaComment>;
  }

  // Get file version history
  async getFileVersions(fileKey: string): Promise<{ versions: Array<{ id: string; created_at: string; label: string; description: string; user: FigmaUser }> }> {
    this.validateFileKey(fileKey);
    return this.makeRequest(`/files/${fileKey}/versions`) as Promise<{ versions: Array<{ id: string; created_at: string; label: string; description: string; user: FigmaUser }> }>;
  }

  // Enhanced utility methods
  extractFrames(document: FigmaNode): FigmaNode[] {
    const frames: FigmaNode[] = [];
    
    const traverse = (node: FigmaNode) => {
      if (node.type === 'FRAME' || node.type === 'COMPONENT') {
        frames.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    traverse(document);
    return frames;
  }

  extractComponents(document: FigmaNode): FigmaNode[] {
    const components: FigmaNode[] = [];
    
    const traverse = (node: FigmaNode) => {
      if (node.type === 'COMPONENT') {
        components.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    traverse(document);
    return components;
  }

  // Get exportable nodes with their settings
  getExportableNodes(document: FigmaNode): FigmaNode[] {
    const exportableNodes: FigmaNode[] = [];
    
    const traverse = (node: FigmaNode) => {
      if (node.exportSettings && node.exportSettings.length > 0) {
        exportableNodes.push(node);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    traverse(document);
    return exportableNodes;
  }

  // Batch export with progress tracking
  async batchExport(
    fileKey: string,
    exports: Array<{ nodeIds: string[]; format: 'jpg' | 'png' | 'svg' | 'pdf'; scale: number }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<FigmaImagesResponse[]> {
    const results: FigmaImagesResponse[] = [];
    
    for (let i = 0; i < exports.length; i++) {
      const exportConfig = exports[i];
      const result = await this.getFileImages(
        fileKey,
        exportConfig.nodeIds,
        exportConfig.format,
        exportConfig.scale
      );
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, exports.length);
      }
    }
    
    return results;
  }

  // Health check method
  async healthCheck(): Promise<{ status: 'ok' | 'error'; rateLimitInfo: RateLimitInfo; timestamp: number }> {
    try {
      await this.getUser();
      return {
        status: 'ok',
        rateLimitInfo: this.rateLimitInfo,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'error',
        rateLimitInfo: this.rateLimitInfo,
        timestamp: Date.now()
      };
    }
  }

  // Get rate limit info
  getRateLimitInfo(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  // Update access token
  updateAccessToken(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
  }
}

export default FigmaAPI; 