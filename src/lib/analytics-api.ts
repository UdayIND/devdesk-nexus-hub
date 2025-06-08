// Analytics API Service for Dashboard Metrics

export interface AnalyticsData {
  users: UserMetrics;
  projects: ProjectMetrics;
  activity: ActivityMetrics;
  revenue: RevenueMetrics;
  topProjects: TopProject[];
  recentActivity: ActivityItem[];
  chartData: ChartData;
  timeRange: '7d' | '30d' | '90d' | '1y';
}

export interface UserMetrics {
  total: number;
  active: number;
  new: number;
  growth: number;
  online: number;
}

export interface ProjectMetrics {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  growth: number;
}

export interface ActivityMetrics {
  commits: number;
  deployments: number;
  meetings: number;
  documents: number;
  growth: number;
}

export interface RevenueMetrics {
  current: number;
  target: number;
  growth: number;
  projection: number;
}

export interface TopProject {
  id: string;
  name: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'delayed';
  team: number;
  deadline: string;
}

export interface ActivityItem {
  id: string;
  type: 'commit' | 'deployment' | 'meeting' | 'document' | 'task';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChartData {
  daily: Array<{
    date: string;
    users: number;
    projects: number;
    activity: number;
    revenue: number;
  }>;
  hourly: Array<{
    hour: string;
    active: number;
  }>;
  projectStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    target: number;
  }>;
}

// Mock Analytics Data
const generateMockChartData = (timeRange: '7d' | '30d' | '90d' | '1y'): ChartData => {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const daily = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    daily.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 500) + 100,
      projects: Math.floor(Math.random() * 50) + 10,
      activity: Math.floor(Math.random() * 1000) + 200,
      revenue: Math.floor(Math.random() * 50000) + 10000
    });
  }

  const hourly = [];
  for (let i = 0; i < 24; i++) {
    hourly.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      active: Math.floor(Math.random() * 150) + 20
    });
  }

  return {
    daily,
    hourly,
    projectStatus: [
      { status: 'Completed', count: 28, percentage: 40 },
      { status: 'In Progress', count: 24, percentage: 34 },
      { status: 'Planning', count: 12, percentage: 17 },
      { status: 'On Hold', count: 6, percentage: 9 }
    ],
    revenueByMonth: [
      { month: 'Jan', revenue: 45000, target: 50000 },
      { month: 'Feb', revenue: 52000, target: 55000 },
      { month: 'Mar', revenue: 48000, target: 50000 },
      { month: 'Apr', revenue: 61000, target: 60000 },
      { month: 'May', revenue: 55000, target: 65000 },
      { month: 'Jun', revenue: 67000, target: 65000 }
    ]
  };
};

const MOCK_ANALYTICS_DATA: AnalyticsData = {
  users: {
    total: 1247,
    active: 892,
    new: 143,
    growth: 12.5,
    online: 234
  },
  projects: {
    total: 70,
    completed: 28,
    inProgress: 24,
    overdue: 6,
    growth: 8.3
  },
  activity: {
    commits: 1842,
    deployments: 156,
    meetings: 89,
    documents: 312,
    growth: 15.7
  },
  revenue: {
    current: 284750,
    target: 300000,
    growth: 18.2,
    projection: 320000
  },
  topProjects: [
    {
      id: 'proj-1',
      name: 'E-commerce Platform Redesign',
      progress: 78,
      status: 'on-track',
      team: 8,
      deadline: '2024-07-15'
    },
    {
      id: 'proj-2',
      name: 'Mobile App Development',
      progress: 45,
      status: 'at-risk',
      team: 6,
      deadline: '2024-06-30'
    },
    {
      id: 'proj-3',
      name: 'API Gateway Implementation',
      progress: 92,
      status: 'on-track',
      team: 4,
      deadline: '2024-06-20'
    },
    {
      id: 'proj-4',
      name: 'Data Migration Project',
      progress: 23,
      status: 'delayed',
      team: 5,
      deadline: '2024-08-01'
    },
    {
      id: 'proj-5',
      name: 'Security Audit & Compliance',
      progress: 67,
      status: 'on-track',
      team: 3,
      deadline: '2024-07-10'
    }
  ],
  recentActivity: [
    {
      id: 'act-1',
      type: 'commit',
      title: 'Fixed authentication bug',
      description: 'Resolved issue with JWT token validation',
      user: 'John Doe',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      metadata: { repository: 'auth-service', branch: 'main' }
    },
    {
      id: 'act-2',
      type: 'deployment',
      title: 'Production deployment completed',
      description: 'v2.1.3 deployed to production environment',
      user: 'CI/CD Pipeline',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      metadata: { version: '2.1.3', environment: 'production' }
    },
    {
      id: 'act-3',
      type: 'meeting',
      title: 'Sprint planning meeting',
      description: 'Planning for Sprint 15 - Q2 objectives',
      user: 'Jane Smith',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      metadata: { duration: 60, attendees: 8 }
    },
    {
      id: 'act-4',
      type: 'document',
      title: 'API documentation updated',
      description: 'Added new endpoints and examples',
      user: 'Mike Johnson',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      metadata: { pages: 12, format: 'markdown' }
    },
    {
      id: 'act-5',
      type: 'task',
      title: 'Code review completed',
      description: 'Reviewed PR #247 - User authentication improvements',
      user: 'Sarah Wilson',
      timestamp: new Date(Date.now() - 1500000).toISOString(),
      metadata: { pr: 247, linesChanged: 156 }
    }
  ],
  chartData: generateMockChartData('30d'),
  timeRange: '30d'
};

