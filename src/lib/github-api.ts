// Enhanced GitHub API Service with OAuth, CI/CD, and Security
// This service handles all interactions with GitHub API for DevOps workflows

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  company?: string;
  location?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubOrganization {
  id: number;
  login: string;
  name: string;
  description?: string;
  avatar_url: string;
  location?: string;
  email?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  type: string;
  company?: string;
  blog?: string;
  html_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  language?: string;
  languages_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  archived: boolean;
  disabled: boolean;
  visibility: 'public' | 'private' | 'internal';
  permissions: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    type: 'User' | 'Organization';
  };
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
  protection?: {
    enabled: boolean;
    required_status_checks?: {
      enforcement_level: string;
      contexts: string[];
    };
  };
}

export interface GitHubTeam {
  id: number;
  name: string;
  slug: string;
  description?: string;
  privacy: 'closed' | 'secret';
  permission: 'pull' | 'push' | 'admin' | 'maintain' | 'triage';
  members_count: number;
  repos_count: number;
  created_at: string;
  updated_at: string;
  organization: {
    login: string;
    id: number;
  };
}

export interface GitHubWorkflow {
  id: number;
  name: string;
  path: string;
  state: 'active' | 'deleted' | 'disabled_fork' | 'disabled_inactivity' | 'disabled_manually';
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  badge_url: string;
}

export interface GitHubWorkflowRun {
  id: number;
  name?: string;
  head_branch: string;
  head_sha: string;
  path: string;
  display_title: string;
  run_number: number;
  event: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required';
  workflow_id: number;
  check_suite_id: number;
  check_suite_node_id: string;
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  actor: GitHubUser;
  run_attempt: number;
  referenced_workflows?: any[];
  run_started_at: string;
  triggering_actor: GitHubUser;
  jobs_url: string;
  logs_url: string;
  check_suite_url: string;
  artifacts_url: string;
  cancel_url: string;
  rerun_url: string;
  previous_attempt_url?: string;
  workflow_url: string;
  head_commit: {
    id: string;
    tree_id: string;
    message: string;
    timestamp: string;
    author: {
      name: string;
      email: string;
    };
    committer: {
      name: string;
      email: string;
    };
  };
  repository: GitHubRepository;
  head_repository: GitHubRepository;
}

export interface GitHubWorkflowJob {
  id: number;
  run_id: number;
  workflow_name: string;
  head_branch: string;
  run_url: string;
  run_attempt: number;
  node_id: string;
  head_sha: string;
  url: string;
  html_url: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required';
  created_at: string;
  started_at: string;
  completed_at?: string;
  name: string;
  steps: Array<{
    name: string;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion?: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required';
    number: number;
    started_at?: string;
    completed_at?: string;
  }>;
  check_run_url: string;
  labels: string[];
  runner_id?: number;
  runner_name?: string;
  runner_group_id?: number;
  runner_group_name?: string;
}

export interface PipelineConfiguration {
  id: string;
  name: string;
  repository: string;
  branch: string;
  workflow_path: string;
  environment_variables: Record<string, string>;
  secrets: Record<string, string>;
  triggers: {
    push: boolean;
    pull_request: boolean;
    schedule?: string;
    manual: boolean;
  };
  notifications: {
    email: string[];
    slack?: string;
    webhook?: string;
  };
  deployment: {
    environment: string;
    auto_deploy: boolean;
    approval_required: boolean;
    reviewers: string[];
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  status: 'active' | 'disabled' | 'archived';
}

export interface BuildHistory {
  id: string;
  pipeline_id: string;
  run_id: number;
  status: 'queued' | 'running' | 'success' | 'failure' | 'cancelled';
  branch: string;
  commit_sha: string;
  commit_message: string;
  triggered_by: string;
  trigger_type: 'push' | 'pull_request' | 'manual' | 'schedule';
  started_at: string;
  completed_at?: string;
  duration?: number;
  logs_url: string;
  artifacts_url?: string;
  deployment_url?: string;
  error_message?: string;
  test_results?: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  coverage?: {
    percentage: number;
    lines_covered: number;
    lines_total: number;
  };
}

export interface GitHubOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  resource: string;
}

