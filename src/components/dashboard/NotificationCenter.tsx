import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  GitBranch, 
  MessageSquare, 
  Calendar, 
  User,
  Settings,
  Trash2,
  Mail,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'system' | 'project' | 'team' | 'meeting' | 'deployment';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  avatar?: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Deployment Successful',
      message: 'Your application has been successfully deployed to production.',
      type: 'success',
      category: 'deployment',
      timestamp: '2 minutes ago',
      read: false,
      actionUrl: '/deployment',
      actionLabel: 'View Details'
    },
    {
      id: '2',
      title: 'New Team Member',
      message: 'Sarah Johnson has joined the E-commerce Platform project.',
      type: 'info',
      category: 'team',
      timestamp: '15 minutes ago',
      read: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
    },
    {
      id: '3',
      title: 'Meeting Reminder',
      message: 'Daily standup meeting starts in 10 minutes.',
      type: 'warning',
      category: 'meeting',
      timestamp: '25 minutes ago',
      read: true,
      actionUrl: '/meetings',
      actionLabel: 'Join Meeting'
    },
    {
      id: '4',
      title: 'Pull Request Review',
      message: 'Mike Johnson requested review for PR #123 in mobile-app repository.',
      type: 'info',
      category: 'project',
      timestamp: '1 hour ago',
      read: false,
      actionUrl: '/github',
      actionLabel: 'Review PR'
    },
    {
      id: '5',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2-4 AM UTC.',
      type: 'warning',
      category: 'system',
      timestamp: '2 hours ago',
      read: true
    },
    {
      id: '6',
      title: 'Build Failed',
      message: 'Build #456 failed for the authentication-service repository.',
      type: 'error',
      category: 'deployment',
      timestamp: '3 hours ago',
      read: false,
      actionUrl: '/builds',
      actionLabel: 'View Logs'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | Notification['category']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter notifications based on current filter and search query
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter !== 'all' && filter !== 'unread' && notification.category === filter);
    
    const matchesSearch = !searchQuery || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: false }
          : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification['type'], category: Notification['category']) => {
    if (category === 'deployment') return GitBranch;
    if (category === 'meeting') return Calendar;
    if (category === 'team') return User;
    if (category === 'project') return MessageSquare;
    if (category === 'system') return Settings;
    
    switch (type) {
      case 'success': return Check;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Info;
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-500 bg-green-100';
      case 'warning': return 'text-yellow-500 bg-yellow-100';
      case 'error': return 'text-red-500 bg-red-100';
      default: return 'text-blue-500 bg-blue-100';
    }
  };

  const getCategoryLabel = (category: Notification['category']) => {
    switch (category) {
      case 'deployment': return 'Deploy';
      case 'meeting': return 'Meeting';
      case 'team': return 'Team';
      case 'project': return 'Project';
      case 'system': return 'System';
      default: return category;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search notifications..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all' as const, label: 'All' },
            { key: 'unread' as const, label: 'Unread' },
            { key: 'system' as const, label: 'System' },
            { key: 'project' as const, label: 'Project' },
            { key: 'team' as const, label: 'Team' },
            { key: 'meeting' as const, label: 'Meeting' },
            { key: 'deployment' as const, label: 'Deploy' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key)}
              className="text-xs"
            >
              {label}
              {key === 'unread' && unreadCount > 0 && (
                <Badge className="ml-1 bg-red-500 text-white text-xs">{unreadCount}</Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex justify-between mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-xs"
            >
              Mark All Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No matching notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? `No notifications found matching "${searchQuery}"`
                  : "You're all caught up! No new notifications."
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const Icon = getIcon(notification.type, notification.category);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(notification.category)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {notification.actionUrl && notification.actionLabel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 px-2"
                              onClick={() => {
                                // In a real app, you'd navigate to the URL
                                console.log('Navigate to:', notification.actionUrl);
                                markAsRead(notification.id);
                              }}
                            >
                              {notification.actionLabel}
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                            className="text-xs h-6 w-6 p-0"
                            title={notification.read ? 'Mark as unread' : 'Mark as read'}
                          >
                            {notification.read ? <Mail className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-sm"
            onClick={() => {
              // In a real app, navigate to full notifications page
              console.log('View all notifications');
            }}
          >
            View All Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 