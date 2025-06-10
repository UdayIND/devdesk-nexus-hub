import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  GitBranch, 
  Presentation, 
  Video, 
  FileText, 
  Settings,
  Bell,
  Search,
  User,
  LogOut,
  Menu,
  X,
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar,
  Plus,
  ChevronDown,
  Server,
  Rocket,
  Monitor,
  Shield,
  FolderOpen,
  Building,
  Camera,
  Workflow,
  GitBranch as Git,
  Clock,
  Archive,
  HardDrive,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Lazy load dashboard components for better performance
const FigmaIntegration = lazy(() => import('./dashboard/FigmaIntegration'));
const DevMode = lazy(() => import('./dashboard/DevMode'));
const DeckBoards = lazy(() => import('./dashboard/DeckBoards'));
const Deck = lazy(() => import('./dashboard/Deck'));
const DesignDesk = lazy(() => import('./dashboard/DesignDesk'));
const Documents = lazy(() => import('./dashboard/Documents'));
const Analytics = lazy(() => import('./dashboard/Analytics'));
const TeamManagement = lazy(() => import('./dashboard/TeamManagement'));
const Communications = lazy(() => import('./dashboard/Communications'));
const ProjectManagement = lazy(() => import('./dashboard/ProjectManagement'));
const Deployment = lazy(() => import('./dashboard/Deployment'));
const NotificationCenter = lazy(() => import('./dashboard/NotificationCenter'));
const MeetingScheduler = lazy(() => import('./dashboard/MeetingScheduler'));
const VideoConference = lazy(() => import('./dashboard/VideoConference'));
const FileManager = lazy(() => import('./dashboard/FileManager'));
const SecuritySettings = lazy(() => import('./dashboard/SecuritySettings'));
const OrganizationOverview = lazy(() => import('./dashboard/OrganizationOverview'));
const BuildHistory = lazy(() => import('./dashboard/BuildHistory'));
const PipelineConfiguration = lazy(() => import('./dashboard/PipelineConfiguration'));
const WorkflowManager = lazy(() => import('./dashboard/WorkflowManager'));
const RepositorySelector = lazy(() => import('./dashboard/RepositorySelector'));
const GitHubAuth = lazy(() => import('./dashboard/GitHubAuth'));
const BoardManager = lazy(() => import('./dashboard/BoardManager'));

interface DashboardProps {
  user: { 
    id: string;
    email: string; 
    name?: string;
    avatar?: string;
    role?: string;
  };
  onSignOut: () => void;
}

