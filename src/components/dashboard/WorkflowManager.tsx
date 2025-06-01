import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Settings, 
  Clock, 
  GitBranch, 
  Code, 
  Calendar,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { GitHubWorkflow, GitHubBranch, GitHubRepository } from '@/lib/github-api';

interface WorkflowManagerProps {
  workflows?: GitHubWorkflow[];
  branches?: GitHubBranch[];
  selectedRepository?: GitHubRepository | null;
  onTriggerWorkflow: (workflowId: number, ref: string, inputs?: Record<string, any>) => Promise<void>;
  isTriggeringWorkflow?: boolean;
}

interface WorkflowInputs {
  [key: string]: string;
}

const WorkflowManager: React.FC<WorkflowManagerProps> = ({
  workflows = [],
  branches = [],
  selectedRepository,
  onTriggerWorkflow,
  isTriggeringWorkflow = false,
}) => {
  const { toast } = useToast();
  const [selectedWorkflow, setSelectedWorkflow] = useState<GitHubWorkflow | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [workflowInputs, setWorkflowInputs] = useState<WorkflowInputs>({});
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);

  const handleTriggerWorkflow = async () => {
    if (!selectedWorkflow || !selectedBranch) {
      toast({
        title: "Missing Information",
        description: "Please select a workflow and branch",
        variant: "destructive",
      });
      return;
    }

    try {
      await onTriggerWorkflow(selectedWorkflow.id, selectedBranch, workflowInputs);
      setShowTriggerDialog(false);
      setWorkflowInputs({});
      toast({
        title: "Workflow Triggered",
        description: `Successfully triggered ${selectedWorkflow.name} on ${selectedBranch}`,
      });
    } catch (error) {
      toast({
        title: "Failed to Trigger Workflow",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const getWorkflowStatusColor = (state: string) => {
    switch (state) {
      case 'active':
        return 'bg-green-500';
      case 'disabled_manually':
        return 'bg-yellow-500';
      case 'disabled_inactivity':
        return 'bg-gray-500';
      default:
        return 'bg-red-500';
    }
  };

  const getWorkflowStatusIcon = (state: string) => {
    switch (state) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disabled_manually':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'disabled_inactivity':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
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

  if (!selectedRepository) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Repository Selected</h3>
          <p className="text-gray-600">Select a repository to view and manage workflows</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Management</h2>
          <p className="text-gray-600">
            Manage and trigger GitHub Actions workflows for {selectedRepository.name}
          </p>
        </div>
        
        <Dialog open={showTriggerDialog} onOpenChange={setShowTriggerDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Trigger Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Trigger Workflow</DialogTitle>
              <DialogDescription>
                Select a workflow and branch to trigger a new run
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow">Workflow</Label>
                <Select 
                  value={selectedWorkflow?.id.toString() || ''} 
                  onValueChange={(value) => {
                    const workflow = workflows.find(w => w.id.toString() === value);
                    setSelectedWorkflow(workflow || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows.filter(w => w.state === 'active').map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <span>{workflow.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {workflow.state}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.name} value={branch.name}>
                        <div className="flex items-center space-x-2">
                          <GitBranch className="w-3 h-3" />
                          <span>{branch.name}</span>
                          {branch.protected && (
                            <Badge variant="outline" className="text-xs">
                              Protected
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Workflow Inputs */}
              <div className="space-y-2">
                <Label>Workflow Inputs (Optional)</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="Input name"
                    value={Object.keys(workflowInputs)[0] || ''}
                    onChange={(e) => {
                      const newInputs = { ...workflowInputs };
                      const oldKey = Object.keys(newInputs)[0];
                      if (oldKey) {
                        const value = newInputs[oldKey];
                        delete newInputs[oldKey];
                        newInputs[e.target.value] = value;
                      } else {
                        newInputs[e.target.value] = '';
                      }
                      setWorkflowInputs(newInputs);
                    }}
                  />
                  <Textarea
                    placeholder="Input value"
                    value={Object.values(workflowInputs)[0] || ''}
                    onChange={(e) => {
                      const key = Object.keys(workflowInputs)[0];
                      if (key) {
                        setWorkflowInputs({ ...workflowInputs, [key]: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTriggerDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleTriggerWorkflow}
                  disabled={!selectedWorkflow || !selectedBranch || isTriggeringWorkflow}
                >
                  {isTriggeringWorkflow ? (
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Trigger
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflows Grid */}
      {workflows.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workflows Found</h3>
            <p className="text-gray-600 mb-4">
              This repository doesn't have any GitHub Actions workflows configured.
            </p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{workflow.name}</CardTitle>
                      <CardDescription className="truncate">
                        {workflow.path}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getWorkflowStatusIcon(workflow.state)}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getWorkflowStatusColor(workflow.state)}`}
                      >
                        {workflow.state.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDate(workflow.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Updated {formatDate(workflow.updated_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedWorkflow(workflow);
                        setSelectedBranch(selectedRepository.default_branch);
                        setShowTriggerDialog(true);
                      }}
                      disabled={workflow.state !== 'active'}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Trigger
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(workflow.html_url, '_blank')}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>

                  {workflow.badge_url && (
                    <div className="pt-2 border-t border-gray-200">
                      <img 
                        src={workflow.badge_url} 
                        alt={`${workflow.name} status`}
                        className="h-5"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common workflow management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Plus className="w-6 h-6" />
              <span>Create Workflow</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Settings className="w-6 h-6" />
              <span>Workflow Settings</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Activity className="w-6 h-6" />
              <span>View All Runs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowManager; 