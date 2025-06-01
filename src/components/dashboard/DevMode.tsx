import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Users, 
  Building2,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  ExternalLink,
  Plus,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useGitHub } from '@/hooks/useGitHub';

// Import actual components
import GitHubAuth from './GitHubAuth';
import RepositorySelector from './RepositorySelector';
import WorkflowManager from './WorkflowManager';
import PipelineConfiguration from './PipelineConfiguration';
import BuildHistory from './BuildHistory';
import OrganizationOverview from './OrganizationOverview';
import SecuritySettings from './SecuritySettings';

const DevMode: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // GitHub integration state
  const {
    authState,
    organizations,
    repositories,
    workflows,
    workflowRuns,
    branches,
    selectedRepository,
    selectedOrganization,
    selectRepository,
    selectOrganization,
    isLoading,
    hasError,
    userError,
    organizationsError,
    repositoriesError,
    workflowsError,
    workflowRunsError,
    triggerWorkflow,
    getWorkflowRunDetails,
    getWorkflowRunLogs,
    cancelWorkflowRun,
    rerunWorkflowRun,
    isTriggeringWorkflow,
    refetchUser,
  } = useGitHub({
    oauthConfig: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_GITHUB_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/auth/github/callback`,
      scopes: ['repo', 'read:org', 'read:user', 'user:email', 'workflow'],
    },
    enableAutoRefresh: true,
    enableRealTimeUpdates: true,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (authState.isAuthenticated) {
        await refetchUser();
        // Note: In the actual implementation, you'd need to add refetch methods
        // for organizations, repositories, etc. to the hook
      }
      toast({
        title: "Data Refreshed",
        description: "All data has been refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleTriggerWorkflow = async (workflowId: number, ref: string, inputs?: Record<string, any>) => {
    if (!selectedRepository) return;
    
    try {
      await triggerWorkflow({
        workflowId,
        ref,
        inputs,
      });
    } catch (error) {
      throw error;
    }
  };

  const handleGetRunDetails = async (runId: number) => {
    if (!selectedRepository) return null;
    
    return await getWorkflowRunDetails(runId);
  };

  const handleGetRunLogs = async (runId: number) => {
    if (!selectedRepository) return '';
    
    const logs = await getWorkflowRunLogs(runId);
    // Convert ArrayBuffer to string
    return new TextDecoder().decode(logs);
  };

  const handleCancelRun = async (runId: number) => {
    if (!selectedRepository) return;
    
    await cancelWorkflowRun(runId);
  };

  const handleRerunWorkflow = async (runId: number) => {
    if (!selectedRepository) return;
    
    await rerunWorkflowRun(runId);
  };

  // Show authentication screen if not authenticated
  if (!authState.isAuthenticated) {
    return <GitHubAuth />;
  }

  const currentError = hasError ? (userError || organizationsError || repositoriesError || workflowsError || workflowRunsError) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Dev Mode</h1>
            </div>
            
            {/* Repository Selector */}
            <RepositorySelector
              organizations={organizations}
              repositories={repositories}
              selectedOrganization={selectedOrganization}
              selectedRepository={selectedRepository}
              onSelectOrganization={selectOrganization}
              onSelectRepository={selectRepository}
              isLoading={isLoading}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Connected as {authState.user?.login}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-gray-200 bg-white px-6">
            <TabsList className="grid w-full grid-cols-6 max-w-4xl">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Workflows</span>
              </TabsTrigger>
              <TabsTrigger value="configuration" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Configuration</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger value="organization" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Organization</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <TabsContent value="overview" className="h-full m-0">
                  <OrganizationOverview
                    organizations={organizations}
                    selectedOrganization={selectedOrganization}
                    onSelectOrganization={selectOrganization}
                  />
                </TabsContent>

                <TabsContent value="workflows" className="h-full m-0">
                  <WorkflowManager
                    workflows={workflows}
                    branches={branches}
                    selectedRepository={selectedRepository}
                    onTriggerWorkflow={handleTriggerWorkflow}
                    isTriggeringWorkflow={isTriggeringWorkflow}
                  />
                </TabsContent>

                <TabsContent value="configuration" className="h-full m-0">
                  <PipelineConfiguration
                    selectedRepository={selectedRepository}
                    workflows={workflows}
                    branches={branches}
                  />
                </TabsContent>

                <TabsContent value="history" className="h-full m-0">
                  <BuildHistory
                    workflowRuns={workflowRuns}
                    selectedRepository={selectedRepository}
                    onGetRunDetails={handleGetRunDetails}
                    onGetRunLogs={handleGetRunLogs}
                    onCancelRun={handleCancelRun}
                    onRerunWorkflow={handleRerunWorkflow}
                  />
                </TabsContent>

                <TabsContent value="organization" className="h-full m-0">
                  <OrganizationOverview
                    organizations={organizations}
                    selectedOrganization={selectedOrganization}
                    onSelectOrganization={selectOrganization}
                  />
                </TabsContent>

                <TabsContent value="security" className="h-full m-0">
                  <SecuritySettings
                    selectedRepository={selectedRepository}
                    selectedOrganization={selectedOrganization}
                  />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {selectedRepository && (
              <span>
                Repository: {selectedRepository.owner.login}/{selectedRepository.name}
              </span>
            )}
            {workflows && workflows.length > 0 && (
              <span>
                Workflows: {workflows.length}
              </span>
            )}
            {workflowRuns && workflowRuns.length > 0 && (
              <span>
                Recent Runs: {workflowRuns.filter(r => r.status === 'in_progress').length} running
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {currentError && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Error: {currentError.message}</span>
              </div>
            )}
            
            {isLoading && (
              <div className="flex items-center space-x-1">
                <Activity className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            )}
            
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevMode;