// Mock flag
const USE_MOCK_DATA = false; // Production-ready: Always attempt real API first

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class AnalyticsAPI {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'https://devdesk-nexus-hub.onrender.com') {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Analytics API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private mockResponse<T>(data: T): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data });
      }, 300 + Math.random() * 700); // Simulate network delay
    });
  }

  async getAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<AnalyticsData>> {
    if (USE_MOCK_DATA) {
      const analyticsData = {
        ...MOCK_ANALYTICS_DATA,
        chartData: generateMockChartData(timeRange),
        timeRange
      };
      
      return this.mockResponse(analyticsData);
    }

    return this.request<AnalyticsData>(`/api/analytics?timeRange=${timeRange}`);
  }

  async getUserMetrics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<UserMetrics>> {
    if (USE_MOCK_DATA) {
      return this.mockResponse(MOCK_ANALYTICS_DATA.users);
    }

    return this.request<UserMetrics>(`/api/analytics/users?timeRange=${timeRange}`);
  }

  async getProjectMetrics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<ProjectMetrics>> {
    if (USE_MOCK_DATA) {
      return this.mockResponse(MOCK_ANALYTICS_DATA.projects);
    }

    return this.request<ProjectMetrics>(`/api/analytics/projects?timeRange=${timeRange}`);
  }

  async getActivityMetrics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<ActivityMetrics>> {
    if (USE_MOCK_DATA) {
      return this.mockResponse(MOCK_ANALYTICS_DATA.activity);
    }

    return this.request<ActivityMetrics>(`/api/analytics/activity?timeRange=${timeRange}`);
  }

  async getRevenueMetrics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<RevenueMetrics>> {
    if (USE_MOCK_DATA) {
      return this.mockResponse(MOCK_ANALYTICS_DATA.revenue);
    }

    return this.request<RevenueMetrics>(`/api/analytics/revenue?timeRange=${timeRange}`);
  }

  async getTopProjects(limit: number = 5): Promise<ApiResponse<TopProject[]>> {
    if (USE_MOCK_DATA) {
      return this.mockResponse(MOCK_ANALYTICS_DATA.topProjects.slice(0, limit));
    }

    return this.request<TopProject[]>(`/api/analytics/top-projects?limit=${limit}`);
  }

  async getRecentActivity(limit: number = 10): Promise<ApiResponse<ActivityItem[]>> {
    if (USE_MOCK_DATA) {
      return this.mockResponse(MOCK_ANALYTICS_DATA.recentActivity.slice(0, limit));
    }

    return this.request<ActivityItem[]>(`/api/analytics/recent-activity?limit=${limit}`);
  }

  async getChartData(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<ChartData>> {
    if (USE_MOCK_DATA) {
      return this.mockResponse(generateMockChartData(timeRange));
    }

    return this.request<ChartData>(`/api/analytics/charts?timeRange=${timeRange}`);
  }

  async exportAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d', format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    if (USE_MOCK_DATA) {
      // Simulate CSV export
      const mockCsvData = [
        'Date,Users,Projects,Activity,Revenue',
        ...MOCK_ANALYTICS_DATA.chartData.daily.map(item => 
          `${item.date},${item.users},${item.projects},${item.activity},${item.revenue}`
        )
      ].join('\n');

      const blob = new Blob([mockCsvData], { type: 'text/csv' });
      const downloadUrl = URL.createObjectURL(blob);
      
      return this.mockResponse({ downloadUrl });
    }

    return this.request<{ downloadUrl: string }>(`/api/analytics/export?timeRange=${timeRange}&format=${format}`);
  }

  async refreshAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    if (USE_MOCK_DATA) {
      // Simulate refreshed data with slight variations
      const refreshedData = {
        ...MOCK_ANALYTICS_DATA,
        users: {
          ...MOCK_ANALYTICS_DATA.users,
          active: MOCK_ANALYTICS_DATA.users.active + Math.floor(Math.random() * 20) - 10,
          online: MOCK_ANALYTICS_DATA.users.online + Math.floor(Math.random() * 40) - 20
        },
        activity: {
          ...MOCK_ANALYTICS_DATA.activity,
          commits: MOCK_ANALYTICS_DATA.activity.commits + Math.floor(Math.random() * 100) - 50
        }
      };

      return this.mockResponse(refreshedData);
    }

    return this.request<AnalyticsData>('/api/analytics/refresh', {
      method: 'POST',
    });
  }
}

export default new AnalyticsAPI(); 