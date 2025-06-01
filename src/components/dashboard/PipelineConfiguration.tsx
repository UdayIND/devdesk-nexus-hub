import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff, 
  Code, 
  Key,
  GitBranch,
  Clock,
  AlertTriangle,
  CheckCircle,
  Copy,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { GitHubRepository, GitHubWorkflow, GitHubBranch } from '@/lib/github-api';

interface PipelineConfigurationProps {
  selectedRepository?: GitHubRepository | null;
  workflows?: GitHubWorkflow[];
  branches?: GitHubBranch[];
}

interface EnvironmentVariable {
  id: string;
  name: string;
  value: string;
  isSecret: boolean;
  description?: string;
}

interface BuildScript {
  id: string;
  name: string;
  script: string;
  stage: 'build' | 'test' | 'deploy';
  enabled: boolean;
}

interface PipelineConfig {
  name: string;
  description: string;
  triggers: {
    push: boolean;
    pullRequest: boolean;
    schedule?: string;
    manual: boolean;
  };
  environmentVariables: EnvironmentVariable[];
  buildScripts: BuildScript[];
  notifications: {
    email: boolean;
    slack: boolean;
    webhooks: string[];
  };
}

const PipelineConfiguration: React.FC<PipelineConfigurationProps> = ({
  selectedRepository,
  workflows = [],
  branches = [],
}) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<PipelineConfig>({
    name: '',
    description: '',
    triggers: {
      push: true,
      pullRequest: true,
      manual: true,
    },
    environmentVariables: [],
    buildScripts: [],
    notifications: {
      email: true,
      slack: false,
      webhooks: [],
    },
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('general');

  const addEnvironmentVariable = () => {
    const newVar: EnvironmentVariable = {
      id: Date.now().toString(),
      name: '',
      value: '',
      isSecret: false,
    };
    setConfig(prev => ({
      ...prev,
      environmentVariables: [...prev.environmentVariables, newVar],
    }));
  };

  const updateEnvironmentVariable = (id: string, updates: Partial<EnvironmentVariable>) => {
    setConfig(prev => ({
      ...prev,
      environmentVariables: prev.environmentVariables.map(env =>
        env.id === id ? { ...env, ...updates } : env
      ),
    }));
  };

  const removeEnvironmentVariable = (id: string) => {
    setConfig(prev => ({
      ...prev,
      environmentVariables: prev.environmentVariables.filter(env => env.id !== id),
    }));
  };

  const addBuildScript = () => {
    const newScript: BuildScript = {
      id: Date.now().toString(),
      name: '',
      script: '',
      stage: 'build',
      enabled: true,
    };
    setConfig(prev => ({
      ...prev,
      buildScripts: [...prev.buildScripts, newScript],
    }));
  };

  const updateBuildScript = (id: string, updates: Partial<BuildScript>) => {
    setConfig(prev => ({
      ...prev,
      buildScripts: prev.buildScripts.map(script =>
        script.id === id ? { ...script, ...updates } : script
      ),
    }));
  };

  const removeBuildScript = (id: string) => {
    setConfig(prev => ({
      ...prev,
      buildScripts: prev.buildScripts.filter(script => script.id !== id),
    }));
  };

  const saveConfiguration = async () => {
    try {
      // Validate configuration
      if (!config.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Pipeline name is required",
          variant: "destructive",
        });
        return;
      }

      // Here you would save to your backend
      console.log('Saving configuration:', config);
      
      toast({
        title: "Configuration Saved",
        description: "Pipeline configuration has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'build':
        return 'bg-blue-100 text-blue-800';
      case 'test':
        return 'bg-green-100 text-green-800';
      case 'deploy':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedRepository) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Repository Selected</h3>
          <p className="text-gray-600">Select a repository to configure CI/CD pipelines</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pipeline Configuration</h2>
          <p className="text-gray-600">
            Configure CI/CD pipelines for {selectedRepository.name}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Code className="w-4 h-4 mr-2" />
            View YAML
          </Button>
          <Button onClick={saveConfiguration} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="scripts">Build Scripts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
              <CardDescription>
                Set up basic pipeline information and triggers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Pipeline Name</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter pipeline name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter pipeline description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Triggers</CardTitle>
              <CardDescription>
                Configure when the pipeline should run
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push to Repository</Label>
                    <p className="text-sm text-gray-500">
                      Trigger pipeline on code pushes
                    </p>
                  </div>
                  <Switch
                    checked={config.triggers.push}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        triggers: { ...prev.triggers, push: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Pull Requests</Label>
                    <p className="text-sm text-gray-500">
                      Trigger pipeline on pull request events
                    </p>
                  </div>
                  <Switch
                    checked={config.triggers.pullRequest}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        triggers: { ...prev.triggers, pullRequest: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Manual Trigger</Label>
                    <p className="text-sm text-gray-500">
                      Allow manual pipeline execution
                    </p>
                  </div>
                  <Switch
                    checked={config.triggers.manual}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        triggers: { ...prev.triggers, manual: checked },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule (Optional)</Label>
                  <Input
                    id="schedule"
                    value={config.triggers.schedule || ''}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        triggers: { ...prev.triggers, schedule: e.target.value },
                      }))
                    }
                    placeholder="0 2 * * * (cron format)"
                  />
                  <p className="text-xs text-gray-500">
                    Use cron format for scheduled runs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>
                    Configure environment variables and secrets for your pipeline
                  </CardDescription>
                </div>
                <Button onClick={addEnvironmentVariable} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {config.environmentVariables.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Key className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No environment variables configured</p>
                  <p className="text-sm">Add variables to configure your build environment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {config.environmentVariables.map((env) => (
                    <motion.div
                      key={env.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={env.isSecret ? "destructive" : "outline"}>
                            {env.isSecret ? "Secret" : "Variable"}
                          </Badge>
                          <Switch
                            checked={env.isSecret}
                            onCheckedChange={(checked) =>
                              updateEnvironmentVariable(env.id, { isSecret: checked })
                            }
                          />
                          <span className="text-sm text-gray-500">Secret</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEnvironmentVariable(env.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Name</Label>
                          <Input
                            value={env.name}
                            onChange={(e) =>
                              updateEnvironmentVariable(env.id, { name: e.target.value })
                            }
                            placeholder="VARIABLE_NAME"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label>Value</Label>
                          <div className="relative">
                            <Input
                              type={env.isSecret && !showSecrets[env.id] ? "password" : "text"}
                              value={env.value}
                              onChange={(e) =>
                                updateEnvironmentVariable(env.id, { value: e.target.value })
                              }
                              placeholder="Variable value"
                            />
                            {env.isSecret && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-6 w-6 p-0"
                                onClick={() =>
                                  setShowSecrets(prev => ({
                                    ...prev,
                                    [env.id]: !prev[env.id],
                                  }))
                                }
                              >
                                {showSecrets[env.id] ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label>Description (Optional)</Label>
                        <Input
                          value={env.description || ''}
                          onChange={(e) =>
                            updateEnvironmentVariable(env.id, { description: e.target.value })
                          }
                          placeholder="Describe what this variable is used for"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Build Scripts</CardTitle>
                  <CardDescription>
                    Configure build, test, and deployment scripts
                  </CardDescription>
                </div>
                <Button onClick={addBuildScript} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Script
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {config.buildScripts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No build scripts configured</p>
                  <p className="text-sm">Add scripts to define your build process</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {config.buildScripts.map((script) => (
                    <motion.div
                      key={script.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStageColor(script.stage)}>
                            {script.stage}
                          </Badge>
                          <Switch
                            checked={script.enabled}
                            onCheckedChange={(checked) =>
                              updateBuildScript(script.id, { enabled: checked })
                            }
                          />
                          <span className="text-sm text-gray-500">Enabled</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBuildScript(script.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Script Name</Label>
                          <Input
                            value={script.name}
                            onChange={(e) =>
                              updateBuildScript(script.id, { name: e.target.value })
                            }
                            placeholder="Script name"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label>Stage</Label>
                          <Select
                            value={script.stage}
                            onValueChange={(value: any) =>
                              updateBuildScript(script.id, { stage: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="build">Build</SelectItem>
                              <SelectItem value="test">Test</SelectItem>
                              <SelectItem value="deploy">Deploy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label>Script</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(script.script)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <Textarea
                          value={script.script}
                          onChange={(e) =>
                            updateBuildScript(script.id, { script: e.target.value })
                          }
                          placeholder="#!/bin/bash&#10;npm install&#10;npm run build"
                          className="font-mono text-sm"
                          rows={6}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you want to be notified about pipeline results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive email notifications for pipeline results
                    </p>
                  </div>
                  <Switch
                    checked={config.notifications.email}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Send notifications to Slack channels
                    </p>
                  </div>
                  <Switch
                    checked={config.notifications.slack}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, slack: checked },
                      }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Webhook URLs</Label>
                <div className="space-y-2">
                  {config.notifications.webhooks.map((webhook, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={webhook}
                        onChange={(e) => {
                          const newWebhooks = [...config.notifications.webhooks];
                          newWebhooks[index] = e.target.value;
                          setConfig(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, webhooks: newWebhooks },
                          }));
                        }}
                        placeholder="https://hooks.slack.com/..."
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newWebhooks = config.notifications.webhooks.filter((_, i) => i !== index);
                          setConfig(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, webhooks: newWebhooks },
                          }));
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setConfig(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          webhooks: [...prev.notifications.webhooks, ''],
                        },
                      }))
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Webhook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PipelineConfiguration; 