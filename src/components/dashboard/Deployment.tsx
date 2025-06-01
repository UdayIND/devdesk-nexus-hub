import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Database, 
  GitBranch, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Monitor,
  Globe,
  Shield,
  Zap,
  BarChart3,
  Terminal,
  Cloud,
  Package,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRenderAPI } from '@/lib/render-api';

interface DeploymentStatus {
  id: string;
  name: string;
  status: 'success' | 'error' | 'pending' | 'running';
  lastDeploy: string;
  branch: string;
  commit: string;
  url?: string;
}

interface Pipeline {
  id: string;
  name: string;
  status: 'success' | 'error' | 'running' | 'pending';
  duration: string;
  steps: Array<{
    name: string;
    status: 'success' | 'error' | 'running' | 'pending';
    duration?: string;
  }>;
}

const Deployment: React.FC = () => {
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([
    {
      id: '1',
      name: 'Frontend (Vercel)',
      status: 'success',
      lastDeploy: '2 minutes ago',
      branch: 'main',
      commit: 'feat: add deployment dashboard',
      url: 'https://devdesk-nexus.vercel.app'
    },
    {
      id: '2',
      name: 'Backend API (Render)',
      status: 'success',
      lastDeploy: '5 minutes ago',
      branch: 'main',
      commit: 'fix: optimize database queries',
      url: 'https://devdesk-api.onrender.com'
    },
    {
      id: '3',
      name: 'Database (Supabase)',
      status: 'success',
      lastDeploy: '1 hour ago',
      branch: 'main',
      commit: 'schema: add notifications table'
    }
  ]);

  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: '1',
      name: 'Frontend CI/CD',
      status: 'success',
      duration: '2m 34s',
      steps: [
        { name: 'Install Dependencies', status: 'success', duration: '45s' },
        { name: 'Run Tests', status: 'success', duration: '1m 12s' },
        { name: 'Build', status: 'success', duration: '37s' },
        { name: 'Deploy to Vercel', status: 'success', duration: '23s' }
      ]
    },
    {
      id: '2',
      name: 'Backend CI/CD',
      status: 'running',
      duration: '1m 45s',
      steps: [
        { name: 'Install Dependencies', status: 'success', duration: '32s' },
        { name: 'Run Tests', status: 'success', duration: '58s' },
        { name: 'Build Docker Image', status: 'running' },
        { name: 'Deploy to Render', status: 'pending' }
      ]
    }
  ]);

  const [uptimeStats, setUptimeStats] = useState({
    frontend: { uptime: 99.9, status: 'operational', responseTime: 145 },
    backend: { uptime: 99.7, status: 'operational', responseTime: 234 },
    database: { uptime: 99.95, status: 'operational', responseTime: 89 }
  });

  // Use the Render API hook
  const { isConfigured: renderConfigured, getServiceInfo, triggerDeploy } = useRenderAPI();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deployment Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your applications, databases, and CI/CD pipelines</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button size="sm">
            <Rocket className="w-4 h-4 mr-2" />
            Deploy Now
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deployments</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              98.7% success rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <Activity className="w-4 h-4 mr-1" />
              All operational
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">156ms</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <BarChart3 className="w-4 h-4 mr-1" />
              12% faster than last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <Monitor className="w-4 h-4 mr-1" />
              30 days average
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Service Configuration Status
          </CardTitle>
          <CardDescription>Check the status of your service integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Render API</span>
              </div>
              <Badge className={renderConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {renderConfigured ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-black" />
                <span className="text-sm font-medium">Vercel</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Supabase</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">UptimeRobot</span>
              </div>
              <Badge className="bg-red-100 text-red-800">Not Configured</Badge>
            </div>
          </div>
          {!renderConfigured && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Render API Setup Required</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    To enable Render integration, add the following environment variables:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• <code className="bg-blue-100 px-1 rounded">RENDER_API_KEY</code> - Your Render API key</li>
                    <li>• <code className="bg-blue-100 px-1 rounded">RENDER_SERVICE_URL</code> - Your service URL (e.g., https://myapp.onrender.com)</li>
                    <li>• <code className="bg-blue-100 px-1 rounded">RENDER_SERVICE_NAME</code> - Your service name (optional, alternative to URL)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deployment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Deployment Status
            </CardTitle>
            <CardDescription>Current status of all deployed services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deployments.map((deployment) => (
              <motion.div
                key={deployment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(deployment.status)}`}>
                    {getStatusIcon(deployment.status)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{deployment.name}</h3>
                    <p className="text-sm text-gray-600">
                      {deployment.branch} • {deployment.commit}
                    </p>
                    <p className="text-xs text-gray-500">{deployment.lastDeploy}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={deployment.status === 'success' ? 'default' : 'destructive'}>
                    {deployment.status}
                  </Badge>
                  {deployment.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* CI/CD Pipelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GitBranch className="w-5 h-5 mr-2" />
              CI/CD Pipelines
            </CardTitle>
            <CardDescription>Recent pipeline executions and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelines.map((pipeline) => (
              <motion.div
                key={pipeline.id}
                className="p-4 bg-gray-50 rounded-lg"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(pipeline.status)}`}>
                      {getStatusIcon(pipeline.status)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{pipeline.name}</h3>
                      <p className="text-sm text-gray-600">Duration: {pipeline.duration}</p>
                    </div>
                  </div>
                  <Badge variant={pipeline.status === 'success' ? 'default' : 'destructive'}>
                    {pipeline.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {pipeline.steps.map((step, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          step.status === 'success' ? 'bg-green-500' :
                          step.status === 'error' ? 'bg-red-500' :
                          step.status === 'running' ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-300'
                        }`} />
                        <span className="text-gray-700">{step.name}</span>
                      </div>
                      {step.duration && (
                        <span className="text-gray-500">{step.duration}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frontend (Vercel) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Frontend (Vercel)
            </CardTitle>
            <CardDescription>React application deployment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium">{uptimeStats.frontend.uptime}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium">{uptimeStats.frontend.responseTime}ms</span>
            </div>
            <Progress value={uptimeStats.frontend.uptime} className="h-2" />
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Terminal className="w-4 h-4 mr-2" />
                Logs
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Config
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backend (Render) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Backend (Render)
            </CardTitle>
            <CardDescription>Node.js API server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium">{uptimeStats.backend.uptime}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium">{uptimeStats.backend.responseTime}ms</span>
            </div>
            <Progress value={uptimeStats.backend.uptime} className="h-2" />
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Terminal className="w-4 h-4 mr-2" />
                Logs
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Config
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Database (Supabase) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Database (Supabase)
            </CardTitle>
            <CardDescription>PostgreSQL database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium">{uptimeStats.database.uptime}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Query Time</span>
              <span className="text-sm font-medium">{uptimeStats.database.responseTime}ms</span>
            </div>
            <Progress value={uptimeStats.database.uptime} className="h-2" />
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <BarChart3 className="w-4 h-4 mr-2" />
                Metrics
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Config
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Variables & Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Environment Configuration
          </CardTitle>
          <CardDescription>Required environment variables and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Supabase</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>SUPABASE_URL</div>
                <div>SUPABASE_ANON_KEY</div>
                <div>SUPABASE_SERVICE_ROLE_KEY</div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Render</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>RENDER_API_KEY</div>
                <div>RENDER_SERVICE_URL</div>
                <div>RENDER_SERVICE_NAME</div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Vercel</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>VERCEL_TOKEN</div>
                <div>VERCEL_PROJECT_ID</div>
                <div>VERCEL_ORG_ID</div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">UptimeRobot</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>UPTIMEROBOT_API_KEY</div>
                <div>UPTIMEROBOT_MONITOR_ID</div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">GitHub</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>GITHUB_TOKEN</div>
                <div>GITHUB_WEBHOOK_SECRET</div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Notifications</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>SLACK_WEBHOOK_URL</div>
                <div>DISCORD_WEBHOOK_URL</div>
                <div>EMAIL_SERVICE_KEY</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Deployment; 