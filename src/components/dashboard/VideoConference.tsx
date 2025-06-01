import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Phone, PhoneOff,
  Users, MessageSquare, Settings, MoreVertical, Hand, Volume2, VolumeX,
  Circle, Square, Camera, Maximize, Minimize, Grid, Speaker, Headphones,
  Captions, CaptionsOff, Share, Download, Copy, UserPlus, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import useMeeting from '@/hooks/useMeeting';
import { MeetingParticipant, ChatMessage } from '@/lib/meeting-api';

interface VideoConferenceProps {
  meetingId: string;
  onLeave?: () => void;
}

interface ParticipantVideoProps {
  participant: MeetingParticipant;
  stream?: MediaStream;
  isLocal?: boolean;
  isScreenShare?: boolean;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  participant,
  stream,
  isLocal = false,
  isScreenShare = false,
  onVideoRef
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      if (onVideoRef) {
        onVideoRef(videoRef.current);
      }
    }
  }, [stream, onVideoRef]);

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${isScreenShare ? 'aspect-video' : 'aspect-square'}`}>
      {stream && participant.mediaState.video ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Avatar className="w-16 h-16">
            <AvatarImage src={participant.user.avatar} />
            <AvatarFallback className="text-2xl">
              {getInitials(participant.user.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* Participant Info */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={participant.status === 'joined' ? 'default' : 'secondary'} className="text-xs">
            {participant.user.name}
            {isLocal && ' (You)'}
          </Badge>
          {participant.role === 'host' && (
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Host
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {!participant.mediaState.audio && (
            <div className="p-1 bg-red-500 rounded-full">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
          {participant.mediaState.screenShare && (
            <div className="p-1 bg-blue-500 rounded-full">
              <Monitor className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
      
      {/* Controls Overlay */}
      <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};

const VideoConference: React.FC<VideoConferenceProps> = ({ meetingId, onLeave }) => {
  const { toast } = useToast();
  const [chatInput, setChatInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'speaker' | 'gallery'>('grid');
  const [volume, setVolume] = useState([100]);
  const [isLiveCaptionsEnabled, setIsLiveCaptionsEnabled] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');

  const {
    meeting,
    participants,
    currentParticipant,
    chatMessages,
    transcripts,
    isConnected,
    isJoined,
    isVideoEnabled,
    isAudioEnabled,
    isRecording,
    isHandRaised,
    mediaDevices,
    webrtcState,
    joinMeeting,
    leaveMeeting,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    setVideoDevice,
    setAudioDevice,
    sendChatMessage,
    raiseHand,
    lowerHand,
    startRecording,
    stopRecording,
    localVideoRef,
    remoteVideoRefs,
    formatDuration,
    generateMeetingLink,
  } = useMeeting({ meetingId, autoJoin: true });

  // Auto-join meeting on mount
  useEffect(() => {
    if (meetingId && !isJoined) {
      joinMeeting(meetingId);
    }
  }, [meetingId, isJoined, joinMeeting]);

  // Update live captions
  useEffect(() => {
    if (transcripts.length > 0) {
      const latestTranscript = transcripts[transcripts.length - 1];
      setCurrentCaption(latestTranscript.content);
      
      // Clear caption after 5 seconds
      const timer = setTimeout(() => {
        setCurrentCaption('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [transcripts]);

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const handleLeaveMeeting = () => {
    leaveMeeting();
    if (onLeave) {
      onLeave();
    }
  };

  const copyMeetingLink = () => {
    const link = generateMeetingLink(meetingId);
    navigator.clipboard.writeText(link);
    toast({
      title: 'Meeting Link Copied',
      description: 'The meeting link has been copied to your clipboard.',
    });
  };

  const getParticipantStream = (participantId: string) => {
    return webrtcState.remoteStreams.get(participantId);
  };

  const renderParticipantGrid = () => {
    const allParticipants = currentParticipant ? [currentParticipant, ...participants.filter(p => p.id !== currentParticipant.id)] : participants;
    const gridCols = Math.ceil(Math.sqrt(allParticipants.length));
    
    return (
      <div className={`grid gap-4 h-full ${gridCols === 1 ? 'grid-cols-1' : gridCols === 2 ? 'grid-cols-2' : gridCols === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
        {allParticipants.map((participant) => (
          <ParticipantVideo
            key={participant.id}
            participant={participant}
            stream={participant.id === currentParticipant?.id ? webrtcState.localStream || undefined : getParticipantStream(participant.id)}
            isLocal={participant.id === currentParticipant?.id}
            onVideoRef={participant.id === currentParticipant?.id ? (ref) => {
              if (localVideoRef) {
                localVideoRef.current = ref;
              }
            } : (ref) => {
              if (ref) {
                remoteVideoRefs.current.set(participant.id, ref);
              }
            }}
          />
        ))}
      </div>
    );
  };

  const renderSpeakerView = () => {
    const speakingParticipant = participants.find(p => p.mediaState.audio) || participants[0] || currentParticipant;
    const otherParticipants = participants.filter(p => p.id !== speakingParticipant?.id);
    
    return (
      <div className="h-full flex flex-col gap-4">
        {/* Main speaker */}
        <div className="flex-1">
          {speakingParticipant && (
            <ParticipantVideo
              participant={speakingParticipant}
              stream={speakingParticipant.id === currentParticipant?.id ? webrtcState.localStream || undefined : getParticipantStream(speakingParticipant.id)}
              isLocal={speakingParticipant.id === currentParticipant?.id}
              isScreenShare={speakingParticipant.mediaState.screenShare}
            />
          )}
        </div>
        
        {/* Other participants */}
        {otherParticipants.length > 0 && (
          <div className="h-32 flex gap-2 overflow-x-auto">
            {currentParticipant && currentParticipant.id !== speakingParticipant?.id && (
              <div className="w-24 flex-shrink-0">
                <ParticipantVideo
                  participant={currentParticipant}
                  stream={webrtcState.localStream || undefined}
                  isLocal={true}
                />
              </div>
            )}
            {otherParticipants.map((participant) => (
              <div key={participant.id} className="w-24 flex-shrink-0">
                <ParticipantVideo
                  participant={participant}
                  stream={getParticipantStream(participant.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Joining meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{meeting?.title || 'Video Conference'}</h1>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Circle className="w-3 h-3 mr-1" />
              Recording
            </Badge>
          )}
          {!isConnected && (
            <Badge variant="outline">
              Reconnecting...
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={copyMeetingLink}>
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-4 relative">
          {viewMode === 'grid' ? renderParticipantGrid() : renderSpeakerView()}
          
          {/* Live Captions */}
          {isLiveCaptionsEnabled && currentCaption && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg max-w-2xl">
              {currentCaption}
            </div>
          )}
          
          {/* View Mode Toggle */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'speaker' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('speaker')}
            >
              <Speaker className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        {(isChatOpen || isParticipantsOpen) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <Tabs value={isChatOpen ? 'chat' : 'participants'} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                <TabsTrigger 
                  value="chat" 
                  onClick={() => { setIsChatOpen(true); setIsParticipantsOpen(false); }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="participants"
                  onClick={() => { setIsParticipantsOpen(true); setIsChatOpen(false); }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Participants ({participants.length + 1})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="flex-1 flex flex-col p-4">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-3">
                    {chatMessages.map((message) => (
                      <div key={message.id} className="text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {participants.find(p => p.userId === message.senderId)?.user.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-gray-700 border-gray-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>Send</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="participants" className="flex-1 p-4">
                <ScrollArea className="h-full">
                  <div className="space-y-3">
                    {[currentParticipant, ...participants].filter(Boolean).map((participant) => (
                      <div key={participant!.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-700">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={participant!.user.avatar} />
                          <AvatarFallback>
                            {participant!.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">
                              {participant!.user.name}
                              {participant!.id === currentParticipant?.id && ' (You)'}
                            </span>
                            {participant!.role === 'host' && (
                              <Badge variant="outline" className="text-xs">Host</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {participant!.mediaState.audio ? (
                              <Mic className="w-3 h-3 text-green-400" />
                            ) : (
                              <MicOff className="w-3 h-3 text-red-400" />
                            )}
                            {participant!.mediaState.video ? (
                              <Video className="w-3 h-3 text-green-400" />
                            ) : (
                              <VideoOff className="w-3 h-3 text-red-400" />
                            )}
                            {participant!.mediaState.screenShare && (
                              <Monitor className="w-3 h-3 text-blue-400" />
                            )}
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12"
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12"
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          
          <Button
            variant={webrtcState.isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={webrtcState.isScreenSharing ? stopScreenShare : startScreenShare}
            className="rounded-full w-12 h-12"
          >
            {webrtcState.isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>
          
          <Button
            variant={isHandRaised ? "default" : "outline"}
            size="lg"
            onClick={isHandRaised ? lowerHand : raiseHand}
            className="rounded-full w-12 h-12"
          >
            <Hand className="w-5 h-5" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-8" />
        
        <div className="flex items-center gap-2">
          <Button
            variant={isChatOpen ? "default" : "outline"}
            size="lg"
            onClick={() => { setIsChatOpen(!isChatOpen); setIsParticipantsOpen(false); }}
            className="rounded-full w-12 h-12"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          
          <Button
            variant={isParticipantsOpen ? "default" : "outline"}
            size="lg"
            onClick={() => { setIsParticipantsOpen(!isParticipantsOpen); setIsChatOpen(false); }}
            className="rounded-full w-12 h-12"
          >
            <Users className="w-5 h-5" />
          </Button>
          
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            className="rounded-full w-12 h-12"
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </Button>
          
          <Button
            variant={isLiveCaptionsEnabled ? "default" : "outline"}
            size="lg"
            onClick={() => setIsLiveCaptionsEnabled(!isLiveCaptionsEnabled)}
            className="rounded-full w-12 h-12"
          >
            {isLiveCaptionsEnabled ? <Captions className="w-5 h-5" /> : <CaptionsOff className="w-5 h-5" />}
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-8" />
        
        <Button
          variant="destructive"
          size="lg"
          onClick={handleLeaveMeeting}
          className="rounded-full w-12 h-12"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Meeting Settings</DialogTitle>
            <DialogDescription>
              Configure your audio, video, and meeting preferences
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="devices" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            </TabsList>
            
            <TabsContent value="devices" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Camera</Label>
                  <Select
                    value={mediaDevices.selectedVideoDevice}
                    onValueChange={setVideoDevice}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaDevices.videoDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Microphone</Label>
                  <Select
                    value={mediaDevices.selectedAudioDevice}
                    onValueChange={setAudioDevice}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaDevices.audioDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="audio" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Speaker Volume</Label>
                  <div className="flex items-center gap-4">
                    <VolumeX className="w-4 h-4" />
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm w-12">{volume[0]}%</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="accessibility" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Live Captions</Label>
                    <p className="text-sm text-muted-foreground">
                      Show real-time captions during the meeting
                    </p>
                  </div>
                  <Switch
                    checked={isLiveCaptionsEnabled}
                    onCheckedChange={setIsLiveCaptionsEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Keyboard Shortcuts</Label>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <div>Space: Toggle mute</div>
                    <div>Ctrl + D: Toggle video</div>
                    <div>Ctrl + Shift + S: Start/stop screen share</div>
                    <div>Ctrl + Shift + R: Start/stop recording</div>
                    <div>Ctrl + Shift + H: Raise/lower hand</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoConference; 