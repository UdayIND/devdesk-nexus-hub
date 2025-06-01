import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Video, Settings, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MeetingAPI, { Meeting, MeetingSettings } from '@/lib/meeting-api';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  meetings: Meeting[];
}

interface MeetingFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  timezone: string;
  type: 'video' | 'audio' | 'screen-share';
  invites: { email: string; role: 'presenter' | 'attendee' }[];
  settings: MeetingSettings;
}

const MeetingScheduler: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const meetingAPI = new MeetingAPI();

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Meeting['status'] | 'all'>('all');
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Form state
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    type: 'video',
    invites: [],
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
      autoAdmit: 'everyone',
      recordingMode: 'cloud',
    },
  });

  // Queries
  const {
    data: meetingsData,
    isLoading: isMeetingsLoading,
    error: meetingsError,
  } = useQuery({
    queryKey: ['meetings', currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: () => {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
      return meetingAPI.getMeetings(1, 100, filterStatus === 'all' ? undefined : filterStatus, startDate, endDate);
    },
    staleTime: 30000,
  });

  // Mutations
  const createMeetingMutation = useMutation({
    mutationFn: (data: MeetingFormData) => meetingAPI.createMeeting(data),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Meeting Created',
          description: 'Your meeting has been scheduled successfully.',
        });
        setIsCreateDialogOpen(false);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ['meetings'] });
      } else {
        toast({
          title: 'Failed to Create Meeting',
          description: response.error || 'An error occurred',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to Create Meeting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Generate calendar days
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayMeetings = meetingsData?.success && meetingsData.data 
        ? meetingsData.data.meetings.filter(meeting => {
            const meetingDate = new Date(meeting.startTime);
            return meetingDate.toDateString() === date.toDateString();
          })
        : [];
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        meetings: dayMeetings,
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, meetingsData]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      type: 'video',
      invites: [],
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
        autoAdmit: 'everyone',
        recordingMode: 'cloud',
      },
    });
  };

  const handleCreateMeeting = () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast({
        title: 'Invalid Time',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }

    createMeetingMutation.mutate(formData);
  };

  const addInvite = () => {
    setFormData(prev => ({
      ...prev,
      invites: [...prev.invites, { email: '', role: 'attendee' }],
    }));
  };

  const removeInvite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      invites: prev.invites.filter((_, i) => i !== index),
    }));
  };

  const updateInvite = (index: number, field: 'email' | 'role', value: string) => {
    setFormData(prev => ({
      ...prev,
      invites: prev.invites.map((invite, i) => 
        i === index ? { ...invite, [field]: value } : invite
      ),
    }));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMeetingStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'live': return 'bg-green-500';
      case 'ended': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredMeetings = meetingsData?.success && meetingsData.data
    ? meetingsData.data.meetings.filter(meeting => {
        const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            meeting.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || meeting.status === filterStatus;
        return matchesSearch && matchesFilter;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meeting Scheduler</h2>
          <p className="text-muted-foreground">
            Schedule and manage your video conferences
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
              <DialogDescription>
                Create a new video conference meeting with participants
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Meeting Details</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Meeting Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter meeting title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Meeting Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'video' | 'audio' | 'screen-share') => 
                        setFormData(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Conference</SelectItem>
                        <SelectItem value="audio">Audio Only</SelectItem>
                        <SelectItem value="screen-share">Screen Share</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Meeting description (optional)"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={formData.timezone}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="participants" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Participants</Label>
                  <Button variant="outline" size="sm" onClick={addInvite}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Participant
                  </Button>
                </div>
                
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {formData.invites.map((invite, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Input
                          placeholder="Email address"
                          value={invite.email}
                          onChange={(e) => updateInvite(index, 'email', e.target.value)}
                          className="flex-1"
                        />
                        <Select
                          value={invite.role}
                          onValueChange={(value: 'presenter' | 'attendee') => 
                            updateInvite(index, 'role', value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attendee">Attendee</SelectItem>
                            <SelectItem value="presenter">Presenter</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeInvite(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    
                    {formData.invites.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No participants added yet. Click "Add Participant" to invite people.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Meeting Features</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allowChat">Enable Chat</Label>
                        <Switch
                          id="allowChat"
                          checked={formData.settings.allowChat}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, allowChat: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allowScreenShare">Allow Screen Share</Label>
                        <Switch
                          id="allowScreenShare"
                          checked={formData.settings.allowScreenShare}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, allowScreenShare: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allowRecording">Allow Recording</Label>
                        <Switch
                          id="allowRecording"
                          checked={formData.settings.allowRecording}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, allowRecording: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableLiveCaptions">Live Captions</Label>
                        <Switch
                          id="enableLiveCaptions"
                          checked={formData.settings.enableLiveCaptions}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, enableLiveCaptions: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableTranscription">Transcription</Label>
                        <Switch
                          id="enableTranscription"
                          checked={formData.settings.enableTranscription}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, enableTranscription: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Participant Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="muteOnJoin">Mute on Join</Label>
                        <Switch
                          id="muteOnJoin"
                          checked={formData.settings.muteOnJoin}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, muteOnJoin: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="videoOnJoin">Video on Join</Label>
                        <Switch
                          id="videoOnJoin"
                          checked={formData.settings.videoOnJoin}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, videoOnJoin: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableWaitingRoom">Waiting Room</Label>
                        <Switch
                          id="enableWaitingRoom"
                          checked={formData.settings.enableWaitingRoom}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, enableWaitingRoom: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Auto Admit</Label>
                        <Select
                          value={formData.settings.autoAdmit}
                          onValueChange={(value: 'everyone' | 'organization' | 'invited-only') => 
                            setFormData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, autoAdmit: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="everyone">Everyone</SelectItem>
                            <SelectItem value="organization">Organization Only</SelectItem>
                            <SelectItem value="invited-only">Invited Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateMeeting}
                disabled={createMeetingMutation.isPending}
              >
                {createMeetingMutation.isPending ? 'Creating...' : 'Schedule Meeting'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={(value: Meeting['status'] | 'all') => setFilterStatus(value)}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      p-2 min-h-[80px] border rounded-lg cursor-pointer transition-colors
                      ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/50'}
                      ${day.isToday ? 'ring-2 ring-primary' : ''}
                      ${selectedDate?.toDateString() === day.date.toDateString() ? 'bg-primary/10' : ''}
                      hover:bg-muted/80
                    `}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className={`text-sm ${day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1 mt-1">
                      {day.meetings.slice(0, 2).map(meeting => (
                        <div
                          key={meeting.id}
                          className={`text-xs p-1 rounded text-white truncate ${getMeetingStatusColor(meeting.status)}`}
                          title={meeting.title}
                        >
                          {formatTime(meeting.startTime)} {meeting.title}
                        </div>
                      ))}
                      {day.meetings.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{day.meetings.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meeting List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Meetings
              </CardTitle>
              <CardDescription>
                {selectedDate 
                  ? `Meetings for ${selectedDate.toLocaleDateString()}`
                  : 'All upcoming meetings'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredMeetings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No meetings found
                    </div>
                  ) : (
                    filteredMeetings.map(meeting => (
                      <div key={meeting.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium truncate">{meeting.title}</h4>
                          <Badge variant="secondary" className={getMeetingStatusColor(meeting.status)}>
                            {meeting.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(meeting.startTime).toLocaleDateString()} at{' '}
                          {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                        </div>
                        {meeting.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {meeting.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Video className="h-3 w-3" />
                          {meeting.type}
                          <Users className="h-3 w-3 ml-2" />
                          Room: {meeting.meetingRoom}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Join
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3" />
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
      </div>
    </div>
  );
};

export default MeetingScheduler; 