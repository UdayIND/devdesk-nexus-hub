import React, { useState } from 'react';
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
  HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import FigmaIntegration from './dashboard/FigmaIntegration';
import DevMode from './dashboard/DevMode';
import DeckBoards from './dashboard/DeckBoards';
import Deck from './dashboard/Deck';
import DesignDesk from './dashboard/DesignDesk';
import Documents from './dashboard/Documents';
import Analytics from './dashboard/Analytics';
import TeamManagement from './dashboard/TeamManagement';
import Communications from './dashboard/Communications';
import ProjectManagement from './dashboard/ProjectManagement';
import Deployment from './dashboard/Deployment';
import NotificationCenter from './dashboard/NotificationCenter';
import MeetingScheduler from './dashboard/MeetingScheduler';
import VideoConference from './dashboard/VideoConference';
import FileManager from './dashboard/FileManager';
import SecuritySettings from './dashboard/SecuritySettings';
import OrganizationOverview from './dashboard/OrganizationOverview';
import BuildHistory from './dashboard/BuildHistory';
import PipelineConfiguration from './dashboard/PipelineConfiguration';
import WorkflowManager from './dashboard/WorkflowManager';
import RepositorySelector from './dashboard/RepositorySelector';
import GitHubAuth from './dashboard/GitHubAuth';
import BoardManager from './dashboard/BoardManager';

interface DashboardProps {
  user: { email: string; name?: string };
  onSignOut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const tabs = [
    // Core Features
    { id: 'analytics', name: 'Analytics', icon: BarChart3, component: Analytics },
    { id: 'team', name: 'Team Management', icon: Users, component: TeamManagement },
    { id: 'projects', name: 'Project Management', icon: Calendar, component: ProjectManagement },
    { id: 'communications', name: 'Communications', icon: MessageSquare, component: Communications },
    
    // Meeting & Collaboration
    { id: 'meetings', name: 'Meeting Scheduler', icon: Clock, component: MeetingScheduler },
    { id: 'video', name: 'Video Conference', icon: Video, component: VideoConference },
    { id: 'deck', name: 'Deck (Presentations)', icon: Presentation, component: Deck },
    { id: 'boards', name: 'Board Manager', icon: Archive, component: BoardManager },
    
    // File Management
    { id: 'documents', name: 'Documents', icon: FileText, component: Documents },
    { id: 'filemanager', name: 'File Manager', icon: FolderOpen, component: FileManager },
    
    // Development & Deployment
    { id: 'deployment', name: 'Deployment', icon: Rocket, component: Deployment },
    { id: 'devmode', name: 'Dev Mode', icon: Monitor, component: DevMode },
    { id: 'workflows', name: 'Workflow Manager', icon: Workflow, component: WorkflowManager },
    { id: 'pipelines', name: 'Pipeline Config', icon: Git, component: PipelineConfiguration },
    { id: 'builds', name: 'Build History', icon: Server, component: BuildHistory },
    { id: 'repos', name: 'Repository Selector', icon: GitBranch, component: RepositorySelector },
    { id: 'github', name: 'GitHub Integration', icon: GitBranch, component: GitHubAuth },
    
    // Design & Integration
    { id: 'figma', name: 'Figma Integration', icon: Palette, component: FigmaIntegration },
    { id: 'design', name: 'Design Desk', icon: Camera, component: DesignDesk },
    
    // Organization & Security
    { id: 'organization', name: 'Organization', icon: Building, component: OrganizationOverview },
    { id: 'security', name: 'Security Settings', icon: Shield, component: SecuritySettings },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Analytics;

  const userName = user.name || user.email.split('@')[0];

  // Mock unread notification count
  const unreadNotifications = 2;

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
            className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col z-30"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
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
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Welcome back, {userName}! 👋
                </h2>
                <p className="text-gray-600 text-sm">Ready to build something amazing?</p>
              </motion.div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                  {tab.id === 'deployment' && (
                    <Badge className="bg-green-100 text-green-800 text-xs">New</Badge>
                  )}
                </motion.button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="text-gray-500 hover:text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 relative z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects, files..."
                  className="pl-10 w-64 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 relative"
                onClick={() => setNotificationOpen(true)}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={notificationOpen} 
        onClose={() => setNotificationOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
