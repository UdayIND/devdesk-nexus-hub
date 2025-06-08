import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Users, 
  Plus, 
  Filter,
  Edit,
  Trash2,
  Search,
  MoreVertical,
  Target,
  AlertTriangle,
  TrendingUp,
  FileText,
  Settings,
  Download,
  Upload,
  Eye,
  PlayCircle,
  PauseCircle,
  StopCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  teamMembers: string[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design and improved UX',
      status: 'in-progress',
      priority: 'high',
      progress: 75,
      startDate: '2024-01-01',
      endDate: '2024-02-15',
      budget: 50000,
      spent: 37500,
      teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Alex Brown'],
      tasks: [
        { id: '1', title: 'Design mockups', description: 'Create initial design concepts', status: 'completed', assignee: 'Jane Smith', dueDate: '2024-01-15', priority: 'high' },
        { id: '2', title: 'Frontend development', description: 'Implement responsive design', status: 'in-progress', assignee: 'Mike Johnson', dueDate: '2024-02-01', priority: 'high' },
        { id: '3', title: 'Backend integration', description: 'Connect frontend with APIs', status: 'todo', assignee: 'John Doe', dueDate: '2024-02-10', priority: 'medium' }
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android platforms',
      status: 'planning',
      priority: 'medium',
      progress: 25,
      startDate: '2024-02-01',
      endDate: '2024-05-01',
      budget: 80000,
      spent: 15000,
      teamMembers: ['John Doe', 'Mike Johnson', 'Sarah Wilson', 'Alex Brown', 'Emily Davis', 'Tom Wilson', 'Lisa Chen', 'David Kim'],
      tasks: [
        { id: '4', title: 'Requirements gathering', description: 'Define app requirements and features', status: 'completed', assignee: 'John Doe', dueDate: '2024-01-30', priority: 'high' },
        { id: '5', title: 'UI/UX design', description: 'Design app interface and user experience', status: 'in-progress', assignee: 'Jane Smith', dueDate: '2024-02-15', priority: 'high' },
        { id: '6', title: 'Development setup', description: 'Set up development environment', status: 'todo', assignee: 'Mike Johnson', dueDate: '2024-02-20', priority: 'medium' }
      ],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-25'
    },
    {
      id: '3',
      name: 'API Integration',
      description: 'Integrate third-party APIs for enhanced functionality',
      status: 'in-progress',
      priority: 'medium',
      progress: 60,
      startDate: '2024-01-10',
      endDate: '2024-01-30',
      budget: 25000,
      spent: 18000,
      teamMembers: ['John Doe', 'Mike Johnson', 'Alex Brown'],
      tasks: [
        { id: '7', title: 'API documentation review', description: 'Review third-party API documentation', status: 'completed', assignee: 'John Doe', dueDate: '2024-01-15', priority: 'medium' },
        { id: '8', title: 'Integration development', description: 'Implement API integrations', status: 'in-progress', assignee: 'Mike Johnson', dueDate: '2024-01-25', priority: 'high' },
        { id: '9', title: 'Testing and validation', description: 'Test API integrations thoroughly', status: 'todo', assignee: 'Alex Brown', dueDate: '2024-01-30', priority: 'high' }
      ],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-22'
    },
    {
      id: '4',
      name: 'User Research Study',
      description: 'Comprehensive user research to improve product experience',
      status: 'completed',
      priority: 'low',
      progress: 100,
      startDate: '2023-12-01',
      endDate: '2024-01-15',
      budget: 15000,
      spent: 14500,
      teamMembers: ['Jane Smith', 'Sarah Wilson', 'Emily Davis', 'Lisa Chen'],
      tasks: [
        { id: '10', title: 'Survey design', description: 'Create user survey questions', status: 'completed', assignee: 'Jane Smith', dueDate: '2023-12-10', priority: 'medium' },
        { id: '11', title: 'Data collection', description: 'Collect user feedback and data', status: 'completed', assignee: 'Sarah Wilson', dueDate: '2024-01-05', priority: 'high' },
        { id: '12', title: 'Analysis and reporting', description: 'Analyze data and create report', status: 'completed', assignee: 'Emily Davis', dueDate: '2024-01-15', priority: 'high' }
      ],
      createdAt: '2023-12-01',
      updatedAt: '2024-01-15'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    startDate: '',
    endDate: '',
    budget: 0,
    teamMembers: [] as string[]
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return Clock;
      case 'in-progress': return PlayCircle;
      case 'review': return Eye;
      case 'completed': return CheckCircle;
      case 'on-hold': return PauseCircle;
      default: return Clock;
    }
  };

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.description) {
      toast.error('Project name and description are required');
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      ...newProject,
      progress: 0,
      spent: 0,
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prev => [...prev, project]);
    setNewProject({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: 0,
      teamMembers: []
    });
    setIsCreateDialogOpen(false);
    toast.success('Project created successfully');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      teamMembers: project.teamMembers
    });
  };

  const handleUpdateProject = () => {
    if (!editingProject) return;

    setProjects(prev => prev.map(project => 
      project.id === editingProject.id 
        ? { ...project, ...newProject, updatedAt: new Date().toISOString() }
        : project
    ));
    
    setEditingProject(null);
    setNewProject({
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: 0,
      teamMembers: []
    });
    toast.success('Project updated successfully');
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    toast.success('Project deleted successfully');
  };

  const handleStatusChange = (projectId: string, newStatus: Project['status']) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status: newStatus, updatedAt: new Date().toISOString() }
        : project
    ));
    toast.success('Project status updated');
  };

  const exportProjectData = () => {
    const csvContent = [
      ['Name', 'Status', 'Priority', 'Progress', 'Budget', 'Spent', 'Team Size', 'Start Date', 'End Date'],
      ...projects.map(project => [
        project.name,
        project.status,
        project.priority,
        `${project.progress}%`,
        `$${project.budget}`,
        `$${project.spent}`,
        project.teamMembers.length.toString(),
        project.startDate,
        project.endDate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Project data exported successfully');
  };

  const stats = {
    active: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    overdue: projects.filter(p => new Date(p.endDate) < new Date() && p.status !== 'completed').length,
    totalMembers: new Set(projects.flatMap(p => p.teamMembers)).size
  };

  return (
    <div className="p-6 bg-gray-50 h-full overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track projects, tasks, and deadlines
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportProjectData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Add a new project to your workspace
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        value={newProject.name}
                        onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter project name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter project description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newProject.priority} onValueChange={(value: Project['priority']) => setNewProject(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="budget">Budget ($)</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={newProject.budget}
                          onChange={(e) => setNewProject(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newProject.startDate}
                          onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newProject.endDate}
                          onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateProject}>
                        Create Project
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Projects ({filteredProjects.length})</CardTitle>
            <CardDescription>
              Manage your projects and track their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {filteredProjects.map((project) => {
                  const StatusIcon = getStatusIcon(project.status);
                  const isOverdue = new Date(project.endDate) < new Date() && project.status !== 'completed';
                  
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <StatusIcon className="w-5 h-5 text-gray-500" />
                            <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                            {isOverdue && (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status.replace('-', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(project.priority)}>
                              {project.priority}
                            </Badge>
                            <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
                            <span>{project.teamMembers.length} members</span>
                            <span>Budget: ${project.budget.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right mr-4">
                            <div className="text-sm font-medium text-gray-900">{project.progress}%</div>
                            <Progress value={project.progress} className="w-24 mt-1" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedProject(project)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditProject(project)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteProject(project.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {/* Quick Status Actions */}
                      <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500 mr-2">Quick actions:</span>
                        {project.status !== 'in-progress' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleStatusChange(project.id, 'in-progress')}
                          >
                            <PlayCircle className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {project.status === 'in-progress' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleStatusChange(project.id, 'on-hold')}
                          >
                            <PauseCircle className="w-3 h-3 mr-1" />
                            Pause
                          </Button>
                        )}
                        {project.status !== 'completed' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleStatusChange(project.id, 'completed')}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Edit Project Dialog */}
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Project Name</Label>
                <Input
                  id="edit-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={newProject.priority} onValueChange={(value: Project['priority']) => setNewProject(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-budget">Budget ($)</Label>
                  <Input
                    id="edit-budget"
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingProject(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProject}>
                  Update Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Project Details Dialog */}
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProject?.name}</DialogTitle>
              <DialogDescription>
                Project details and tasks
              </DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {selectedProject.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge className={getPriorityColor(selectedProject.priority)}>
                      {selectedProject.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label>Progress</Label>
                    <div className="flex items-center space-x-2">
                      <Progress value={selectedProject.progress} className="flex-1" />
                      <span className="text-sm">{selectedProject.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <Label>Budget</Label>
                    <p className="text-sm">${selectedProject.budget.toLocaleString()} (${selectedProject.spent.toLocaleString()} spent)</p>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-gray-600">{selectedProject.description}</p>
                </div>
                <div>
                  <Label>Team Members ({selectedProject.teamMembers.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProject.teamMembers.map((member, index) => (
                      <Badge key={index} variant="outline">{member}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Tasks ({selectedProject.tasks.length})</Label>
                  <div className="space-y-2 mt-2">
                    {selectedProject.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.assignee} • Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectManagement; 