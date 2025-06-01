import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Key, 
  Users, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Globe,
  Webhook,
  UserCheck,
  UserX,
  Activity,
  FileText,
  Calendar,
  MapPin
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { GitHubRepository, GitHubOrganization } from '@/lib/github-api';

interface SecuritySettingsProps {
  selectedRepository?: GitHubRepository | null;
  selectedOrganization?: GitHubOrganization | null;
}

interface SecurityRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isDefault: boolean;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  lastDelivery?: string;
  deliveryStatus?: 'success' | 'failure';
}

interface SecretConfig {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  scope: 'repository' | 'organization' | 'environment';
  environment?: string;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  selectedRepository,
  selectedOrganization,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [showCreateWebhookDialog, setShowCreateWebhookDialog] = useState(false);
  const [showCreateSecretDialog, setShowCreateSecretDialog] = useState(false);

  // Mock data - in a real app, this would come from APIs
  const [securityRoles] = useState<SecurityRole[]>([
    {
      id: '1',
      name: 'Admin',
      description: 'Full access to all resources and settings',
      permissions: ['read', 'write', 'admin', 'delete'],
      userCount: 3,
      isDefault: false,
    },
    {
      id: '2',
      name: 'Developer',
      description: 'Can read and write code, trigger workflows',
      permissions: ['read', 'write', 'workflow:trigger'],
      userCount: 12,
      isDefault: true,
    },
    {
      id: '3',
      name: 'Viewer',
      description: 'Read-only access to repositories and workflows',
      permissions: ['read'],
      userCount: 8,
      isDefault: false,
    },
  ]);

