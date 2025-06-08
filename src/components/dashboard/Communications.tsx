import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Video, 
  Mail, 
  Bell, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'message' | 'email' | 'call' | 'notification';
  from: string;
  to?: string[];
  subject?: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isStarred: boolean;
  isArchived: boolean;
  attachments?: { name: string; size: number; type: string }[];
}

interface CommunicationStats {
  messagesTotal: number;
  messagesUnread: number;
  emailsTotal: number;
  emailsUnread: number;
  callsTotal: number;
  callsMissed: number;
  notificationsTotal: number;
  notificationsUnread: number;
}

const Communications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'emails' | 'calls' | 'notifications'>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeType, setComposeType] = useState<'message' | 'email'>('message');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const [stats, setStats] = useState<CommunicationStats>({
    messagesTotal: 156,
    messagesUnread: 12,
    emailsTotal: 89,
    emailsUnread: 5,
    callsTotal: 34,
    callsMissed: 3,
    notificationsTotal: 67,
    notificationsUnread: 8,
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'message',
      from: 'John Doe',
      content: 'Hey team, the new design is ready for review. Please check the latest mockups.',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'read',
      priority: 'medium',
      isStarred: false,
      isArchived: false,
    },
    {
      id: '2',
      type: 'email',
      from: 'jane.smith@company.com',
      to: ['team@company.com'],
      subject: 'Project Update - Q1 Milestones',
      content: 'Hi everyone, I wanted to provide an update on our Q1 project milestones...',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'delivered',
      priority: 'high',
      isStarred: true,
      isArchived: false,
      attachments: [{ name: 'Q1_Report.pdf', size: 2048000, type: 'application/pdf' }],
    },
    {
      id: '3',
      type: 'call',
      from: 'Mike Johnson',
      content: 'Video call ended - Duration: 45 minutes. Topic: Sprint Planning',
      timestamp: '2024-01-15T08:00:00Z',
      status: 'delivered',
      priority: 'medium',
      isStarred: false,
      isArchived: false,
    },
    {
      id: '4',
      type: 'notification',
      from: 'System',
      content: 'Your deployment to production was successful. Build #245 is now live.',
      timestamp: '2024-01-15T07:30:00Z',
      status: 'read',
      priority: 'medium',
      isStarred: false,
      isArchived: false,
    },
  ]);

  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    content: '',
    priority: 'medium' as Message['priority'],
  });

  // Filter messages based on active tab and filters
  const filteredMessages = messages.filter(message => {
    if (activeTab !== 'messages' && message.type !== activeTab.slice(0, -1)) return false;
    if (activeTab === 'messages' && message.type !== 'message') return false;
    
    if (filterStatus === 'unread' && message.status === 'read') return false;
    if (filterStatus === 'starred' && !message.isStarred) return false;
    if (filterStatus === 'archived' && !message.isArchived) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        message.from.toLowerCase().includes(query) ||
        message.content.toLowerCase().includes(query) ||
        (message.subject && message.subject.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  const handleSendMessage = async () => {
    if (!composeForm.to || !composeForm.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage: Message = {
        id: Date.now().toString(),
        type: composeType,
        from: 'You',
        to: composeType === 'email' ? [composeForm.to] : undefined,
        subject: composeType === 'email' ? composeForm.subject : undefined,
        content: composeForm.content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        priority: composeForm.priority,
        isStarred: false,
        isArchived: false,
      };

      setMessages(prev => [newMessage, ...prev]);
      setComposeForm({ to: '', subject: '', content: '', priority: 'medium' });
      setIsComposeOpen(false);
      
      toast.success(`${composeType === 'email' ? 'Email' : 'Message'} sent successfully!`);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
    toast.success('Message starred');
  };

  const handleArchiveMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isArchived: !msg.isArchived } : msg
    ));
    toast.success('Message archived');
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast.success('Message deleted');
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status: 'read' } : msg
    ));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'email': return Mail;
      case 'call': return Video;
      case 'notification': return Bell;
      default: return MessageSquare;
    }
  };

  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 bg-gray-50 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage team communications, messages, and notifications
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Compose
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Compose {composeType === 'email' ? 'Email' : 'Message'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={composeType} onValueChange={(value: 'message' | 'email') => setComposeType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="message">Team Message</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="to">To</Label>
                    <Input
                      value={composeForm.to}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, to: e.target.value }))}
                      placeholder={composeType === 'email' ? 'recipient@example.com' : '@username or team'}
                    />
                  </div>
                  
                  {composeType === 'email' && (
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        value={composeForm.subject}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Email subject"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={composeForm.priority} onValueChange={(value: Message['priority']) => setComposeForm(prev => ({ ...prev, priority: value }))}>
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
                    <Label htmlFor="content">Message</Label>
                    <Textarea
                      value={composeForm.content}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Type your message here..."
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendMessage} disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.messagesTotal}</p>
              <p className="text-xs text-blue-600 mt-1">{stats.messagesUnread} unread</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emails</p>
              <p className="text-2xl font-bold text-gray-900">{stats.emailsTotal}</p>
              <p className="text-xs text-purple-600 mt-1">{stats.emailsUnread} unread</p>
            </div>
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Calls</p>
              <p className="text-2xl font-bold text-gray-900">{stats.callsTotal}</p>
              <p className="text-xs text-green-600 mt-1">{stats.callsMissed} missed</p>
            </div>
            <Video className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.notificationsTotal}</p>
              <p className="text-xs text-yellow-600 mt-1">{stats.notificationsUnread} unread</p>
            </div>
            <Bell className="w-8 h-8 text-yellow-600" />
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col">
        {/* Tabs and Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="emails">Emails</TabsTrigger>
                <TabsTrigger value="calls">Calls</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search communications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="starred">Starred</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-auto">
          <div className="space-y-1">
            {filteredMessages.map((message) => {
              const IconComponent = getMessageIcon(message.type);
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center space-x-4 p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
                    message.status === 'read' ? 'opacity-75' : 'bg-blue-50'
                  }`}
                  onClick={() => handleMarkAsRead(message.id)}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{message.from}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                    
                    {message.subject && (
                      <p className="text-sm font-medium text-gray-800 mt-1 truncate">{message.subject}</p>
                    )}
                    
                    <p className="text-sm text-gray-600 mt-1 truncate">{message.content}</p>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex items-center mt-2 text-xs text-blue-600">
                        <Download className="w-3 h-3 mr-1" />
                        {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {message.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStarMessage(message.id)}>
                          <Star className="w-4 h-4 mr-2" />
                          {message.isStarred ? 'Unstar' : 'Star'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchiveMessage(message.id)}>
                          <Archive className="w-4 h-4 mr-2" />
                          {message.isArchived ? 'Unarchive' : 'Archive'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communications; 