export interface GitHubAPIError extends Error {
  status?: number;
  code?: string;
  rateLimitInfo?: RateLimitInfo;
  documentation_url?: string;
}

export interface WebhookPayload {
  action: string;
  repository: GitHubRepository;
  sender: GitHubUser;
  organization?: GitHubOrganization;
  ref?: string;
  before?: string;
  after?: string;
  commits?: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
      username: string;
    };
    url: string;
    distinct: boolean;
  }>;
  head_commit?: {
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
      username: string;
    };
    url: string;
  };
  pull_request?: {
    id: number;
    number: number;
    title: string;
    body: string;
    state: 'open' | 'closed';
    merged: boolean;
    merge_commit_sha?: string;
    head: {
      ref: string;
      sha: string;
      repo: GitHubRepository;
    };
    base: {
      ref: string;
      sha: string;
      repo: GitHubRepository;
    };
    user: GitHubUser;
  };
}

class GitHubAPI {
  private baseUrl = 'https://api.github.com';
  private accessToken: string;
  private rateLimitInfo: RateLimitInfo = { 
    limit: 5000, 
    remaining: 5000, 
    reset: Date.now() + 3600000, 
    used: 0, 
    resource: 'core' 
  };
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || import.meta.env.VITE_GITHUB_ACCESS_TOKEN || '';
  }

  // OAuth Methods
  static generateOAuthUrl(config: GitHubOAuthConfig, state?: string): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      state: state || '',
      allow_signup: 'true',
    });
    
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  static async exchangeCodeForToken(
    code: string, 
    config: GitHubOAuthConfig
  ): Promise<GitHubTokenResponse> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OAuth error: ${data.error_description || data.error}`);
    }

    return data;
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
          console.error('GitHub API request failed:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  private updateRateLimitInfo(headers: Headers): void {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');
    const used = headers.get('X-RateLimit-Used');
    const resource = headers.get('X-RateLimit-Resource');

    if (limit) this.rateLimitInfo.limit = parseInt(limit, 10);
    if (remaining) this.rateLimitInfo.remaining = parseInt(remaining, 10);
    if (reset) this.rateLimitInfo.reset = parseInt(reset, 10) * 1000;
    if (used) this.rateLimitInfo.used = parseInt(used, 10);
    if (resource) this.rateLimitInfo.resource = resource;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const executeRequest = async () => {
        if (!this.accessToken) {
          reject(new Error('GitHub access token is required. Please authenticate first.'));
          return;
        }

        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Accept': 'application/vnd.github+json',
              'X-GitHub-Api-Version': '2022-11-28',
              'User-Agent': 'DevDesk-Nexus-Hub/1.0',
              ...options.headers,
            },
          });

          this.updateRateLimitInfo(response.headers);

          if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
            // Rate limited - implement exponential backoff
            const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0', 10) * 1000;
            const waitTime = Math.max(0, resetTime - Date.now());
            
            setTimeout(() => {
              this.requestQueue.unshift(executeRequest);
              this.processRequestQueue();
            }, waitTime);
            return;
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `GitHub API error: ${response.status} ${response.statusText}`) as GitHubAPIError;
            error.status = response.status;
            error.rateLimitInfo = this.rateLimitInfo;
            error.documentation_url = errorData.documentation_url;
            
            if (response.status === 401) {
              error.code = 'UNAUTHORIZED';
            } else if (response.status === 403) {
              error.code = 'FORBIDDEN';
            } else if (response.status === 404) {
              error.code = 'NOT_FOUND';
            } else if (response.status === 422) {
              error.code = 'VALIDATION_FAILED';
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

  // Input Validation Methods
  private validateRepoName(repo: string): void {
    if (!repo || typeof repo !== 'string' || !/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(repo)) {
      throw new Error('Invalid repository name format. Expected: owner/repo');
    }
  }

  private validateBranchName(branch: string): void {
    if (!branch || typeof branch !== 'string' || branch.length === 0) {
      throw new Error('Branch name is required');
    }
  }

  private validateWorkflowPath(path: string): void {
    if (!path || typeof path !== 'string' || !path.startsWith('.github/workflows/')) {
      throw new Error('Workflow path must start with .github/workflows/');
    }
  }

  // User and Organization Methods
  async getUser(): Promise<GitHubUser> {
    return this.makeRequest('/user') as Promise<GitHubUser>;
  }

  async getUserOrganizations(): Promise<GitHubOrganization[]> {
    return this.makeRequest('/user/orgs') as Promise<GitHubOrganization[]>;
  }

  async getOrganization(org: string): Promise<GitHubOrganization> {
    if (!org || typeof org !== 'string') {
      throw new Error('Organization name is required');
    }
    return this.makeRequest(`/orgs/${org}`) as Promise<GitHubOrganization>;
  }

  async getOrganizationMembers(org: string): Promise<GitHubUser[]> {
    if (!org || typeof org !== 'string') {
      throw new Error('Organization name is required');
    }
    return this.makeRequest(`/orgs/${org}/members`) as Promise<GitHubUser[]>;
  }

  async getOrganizationTeams(org: string): Promise<GitHubTeam[]> {
    if (!org || typeof org !== 'string') {
      throw new Error('Organization name is required');
    }
    return this.makeRequest(`/orgs/${org}/teams`) as Promise<GitHubTeam[]>;
  }

  // Repository Methods
  async getUserRepositories(type: 'all' | 'owner' | 'member' = 'all'): Promise<GitHubRepository[]> {
    return this.makeRequest(`/user/repos?type=${type}&sort=updated&per_page=100`) as Promise<GitHubRepository[]>;
  }

  async getOrganizationRepositories(org: string): Promise<GitHubRepository[]> {
    if (!org || typeof org !== 'string') {
      throw new Error('Organization name is required');
    }
    return this.makeRequest(`/orgs/${org}/repos?sort=updated&per_page=100`) as Promise<GitHubRepository[]>;
  }

  async getRepository(repo: string): Promise<GitHubRepository> {
    this.validateRepoName(repo);
    return this.makeRequest(`/repos/${repo}`) as Promise<GitHubRepository>;
  }

  async getRepositoryBranches(repo: string): Promise<GitHubBranch[]> {
    this.validateRepoName(repo);
    return this.makeRequest(`/repos/${repo}/branches`) as Promise<GitHubBranch[]>;
  }

  async getRepositoryLanguages(repo: string): Promise<Record<string, number>> {
    this.validateRepoName(repo);
    return this.makeRequest(`/repos/${repo}/languages`) as Promise<Record<string, number>>;
  }

  // Workflow and CI/CD Methods
  async getRepositoryWorkflows(repo: string): Promise<{ workflows: GitHubWorkflow[] }> {
    this.validateRepoName(repo);
    return this.makeRequest(`/repos/${repo}/actions/workflows`) as Promise<{ workflows: GitHubWorkflow[] }>;
  }

  async getWorkflowRuns(repo: string, workflowId?: number, branch?: string): Promise<{ workflow_runs: GitHubWorkflowRun[] }> {
    this.validateRepoName(repo);
    
    let endpoint = `/repos/${repo}/actions/runs?per_page=50`;
    if (workflowId) endpoint += `&workflow_id=${workflowId}`;
    if (branch) endpoint += `&branch=${encodeURIComponent(branch)}`;
    
    return this.makeRequest(endpoint) as Promise<{ workflow_runs: GitHubWorkflowRun[] }>;
  }

  async getWorkflowRun(repo: string, runId: number): Promise<GitHubWorkflowRun> {
    this.validateRepoName(repo);
    return this.makeRequest(`/repos/${repo}/actions/runs/${runId}`) as Promise<GitHubWorkflowRun>;
  }

  async getWorkflowJobs(repo: string, runId: number): Promise<{ jobs: GitHubWorkflowJob[] }> {
    this.validateRepoName(repo);
    return this.makeRequest(`/repos/${repo}/actions/runs/${runId}/jobs`) as Promise<{ jobs: GitHubWorkflowJob[] }>;
  }

  async triggerWorkflow(repo: string, workflowId: number | string, ref: string, inputs?: Record<string, any>): Promise<void> {
    this.validateRepoName(repo);
    this.validateBranchName(ref);
    
    await this.makeRequest(`/repos/${repo}/actions/workflows/${workflowId}/dispatches`, {
      method: 'POST',
      body: JSON.stringify({
        ref,
        inputs: inputs || {},
      }),
    });
  }

  async cancelWorkflowRun(repo: string, runId: number): Promise<void> {
    this.validateRepoName(repo);
    await this.makeRequest(`/repos/${repo}/actions/runs/${runId}/cancel`, {
      method: 'POST',
    });
  }

  async rerunWorkflowRun(repo: string, runId: number): Promise<void> {
    this.validateRepoName(repo);
    await this.makeRequest(`/repos/${repo}/actions/runs/${runId}/rerun`, {
      method: 'POST',
    });
  }

  // Webhook Methods
  async createWebhook(repo: string, config: {
    url: string;
    content_type: 'json' | 'form';
    secret?: string;
    insecure_ssl?: boolean;
  }, events: string[] = ['push', 'pull_request']): Promise<any> {
    this.validateRepoName(repo);
    
    return this.makeRequest(`/repos/${repo}/hooks`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'web',
        active: true,
        events,
        config,
      }),
    });
  }

  async getWebhooks(repo: string): Promise<any[]> {
    this.validateRepoName(repo);
    return this.makeRequest(`/repos/${repo}/hooks`) as Promise<any[]>;
  }

  async deleteWebhook(repo: string, hookId: number): Promise<void> {
    this.validateRepoName(repo);
    await this.makeRequest(`/repos/${repo}/hooks/${hookId}`, {
      method: 'DELETE',
    });
  }

  // Security and Validation Methods
  static validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  static parseWebhookPayload(payload: string): WebhookPayload {
    try {
      return JSON.parse(payload);
    } catch (error) {
      throw new Error('Invalid webhook payload format');
    }
  }

  // Utility Methods
  getRateLimitInfo(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  updateAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
  }

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

  // Advanced Pipeline Management
  async getRepositorySecrets(repo: string): Promise<{ secrets: Array<{ name: string; created_at: string; updated_at: string }> }> {
    this.validateRepoName(repo);
    return this.makeRequest(`/repos/${repo}/actions/secrets`) as Promise<{ secrets: Array<{ name: string; created_at: string; updated_at: string }> }>;
  }

  async createRepositorySecret(repo: string, secretName: string, encryptedValue: string, keyId: string): Promise<void> {
    this.validateRepoName(repo);
    
    await this.makeRequest(`/repos/${repo}/actions/secrets/${secretName}`, {
      method: 'PUT',
      body: JSON.stringify({
        encrypted_value: encryptedValue,
        key_id: keyId,
      }),
    });
  }

  async getRepositoryEnvironments(repo: string): Promise<{ environments: Array<{ id: number; name: string; url: string; html_url: string; created_at: string; updated_at: string }> }> {
    this.validateRepoName(repo);
    return this.makeRequest(`/repos/${repo}/environments`) as Promise<{ environments: Array<{ id: number; name: string; url: string; html_url: string; created_at: string; updated_at: string }> }>;
  }

  async getWorkflowRunLogs(repo: string, runId: number): Promise<ArrayBuffer> {
    this.validateRepoName(repo);
    const response = await fetch(`${this.baseUrl}/repos/${repo}/actions/runs/${runId}/logs`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github+json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
    }
    
    return response.arrayBuffer();
  }
}

export default GitHubAPI; 