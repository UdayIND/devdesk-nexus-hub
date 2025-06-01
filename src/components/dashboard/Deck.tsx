import React, { useState, useEffect } from 'react';
import { 
  Calendar, Video, Clock, Users, Settings, Plus, Search, Filter,
  Phone, Monitor, Mic, Camera, Shield, Star, Archive, Download,
  BarChart3, Headphones, Globe, Zap, Bell, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import MeetingAPI, { Meeting, MeetingAnalytics } from '@/lib/meeting-api';
import MeetingScheduler from './MeetingScheduler';
import VideoConference from './VideoConference';

interface DeckProps {
  className?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

interface RecentMeeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: number;
  status: 'completed' | 'missed' | 'cancelled';
  recordingUrl?: string;
}

const Deck: React.FC<DeckProps> = ({ className }) => {
  const { toast } = useToast();
  const meetingAPI = new MeetingAPI();
  
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Meeting['status'] | 'all'>('all');

  // Queries
  const {
    data: upcomingMeetingsData,
    isLoading: isUpcomingLoading,
  } = useQuery({
    queryKey: ['upcoming-meetings'],
    queryFn: () => {
      const today = new Date().toISOString();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return meetingAPI.getMeetings(1, 10, 'scheduled', today, nextWeek);
    },
    refetchInterval: 30000,
  });

  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
  } = useQuery({
    queryKey: ['meeting-analytics'],
    queryFn: () => {
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const today = new Date().toISOString();
      return meetingAPI.getMeetingAnalytics(lastMonth, today);
    },
    staleTime: 300000, // 5 minutes
  });

  const {
    data: recentMeetingsData,
    isLoading: isRecentLoading,
  } = useQuery({
    queryKey: ['recent-meetings'],
    queryFn: () => {
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const today = new Date().toISOString();
      return meetingAPI.getMeetings(1, 5, 'ended', lastWeek, today);
    },
    staleTime: 60000,
  });

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: 'instant-meeting',
      title: 'Start Instant Meeting',
      description: 'Begin a video call immediately',
      icon: <Video className="w-6 h-6" />,
      action: () => handleInstantMeeting(),
      color: 'bg-blue-500',
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Plan a future video conference',
      icon: <Calendar className="w-6 h-6" />,
      action: () => setActiveTab('scheduler'),
      color: 'bg-green-500',
    },
    {
      id: 'join-meeting',
      title: 'Join Meeting',
      description: 'Enter a meeting with ID',
      icon: <Phone className="w-6 h-6" />,
      action: () => handleJoinMeeting(),
      color: 'bg-purple-500',
    },
    {
      id: 'screen-share',
      title: 'Share Screen',
      description: 'Start screen sharing session',
      icon: <Monitor className="w-6 h-6" />,
      action: () => handleScreenShare(),
      color: 'bg-orange-500',
    },
  ];

  const handleInstantMeeting = async () => {
    try {
      const meetingData = {
        title: `Instant Meeting - ${new Date().toLocaleString()}`,
        description: 'Quick video conference',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        type: 'video' as const,
        settings: {
          allowChat: true,
          allowScreenShare: true,
          allowRecording: true,
          muteOnJoin: false,
          videoOnJoin: true,
          requirePassword: false,
          enableWaitingRoom: false,
          enableBreakoutRooms: false,
          enableLiveCaptions: false,
          enableTranscription: false,
          autoAdmit: 'everyone' as const,
          recordingMode: 'cloud' as const,
        },
      };

      const response = await meetingAPI.createMeeting(meetingData);
      if (response.success && response.data) {
        setActiveMeetingId(response.data.id);
        setActiveTab('meeting');
        toast({
          title: 'Meeting Started',
          description: 'Your instant meeting is ready!',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to Start Meeting',
        description: 'Could not create instant meeting',
        variant: 'destructive',
      });
    }
  };

  const handleJoinMeeting = () => {
    const meetingId = prompt('Enter Meeting ID:');
    if (meetingId) {
      setActiveMeetingId(meetingId);
      setActiveTab('meeting');
    }
  };

  const handleScreenShare = async () => {
    try {
      const meetingData = {
        title: `Screen Share - ${new Date().toLocaleString()}`,
        description: 'Screen sharing session',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        type: 'screen-share' as const,
        settings: {
          allowChat: true,
          allowScreenShare: true,
          allowRecording: true,
          muteOnJoin: true,
          videoOnJoin: false,
          requirePassword: false,
          enableWaitingRoom: false,
          enableBreakoutRooms: false,
          enableLiveCaptions: false,
          enableTranscription: false,
          autoAdmit: 'everyone' as const,
          recordingMode: 'cloud' as const,
        },
      };

      const response = await meetingAPI.createMeeting(meetingData);
      if (response.success && response.data) {
        setActiveMeetingId(response.data.id);
        setActiveTab('meeting');
        toast({
          title: 'Screen Share Started',
          description: 'Your screen sharing session is ready!',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to Start Screen Share',
        description: 'Could not create screen sharing session',
        variant: 'destructive',
      });
    }
  };

  const handleJoinScheduledMeeting = (meetingId: string) => {
    setActiveMeetingId(meetingId);
    setActiveTab('meeting');
  };

  const handleLeaveMeeting = () => {
    setActiveMeetingId(null);
    setActiveTab('dashboard');
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'missed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      case 'scheduled': return 'bg-blue-500';
      case 'live': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const upcomingMeetings = upcomingMeetingsData?.success ? upcomingMeetingsData.data.meetings : [];
  const recentMeetings = recentMeetingsData?.success ? recentMeetingsData.data.meetings : [];
  const analytics = analyticsData?.success ? analyticsData.data : null;

  // If in a meeting, show the video conference component
  if (activeTab === 'meeting' && activeMeetingId) {
    return (
      <VideoConference
        meetingId={activeMeetingId}
        onLeave={handleLeaveMeeting}
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deck</h1>
          <p className="text-muted-foreground">
            Video conferencing and meeting management platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Scheduler
          </TabsTrigger>
          <TabsTrigger value="recordings" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Recordings
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Meetings */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Upcoming Meetings
                  </CardTitle>
                  <CardDescription>
                    Your scheduled meetings for the next 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {isUpcomingLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : upcomingMeetings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No upcoming meetings scheduled
                        </div>
                      ) : (
                        upcomingMeetings.map((meeting) => (
                          <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{meeting.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>
                                  {new Date(meeting.startTime).toLocaleDateString()} at{' '}
                                  {new Date(meeting.startTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                <Badge variant="outline" className={getStatusColor(meeting.status)}>
                                  {meeting.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleJoinScheduledMeeting(meeting.id)}
                              >
                                Join
                              </Button>
                              <Button variant="outline" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAnalyticsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : analytics ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Meetings</span>
                        <span className="font-semibold">{analytics.totalMeetings}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Duration</span>
                        <span className="font-semibold">{formatDuration(analytics.totalDuration)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Duration</span>
                        <span className="font-semibold">{formatDuration(analytics.averageDuration)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Participants</span>
                        <span className="font-semibold">{analytics.participantCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Recordings</span>
                        <span className="font-semibold">{analytics.recordingCount}</span>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Connection Quality</span>
                          <Badge variant={analytics.qualityMetrics.connectionQuality === 'excellent' ? 'default' : 'secondary'}>
                            {analytics.qualityMetrics.connectionQuality}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Latency: {analytics.qualityMetrics.averageLatency}ms
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No analytics data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="w-5 h-5" />
                    Recent Meetings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-60">
                    <div className="space-y-3">
                      {isRecentLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      ) : recentMeetings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No recent meetings
                        </div>
                      ) : (
                        recentMeetings.map((meeting) => (
                          <div key={meeting.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{meeting.title}</h4>
                              <Badge variant="outline" className={getStatusColor(meeting.status)}>
                                {meeting.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(meeting.startTime).toLocaleDateString()}
                            </div>
                            {meeting.recordingUrl && (
                              <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs">
                                <Download className="w-3 h-3 mr-1" />
                                Recording
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduler">
          <MeetingScheduler />
        </TabsContent>

        <TabsContent value="recordings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Meeting Recordings
              </CardTitle>
              <CardDescription>
                Access and manage your recorded meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Recording management coming soon</p>
                <p className="text-sm">View, download, and share your meeting recordings</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Meeting Analytics
              </CardTitle>
              <CardDescription>
                Detailed insights into your meeting usage and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Advanced analytics coming soon</p>
                <p className="text-sm">Track meeting trends, participant engagement, and more</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Deck; 