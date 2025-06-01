import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  ExternalLink, 
  Search,
  Filter,
  Calendar,
  User,
  GitBranch,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { GitHubWorkflowRun, GitHubRepository } from '@/lib/github-api';

interface BuildHistoryProps {
  workflowRuns?: GitHubWorkflowRun[];
  selectedRepository?: GitHubRepository | null;
  onGetRunDetails: (runId: number) => Promise<any>;
  onGetRunLogs: (runId: number) => Promise<string>;
  onCancelRun: (runId: number) => Promise<void>;
  onRerunWorkflow: (runId: number) => Promise<void>;
}

const BuildHistory: React.FC<BuildHistoryProps> = ({
  workflowRuns = [],
  selectedRepository,
  onGetRunDetails,
  onGetRunLogs,
  onCancelRun,
  onRerunWorkflow,
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedRun, setSelectedRun] = useState<GitHubWorkflowRun | null>(null);
  const [runDetails, setRunDetails] = useState<any>(null);
  const [runLogs, setRunLogs] = useState<string>('');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [expandedRuns, setExpandedRuns] = useState<Set<number>>(new Set());
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Filter workflow runs
  const filteredRuns = workflowRuns.filter(run => {
    const matchesSearch = !searchQuery || 
      run.display_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.head_branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.actor.login.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      run.status === statusFilter || 
      run.conclusion === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const runDate = new Date(run.run_started_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - runDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          return daysDiff === 0;
        case 'week':
          return daysDiff <= 7;
        case 'month':
          return daysDiff <= 30;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetails = async (run: GitHubWorkflowRun) => {
    setSelectedRun(run);
    setLoadingDetails(true);
    setShowDetailsDialog(true);
    
    try {
      const details = await onGetRunDetails(run.id);
      setRunDetails(details);
    } catch (error) {
      toast({
        title: "Failed to Load Details",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewLogs = async (run: GitHubWorkflowRun) => {
    setLoadingLogs(true);
    
    try {
      const logs = await onGetRunLogs(run.id);
      setRunLogs(logs);
    } catch (error) {
      toast({
        title: "Failed to Load Logs",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoadingLogs(false);
    }
  };

  const toggleRunExpansion = (runId: number) => {
    const newExpanded = new Set(expandedRuns);
    if (newExpanded.has(runId)) {
      newExpanded.delete(runId);
    } else {
      newExpanded.add(runId);
    }
    setExpandedRuns(newExpanded);
  };

  const getStatusIcon = (status: string, conclusion?: string) => {
    if (status === 'in_progress' || status === 'queued') {
      return <Activity className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    
    switch (conclusion) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string, conclusion?: string) => {
    if (status === 'in_progress' || status === 'queued') {
      return 'bg-blue-100 text-blue-800';
    }
    
    switch (conclusion) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSuccessRate = () => {
    if (filteredRuns.length === 0) return 0;
    const successfulRuns = filteredRuns.filter(run => run.conclusion === 'success').length;
    return Math.round((successfulRuns / filteredRuns.length) * 100);
  };

  const getAverageDuration = () => {
    const completedRuns = filteredRuns.filter(run => run.status === 'completed' && run.updated_at);
    if (completedRuns.length === 0) return '0s';
    
    const totalDuration = completedRuns.reduce((sum, run) => {
      const duration = new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime();
      return sum + duration;
    }, 0);
    
    const avgDuration = Math.floor(totalDuration / completedRuns.length / 1000);
    if (avgDuration < 60) return `${avgDuration}s`;
    if (avgDuration < 3600) return `${Math.floor(avgDuration / 60)}m`;
    return `${Math.floor(avgDuration / 3600)}h ${Math.floor((avgDuration % 3600) / 60)}m`;
  };

  if (!selectedRepository) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Repository Selected</h3>
          <p className="text-gray-600">Select a repository to view build history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Build History</h2>
          <p className="text-gray-600">
            CI/CD pipeline execution history for {selectedRepository.name}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Runs</p>
                <p className="text-2xl font-bold text-gray-900">{filteredRuns.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{getSuccessRate()}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{getAverageDuration()}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Running</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredRuns.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search runs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="in_progress">Running</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Build History List */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Runs</CardTitle>
          <CardDescription>
            {filteredRuns.length} runs found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRuns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No workflow runs found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRuns.map((run) => (
                <motion.div
                  key={run.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRunExpansion(run.id)}
                          className="p-0 h-auto"
                        >
                          {expandedRuns.has(run.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        
                        {getStatusIcon(run.status, run.conclusion)}
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{run.display_title}</h4>
                            <Badge variant="outline" className="text-xs">
                              #{run.run_number}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(run.status, run.conclusion)}`}>
                              {run.conclusion || run.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center space-x-1">
                              <GitBranch className="w-3 h-3" />
                              <span>{run.head_branch}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{run.actor.login}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(run.run_started_at)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(run.run_started_at, run.updated_at)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(run)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {run.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCancelRun(run.id)}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {run.status === 'completed' && run.conclusion === 'failure' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRerunWorkflow(run.id)}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(run.html_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress bar for running builds */}
                    {run.status === 'in_progress' && (
                      <div className="mt-3">
                        <Progress value={65} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">Building...</p>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedRuns.has(run.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200 p-4 bg-gray-50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Run Information</h5>
                            <div className="space-y-1 text-gray-600">
                              <p><span className="font-medium">Workflow:</span> {run.name}</p>
                              <p><span className="font-medium">Event:</span> {run.event}</p>
                              <p><span className="font-medium">Commit:</span> {run.head_sha.substring(0, 7)}</p>
                              <p><span className="font-medium">Started:</span> {formatDate(run.run_started_at)}</p>
                              {run.updated_at && (
                                <p><span className="font-medium">Completed:</span> {formatDate(run.updated_at)}</p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Actions</h5>
                            <div className="space-y-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewLogs(run)}
                                className="w-full justify-start"
                              >
                                <Terminal className="w-4 h-4 mr-2" />
                                View Logs
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(run)}
                                className="w-full justify-start"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedRun ? `Run #${selectedRun.run_number} - ${selectedRun.display_title}` : 'Run Details'}
            </DialogTitle>
            <DialogDescription>
              Detailed information and logs for this workflow run
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Activity className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading details...</span>
                </div>
              ) : runDetails ? (
                <ScrollArea className="h-96">
                  <pre className="text-sm bg-gray-100 p-4 rounded-lg overflow-auto">
                    {JSON.stringify(runDetails, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No details available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Workflow Logs</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => selectedRun && handleViewLogs(selectedRun)}
                  disabled={loadingLogs}
                >
                  {loadingLogs ? (
                    <Activity className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {loadingLogs ? 'Loading...' : 'Refresh Logs'}
                </Button>
              </div>
              
              {loadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <Activity className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading logs...</span>
                </div>
              ) : runLogs ? (
                <ScrollArea className="h-96">
                  <pre className="text-sm bg-black text-green-400 p-4 rounded-lg font-mono">
                    {runLogs}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Terminal className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No logs available</p>
                  <p className="text-sm">Logs may not be available for this run</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuildHistory; 