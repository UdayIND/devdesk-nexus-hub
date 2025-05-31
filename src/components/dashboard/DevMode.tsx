
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  Terminal, 
  Play, 
  Pause, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Code,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DevMode: React.FC = () => {
  const [activeRepo, setActiveRepo] = useState('main-app');

  const repositories = [
    { id: 'main-app', name: 'main-app', branch: 'main', status: 'active' },
    { id: 'api-service', name: 'api-service', branch: 'development', status: 'building' },
    { id: 'ui-components', name: 'ui-components', branch: 'feature/new-buttons', status: 'idle' },
  ];

  const pipelines = [
    {
      id: 1,
      name: 'Build & Test',
      status: 'success',
      duration: '2m 34s',
      commit: 'feat: add new user dashboard',
      author: 'john.doe',
      branch: 'main'
    },
    {
      id: 2,
      name: 'Deploy Staging',
      status: 'running',
      duration: '1m 12s',
      commit: 'fix: resolve login issue',
      author: 'jane.smith',
      branch: 'development'
    },
    {
      id: 3,
      name: 'Security Scan',
      status: 'failed',
      duration: '45s',
      commit: 'refactor: update dependencies',
      author: 'mike.wilson',
      branch: 'security-updates'
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      idle: 'bg-gray-100 text-gray-800',
      building: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800'
    };
    
    return variants[status as keyof typeof variants] || variants.idle;
  };

  return (
    <div className="h-full p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Development Operations</h2>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Terminal className="w-4 h-4 mr-2" />
                Open Terminal
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <GitBranch className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Active Branches</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">12</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Successful Builds</span>
              </div>
              <p className="text-2xl font-bold text-green-900">847</p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Avg Build Time</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">3m 24s</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Active Developers</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">8</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Repositories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Repositories</h3>
            <div className="space-y-3">
              {repositories.map((repo) => (
                <div
                  key={repo.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeRepo === repo.id 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveRepo(repo.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{repo.name}</span>
                    <Badge className={getStatusBadge(repo.status)}>
                      {repo.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <GitBranch className="w-3 h-3" />
                    <span>{repo.branch}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CI/CD Pipelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">CI/CD Pipelines</h3>
              <Button variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Run Pipeline
              </Button>
            </div>
            
            <div className="space-y-4">
              {pipelines.map((pipeline) => (
                <motion.div
                  key={pipeline.id}
                  whileHover={{ scale: 1.01 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(pipeline.status)}
                      <span className="font-medium text-gray-800">{pipeline.name}</span>
                      <Badge className={getStatusBadge(pipeline.status)}>
                        {pipeline.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">{pipeline.duration}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-2">
                      <GitCommit className="w-3 h-3" />
                      <span>{pipeline.commit}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>by {pipeline.author}</span>
                    <span>{pipeline.branch}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Deployment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Deployment Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Production</span>
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="text-sm opacity-90">v2.4.1 - Deployed 2h ago</p>
              <p className="text-xs opacity-75">99.9% uptime</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Staging</span>
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <p className="text-sm opacity-90">v2.5.0-beta - Deploying...</p>
              <p className="text-xs opacity-75">ETA: 3m 15s</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Development</span>
                <Code className="w-5 h-5" />
              </div>
              <p className="text-sm opacity-90">v2.5.0-dev - Active</p>
              <p className="text-xs opacity-75">12 active branches</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DevMode;