// Loading fallback component
const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">We're having trouble loading this component.</p>
            <Button onClick={() => this.setState({ hasError: false })} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    // Core Features
    { 
      id: 'analytics', 
      name: 'Analytics', 
      icon: BarChart3, 
      component: Analytics,
      description: 'Project insights and metrics'
    },
    { 
      id: 'team', 
      name: 'Team Management', 
      icon: Users, 
      component: TeamManagement,
      description: 'Manage team members and roles'
    },
    { 
      id: 'projects', 
      name: 'Project Management', 
      icon: Calendar, 
      component: ProjectManagement,
      description: 'Track and manage projects'
    },
    { 
      id: 'communications', 
      name: 'Communications', 
      icon: MessageSquare, 
      component: Communications,
      description: 'Team chat and messaging'
    },
    
    // Meeting & Collaboration
    { 
      id: 'meetings', 
      name: 'Meeting Scheduler', 
      icon: Clock, 
      component: MeetingScheduler,
      description: 'Schedule and manage meetings'
    },
    { 
      id: 'video', 
      name: 'Video Conference', 
      icon: Video, 
      component: VideoConference,
      description: 'Host video calls and conferences'
    },
    { 
      id: 'deck', 
      name: 'Deck (Presentations)', 
      icon: Presentation, 
      component: Deck,
      description: 'Create and share presentations'
    },
    { 
      id: 'boards', 
      name: 'Board Manager', 
      icon: Archive, 
      component: BoardManager,
      description: 'Kanban boards and task management'
    },
    
    // File Management
    { 
      id: 'documents', 
      name: 'Documents', 
      icon: FileText, 
      component: Documents,
      description: 'Document storage and collaboration'
    },
    { 
      id: 'filemanager', 
      name: 'File Manager', 
      icon: FolderOpen, 
      component: FileManager,
      description: 'File and asset management'
    },
    
    // Development & Deployment
    { 
      id: 'deployment', 
      name: 'Deployment', 
      icon: Rocket, 
      component: Deployment,
      description: 'Deploy and manage applications',
      badge: 'New'
    },
    { 
      id: 'devmode', 
      name: 'Dev Mode', 
      icon: Monitor, 
      component: DevMode,
      description: 'Development tools and CI/CD'
    },
    { 
      id: 'workflows', 
      name: 'Workflow Manager', 
      icon: Workflow, 
      component: WorkflowManager,
      description: 'Automate development workflows'
    },
    { 
      id: 'pipelines', 
      name: 'Pipeline Config', 
      icon: Git, 
      component: PipelineConfiguration,
      description: 'CI/CD pipeline configuration'
    },
    { 
      id: 'builds', 
      name: 'Build History', 
      icon: Server, 
      component: BuildHistory,
      description: 'View build logs and history'
    },
    { 
      id: 'repos', 
      name: 'Repository Selector', 
      icon: GitBranch, 
      component: RepositorySelector,
      description: 'Manage code repositories'
    },
    { 
      id: 'github', 
      name: 'GitHub Integration', 
      icon: GitBranch, 
      component: GitHubAuth,
      description: 'Connect with GitHub'
    },
    
    // Design & Integration
    { 
      id: 'figma', 
      name: 'Figma Integration', 
      icon: Palette, 
      component: FigmaIntegration,
      description: 'Design collaboration with Figma'
    },
    { 
      id: 'design', 
      name: 'Design Desk', 
      icon: Camera, 
      component: DesignDesk,
      description: 'Design tools and assets'
    },
    
    // Organization & Security
    { 
      id: 'organization', 
      name: 'Organization', 
      icon: Building, 
      component: OrganizationOverview,
      description: 'Organization settings and overview'
    },
    { 
      id: 'security', 
      name: 'Security Settings', 
      icon: Shield, 
      component: SecuritySettings,
      description: 'Security and access controls'
    },
  ];

  // Filter tabs based on search query
  const filteredTabs = tabs.filter(tab => 
    tab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component || Analytics;

  const userName = user.name || user.email.split('@')[0];
  const userAvatar = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;

  // Mock unread notification count
  const unreadNotifications = 2;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Clear search when switching tabs
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col z-30 max-h-screen overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DevDesk Nexus Hub
                </h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Welcome back, {userName}! 👋
                </h2>
                <p className="text-gray-600 text-sm">Ready to build something amazing?</p>
              </motion.div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search features..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {filteredTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={tab.description}
                >
                  <tab.icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">{tab.name}</span>
                    <span className="text-xs text-gray-500 block truncate">{tab.description}</span>
                  </div>
                  {tab.badge && (
                    <Badge className="bg-green-100 text-green-800 text-xs">{tab.badge}</Badge>
                  )}
                </motion.button>
              ))}
              
              {filteredTabs.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No features found matching "{searchQuery}"</p>
                </div>
              )}
            </nav>

            {/* User Menu */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  {user.role && (
                    <Badge variant="outline" className="text-xs mt-1">{user.role}</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="text-gray-500 hover:text-red-500"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTabData?.name || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-500">
                {activeTabData?.description || 'Welcome to your development hub'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback message={`Loading ${activeTabData?.name || 'component'}...`} />}>
              <ActiveComponent />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {notificationOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl border-l border-gray-200 z-40"
          >
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback message="Loading notifications..." />}>
                <NotificationCenter onClose={() => setNotificationOpen(false)} />
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
