import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  GitBranch, 
  Server, 
  Database, 
  Globe, 
  Clock,
  ExternalLink,
  Settings,
  Trash2,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: 'deployment' | 'cicd' | 'uptime' | 'security' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: 'vercel' | 'render' | 'supabase' | 'github' | 'uptimerobot' | 'system';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'deployment',
      title: 'Deployment Successful',
      message: 'Frontend deployed to Vercel successfully. Build time: 2m 34s',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
      priority: 'medium',
      source: 'vercel',
      actionUrl: 'https://devdesk-nexus.vercel.app',
      metadata: { buildTime: '2m 34s', commit: 'feat: add deployment dashboard' }
    },
    {
      id: '2',
      type: 'cicd',
      title: 'CI/CD Pipeline Running',
      message: 'Backend deployment pipeline started. Estimated completion: 3 minutes',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      priority: 'low',
      source: 'github',
      metadata: { branch: 'main', pipeline: 'backend-deploy' }
    },
    {
      id: '3',
      type: 'uptime',
      title: 'Service Restored',
      message: 'Backend API is now operational. Downtime: 2 minutes',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: true,
      priority: 'high',
      source: 'uptimerobot',
      metadata: { downtime: '2 minutes', service: 'Backend API' }
    },
    {
      id: '4',
      type: 'security',
      title: 'Security Scan Complete',
      message: 'No vulnerabilities found in latest deployment',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      priority: 'medium',
      source: 'system',
      metadata: { vulnerabilities: 0, scannedFiles: 247 }
    },
    {
      id: '5',
      type: 'deployment',
      title: 'Database Migration',
      message: 'Schema migration completed successfully on Supabase',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      priority: 'medium',
      source: 'supabase',
      metadata: { migration: 'add_notifications_table', duration: '1.2s' }
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'deployment' | 'cicd' | 'uptime'>('all');

  const getNotificationIcon = (type: string, source: string) => {
    switch (type) {
      case 'deployment':
        return source === 'vercel' ? <Globe className="w-4 h-4" /> : <Server className="w-4 h-4" />;
      case 'cicd':
        return <GitBranch className="w-4 h-4" />;
      case 'uptime':
        return <Server className="w-4 h-4" />;
      case 'security':
        return <AlertCircle className="w-4 h-4" />;
      case 'system':
        return <Info className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig = {
      vercel: { label: 'Vercel', color: 'bg-black text-white' },
      render: { label: 'Render', color: 'bg-purple-600 text-white' },
      supabase: { label: 'Supabase', color: 'bg-green-600 text-white' },
      github: { label: 'GitHub', color: 'bg-gray-800 text-white' },
      uptimerobot: { label: 'UptimeRobot', color: 'bg-blue-600 text-white' },
      system: { label: 'System', color: 'bg-gray-600 text-white' }
    };

    const config = sourceConfig[source as keyof typeof sourceConfig] || sourceConfig.system;
    return <Badge className={`${config.color} text-xs`}>{config.label}</Badge>;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-4 right-4 w-96 max-h-[80vh] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200/50 bg-white/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'deployment', label: 'Deploy' },
                  { key: 'cicd', label: 'CI/CD' },
                  { key: 'uptime', label: 'Uptime' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      filter === tab.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear all
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <ScrollArea className="flex-1 max-h-96">
              <div className="p-2">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                          notification.read
                            ? 'bg-gray-50/50 border-gray-200/50'
                            : 'bg-blue-50/50 border-blue-200/50 shadow-sm'
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Priority Indicator */}
                          <div className={`w-1 h-12 rounded-full ${getPriorityColor(notification.priority)} flex-shrink-0`} />
                          
                          {/* Icon */}
                          <div className={`p-2 rounded-lg flex-shrink-0 ${
                            notification.type === 'deployment' ? 'bg-green-100 text-green-600' :
                            notification.type === 'cicd' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'uptime' ? 'bg-orange-100 text-orange-600' :
                            notification.type === 'security' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {getNotificationIcon(notification.type, notification.source)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`text-sm font-medium truncate ${
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h3>
                              {getSourceBadge(notification.source)}
                            </div>
                            
                            <p className={`text-xs leading-relaxed mb-2 ${
                              notification.read ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimestamp(notification.timestamp)}</span>
                              </div>

                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {notification.actionUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    asChild
                                  >
                                    <a href={notification.actionUrl} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Metadata */}
                            {notification.metadata && (
                              <div className="mt-2 pt-2 border-t border-gray-200/50">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(notification.metadata).map(([key, value]) => (
                                    <span
                                      key={key}
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                                    >
                                      {key}: {value}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200/50 bg-white/50">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Notification Settings
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter; 