  const [auditLogs] = useState<AuditLogEntry[]>([
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'john.doe',
      action: 'workflow.trigger',
      resource: 'main-ci-cd',
      details: 'Triggered workflow on main branch',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      status: 'success',
    },
    {
      id: '2',
      timestamp: '2024-01-15T09:45:00Z',
      user: 'jane.smith',
      action: 'secret.create',
      resource: 'API_KEY',
      details: 'Created new secret for production environment',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      status: 'success',
    },
    {
      id: '3',
      timestamp: '2024-01-15T09:15:00Z',
      user: 'unknown',
      action: 'auth.failed',
      resource: 'oauth',
      details: 'Failed authentication attempt',
      ipAddress: '203.0.113.1',
      userAgent: 'curl/7.68.0',
      status: 'failure',
    },
  ]);

  const [webhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/...',
      events: ['push', 'pull_request', 'workflow_run'],
      secret: '••••••••••••••••',
      active: true,
      lastDelivery: '2024-01-15T10:30:00Z',
      deliveryStatus: 'success',
    },
    {
      id: '2',
      name: 'CI/CD Pipeline',
      url: 'https://api.example.com/webhooks/github',
      events: ['push', 'workflow_run'],
      secret: '••••••••••••••••',
      active: true,
      lastDelivery: '2024-01-15T10:25:00Z',
      deliveryStatus: 'failure',
    },
  ]);

  const [secrets] = useState<SecretConfig[]>([
    {
      id: '1',
      name: 'DATABASE_URL',
      description: 'Production database connection string',
      lastUpdated: '2024-01-10T14:30:00Z',
      scope: 'repository',
    },
    {
      id: '2',
      name: 'API_KEY',
      description: 'Third-party service API key',
      lastUpdated: '2024-01-12T09:15:00Z',
      scope: 'organization',
    },
    {
      id: '3',
      name: 'DEPLOY_TOKEN',
      description: 'Deployment service token',
      lastUpdated: '2024-01-14T16:45:00Z',
      scope: 'environment',
      environment: 'production',
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = !searchQuery || 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || log.status === filterType;
    
    return matchesSearch && matchesFilter;
  });

  if (!selectedRepository && !selectedOrganization) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Repository or Organization Selected</h3>
          <p className="text-gray-600">Select a repository or organization to manage security settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
          <p className="text-gray-600">
            Manage security and access control for {selectedRepository?.name || selectedOrganization?.name}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Audit Log
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="secrets">Secrets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Security Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Security Score</p>
                    <p className="text-2xl font-bold text-gray-900">85%</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">23</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Webhooks</p>
                    <p className="text-2xl font-bold text-gray-900">{webhooks.length}</p>
                  </div>
                  <Webhook className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Secrets</p>
                    <p className="text-2xl font-bold text-gray-900">{secrets.length}</p>
                  </div>
                  <Key className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
              <CardDescription>
                Improve your security posture with these recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Enable Two-Factor Authentication</h4>
                    <p className="text-sm text-yellow-700">
                      Require 2FA for all organization members to enhance account security.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Review Branch Protection Rules</h4>
                    <p className="text-sm text-blue-700">
                      Ensure main branches have appropriate protection rules enabled.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Webhook Security Configured</h4>
                    <p className="text-sm text-green-700">
                      All webhooks are properly secured with secret validation.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Latest security-related activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.user} • {formatDate(log.timestamp)}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(log.status)}`}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Roles & Permissions</CardTitle>
                  <CardDescription>
                    Manage user roles and their permissions
                  </CardDescription>
                </div>
                <Dialog open={showCreateRoleDialog} onOpenChange={setShowCreateRoleDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                      <DialogDescription>
                        Define a new role with specific permissions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="roleName">Role Name</Label>
                        <Input id="roleName" placeholder="Enter role name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="roleDescription">Description</Label>
                        <Textarea id="roleDescription" placeholder="Describe the role" />
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="space-y-2">
                          {['read', 'write', 'admin', 'delete', 'workflow:trigger'].map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Switch id={permission} />
                              <Label htmlFor={permission}>{permission}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowCreateRoleDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setShowCreateRoleDialog(false)}>
                          Create Role
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityRoles.map((role) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{role.name}</h4>
                          {role.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{role.userCount} users</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Key className="w-3 h-3" />
                            <span>{role.permissions.length} permissions</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {role.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!role.isDefault && (
                          <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search audit logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                {filteredAuditLogs.length} events found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status)}
                            <Badge className={`text-xs ${getStatusColor(log.status)}`}>
                              {log.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell className="font-medium">{log.user}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.resource}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {log.ipAddress}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhook Configuration</CardTitle>
                  <CardDescription>
                    Manage webhook endpoints and security
                  </CardDescription>
                </div>
                <Dialog open={showCreateWebhookDialog} onOpenChange={setShowCreateWebhookDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Webhook</DialogTitle>
                      <DialogDescription>
                        Configure a new webhook endpoint
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhookName">Name</Label>
                        <Input id="webhookName" placeholder="Webhook name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webhookUrl">URL</Label>
                        <Input id="webhookUrl" placeholder="https://example.com/webhook" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="webhookSecret">Secret</Label>
                        <Input id="webhookSecret" type="password" placeholder="Webhook secret" />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowCreateWebhookDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setShowCreateWebhookDialog(false)}>
                          Create Webhook
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <motion.div
                    key={webhook.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{webhook.name}</h4>
                          <Badge variant={webhook.active ? "default" : "secondary"}>
                            {webhook.active ? 'Active' : 'Inactive'}
                          </Badge>
                          {webhook.deliveryStatus && (
                            <Badge className={`text-xs ${getStatusColor(webhook.deliveryStatus)}`}>
                              {webhook.deliveryStatus}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{webhook.url}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Activity className="w-3 h-3" />
                            <span>{webhook.events.length} events</span>
                          </span>
                          {webhook.lastDelivery && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Last: {formatDate(webhook.lastDelivery)}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="secrets" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Secret Management</CardTitle>
                  <CardDescription>
                    Manage environment variables and secrets
                  </CardDescription>
                </div>
                <Dialog open={showCreateSecretDialog} onOpenChange={setShowCreateSecretDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Secret
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Secret</DialogTitle>
                      <DialogDescription>
                        Add a new secret or environment variable
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="secretName">Name</Label>
                        <Input id="secretName" placeholder="SECRET_NAME" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secretValue">Value</Label>
                        <Textarea id="secretValue" placeholder="Secret value" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secretDescription">Description</Label>
                        <Input id="secretDescription" placeholder="What this secret is used for" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secretScope">Scope</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select scope" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="repository">Repository</SelectItem>
                            <SelectItem value="organization">Organization</SelectItem>
                            <SelectItem value="environment">Environment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowCreateSecretDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setShowCreateSecretDialog(false)}>
                          Create Secret
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {secrets.map((secret) => (
                  <motion.div
                    key={secret.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{secret.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {secret.scope}
                          </Badge>
                          {secret.environment && (
                            <Badge variant="outline" className="text-xs">
                              {secret.environment}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{secret.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Updated {formatDate(secret.lastUpdated)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings; 