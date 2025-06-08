import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  FileText, 
  Activity, 
  DollarSign,
  Calendar,
  Clock,
  Target,
  Zap,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  totalUsers: number;
  activeProjects: number;
  teamActivity: number;
  revenue: number;
  userGrowth: number;
  projectGrowth: number;
  activityGrowth: number;
  revenueGrowth: number;
  weeklyData: Array<{
    day: string;
    users: number;
    projects: number;
    activity: number;
  }>;
  topProjects: Array<{
    name: string;
    progress: number;
    team: number;
    status: 'active' | 'completed' | 'paused';
  }>;
  recentActivity: Array<{
    user: string;
    action: string;
    project: string;
    time: string;
  }>;
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 1234,
    activeProjects: 56,
    teamActivity: 89,
    revenue: 12345,
    userGrowth: 12,
    projectGrowth: 8,
    activityGrowth: 5,
    revenueGrowth: 15,
    weeklyData: [
      { day: 'Mon', users: 120, projects: 8, activity: 85 },
      { day: 'Tue', users: 135, projects: 12, activity: 92 },
      { day: 'Wed', users: 148, projects: 15, activity: 88 },
      { day: 'Thu', users: 162, projects: 18, activity: 95 },
      { day: 'Fri', users: 178, projects: 22, activity: 91 },
      { day: 'Sat', users: 145, projects: 16, activity: 78 },
      { day: 'Sun', users: 132, projects: 14, activity: 82 },
    ],
    topProjects: [
      { name: 'E-commerce Platform', progress: 85, team: 8, status: 'active' },
      { name: 'Mobile App Redesign', progress: 92, team: 6, status: 'active' },
      { name: 'API Integration', progress: 100, team: 4, status: 'completed' },
      { name: 'Dashboard Analytics', progress: 65, team: 5, status: 'active' },
      { name: 'User Authentication', progress: 45, team: 3, status: 'paused' },
    ],
    recentActivity: [
      { user: 'John Doe', action: 'completed task', project: 'E-commerce Platform', time: '2 minutes ago' },
      { user: 'Jane Smith', action: 'created new branch', project: 'Mobile App Redesign', time: '5 minutes ago' },
      { user: 'Mike Johnson', action: 'deployed to staging', project: 'API Integration', time: '12 minutes ago' },
      { user: 'Sarah Wilson', action: 'reviewed pull request', project: 'Dashboard Analytics', time: '18 minutes ago' },
      { user: 'Alex Brown', action: 'updated documentation', project: 'User Authentication', time: '25 minutes ago' },
    ]
  });

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate some random variations to simulate real data updates
    setData(prev => ({
      ...prev,
      totalUsers: prev.totalUsers + Math.floor(Math.random() * 10 - 5),
      activeProjects: prev.activeProjects + Math.floor(Math.random() * 4 - 2),
      teamActivity: Math.min(100, Math.max(0, prev.teamActivity + Math.floor(Math.random() * 10 - 5))),
      revenue: prev.revenue + Math.floor(Math.random() * 1000 - 500),
    }));
    
    setIsLoading(false);
  };

  const exportData = () => {
    const csvContent = [
      ['Metric', 'Value', 'Growth'],
      ['Total Users', data.totalUsers.toString(), `${data.userGrowth}%`],
      ['Active Projects', data.activeProjects.toString(), `${data.projectGrowth}%`],
      ['Team Activity', `${data.teamActivity}%`, `${data.activityGrowth}%`],
      ['Revenue', `$${data.revenue}`, `${data.revenueGrowth}%`],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    growth, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    growth: number; 
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {growth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={growth >= 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(growth)}%
            </span>
            <span className="text-gray-500 ml-1">from last {timeRange}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const SimpleChart = ({ data: chartData, title }: { data: any[]; title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600"
                style={{ 
                  height: `${(item.users / Math.max(...chartData.map(d => d.users))) * 200}px`,
                  minHeight: '4px'
                }}
              />
              <span className="text-xs text-gray-500 mt-2">{item.day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 bg-gray-50 h-full overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track your team's performance and project metrics
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={data.totalUsers.toLocaleString()}
            icon={Users}
            growth={data.userGrowth}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Projects"
            value={data.activeProjects}
            icon={FileText}
            growth={data.projectGrowth}
            color="bg-green-500"
          />
          <StatCard
            title="Team Activity"
            value={`${data.teamActivity}%`}
            icon={Activity}
            growth={data.activityGrowth}
            color="bg-purple-500"
          />
          <StatCard
            title="Revenue"
            value={`$${data.revenue.toLocaleString()}`}
            icon={DollarSign}
            growth={data.revenueGrowth}
            color="bg-yellow-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SimpleChart data={data.weeklyData} title="User Activity Trends" />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <Badge 
                          variant={
                            project.status === 'completed' ? 'default' :
                            project.status === 'active' ? 'secondary' : 'outline'
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{project.progress}% complete</span>
                        <span>{project.team} team members</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest team actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action} in{' '}
                      <span className="font-medium">{activity.project}</span>
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics; 