// Meeting API Service for Deck (Video Conferencing & Scheduling)
import { io, Socket } from 'socket.io-client';

// Core Meeting Types
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  type: 'video' | 'audio' | 'screen-share';
  isRecording: boolean;
  recordingUrl?: string;
  meetingRoom: string;
  password?: string;
  waitingRoom: boolean;
  maxParticipants: number;
  settings: MeetingSettings;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingSettings {
  allowChat: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  muteOnJoin: boolean;
  videoOnJoin: boolean;
  requirePassword: boolean;
  enableWaitingRoom: boolean;
  enableBreakoutRooms: boolean;
  enableLiveCaptions: boolean;
  enableTranscription: boolean;
  autoAdmit: 'everyone' | 'organization' | 'invited-only';
  recordingMode: 'cloud' | 'local' | 'disabled';
}

export interface MeetingParticipant {
  id: string;
  userId: string;
  meetingId: string;
  role: 'host' | 'co-host' | 'presenter' | 'attendee';
  status: 'invited' | 'joined' | 'left' | 'waiting';
  joinedAt?: string;
  leftAt?: string;
  mediaState: {
    video: boolean;
    audio: boolean;
    screenShare: boolean;
  };
  permissions: {
    canMute: boolean;
    canUnmute: boolean;
    canShare: boolean;
    canRecord: boolean;
    canManageParticipants: boolean;
  };
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface MeetingInvite {
  id: string;
  meetingId: string;
  email: string;
  role: 'presenter' | 'attendee';
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
  respondedAt?: string;
  reminderSent: boolean;
}

export interface ChatMessage {
  id: string;
  meetingId: string;
  senderId: string;
  content: string;
  type: 'text' | 'file' | 'emoji' | 'system';
  timestamp: string;
  isPrivate: boolean;
  recipientId?: string;
  reactions: ChatReaction[];
  edited: boolean;
  editedAt?: string;
}

export interface ChatReaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface MeetingTranscript {
  id: string;
  meetingId: string;
  speakerId: string;
  content: string;
  timestamp: string;
  confidence: number;
  language: string;
}

export interface CalendarEvent {
  id: string;
  meetingId: string;
  provider: 'google' | 'outlook' | 'apple';
  externalId: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastSyncAt: string;
}

export interface BreakoutRoom {
  id: string;
  meetingId: string;
  name: string;
  participants: string[];
  isActive: boolean;
  createdAt: string;
}

// WebRTC Types
export interface WebRTCOffer {
  type: 'offer';
  sdp: string;
  participantId: string;
}

export interface WebRTCAnswer {
  type: 'answer';
  sdp: string;
  participantId: string;
}

export interface ICECandidate {
  candidate: string;
  sdpMLineIndex: number;
  sdpMid: string;
  participantId: string;
}

export interface MediaStream {
  id: string;
  participantId: string;
  type: 'video' | 'audio' | 'screen';
  enabled: boolean;
  quality: 'low' | 'medium' | 'high';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MeetingListResponse {
  meetings: Meeting[];
  total: number;
  page: number;
  limit: number;
}

export interface MeetingAnalytics {
  totalMeetings: number;
  totalDuration: number;
  averageDuration: number;
  participantCount: number;
  recordingCount: number;
  transcriptCount: number;
  qualityMetrics: {
    averageLatency: number;
    averageJitter: number;
    packetLoss: number;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

// Socket Events
export interface SocketEvents {
  // Client to Server
  'join-meeting': (data: { meetingId: string; password?: string }) => void;
  'leave-meeting': (meetingId: string) => void;
  'toggle-media': (data: { meetingId: string; type: 'video' | 'audio'; enabled: boolean }) => void;
  'start-screen-share': (meetingId: string) => void;
  'stop-screen-share': (meetingId: string) => void;
  'send-chat': (data: { meetingId: string; message: ChatMessage }) => void;
  'webrtc-offer': (data: { meetingId: string; offer: WebRTCOffer; targetId: string }) => void;
  'webrtc-answer': (data: { meetingId: string; answer: WebRTCAnswer; targetId: string }) => void;
  'ice-candidate': (data: { meetingId: string; candidate: ICECandidate; targetId: string }) => void;
  'raise-hand': (meetingId: string) => void;
  'lower-hand': (meetingId: string) => void;
  'request-permission': (data: { meetingId: string; permission: string }) => void;

  // Server to Client
  'meeting-joined': (data: { meeting: Meeting; participants: MeetingParticipant[] }) => void;
  'participant-joined': (participant: MeetingParticipant) => void;
  'participant-left': (data: { participantId: string; reason?: string }) => void;
  'media-state-changed': (data: { participantId: string; mediaState: any }) => void;
  'chat-message': (message: ChatMessage) => void;
  'screen-share-started': (data: { participantId: string; streamId: string }) => void;
  'screen-share-stopped': (data: { participantId: string }) => void;
  'webrtc-offer-received': (data: { offer: WebRTCOffer; fromId: string }) => void;
  'webrtc-answer-received': (data: { answer: WebRTCAnswer; fromId: string }) => void;
  'ice-candidate-received': (data: { candidate: ICECandidate; fromId: string }) => void;
  'hand-raised': (data: { participantId: string }) => void;
  'hand-lowered': (data: { participantId: string }) => void;
  'meeting-ended': (data: { reason: string }) => void;
  'recording-started': () => void;
  'recording-stopped': (data: { recordingUrl: string }) => void;
  'transcription-update': (transcript: MeetingTranscript) => void;
  'error': (error: { message: string; code?: string }) => void;
}

export interface Participant {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  avatar?: string;
  role: 'host' | 'co-host' | 'presenter' | 'attendee';
  status: 'invited' | 'joined' | 'left' | 'disconnected';
  joinedAt?: string;
  leftAt?: string;
  permissions: ParticipantPermissions;
  deviceInfo: DeviceInfo;
}

export interface ParticipantPermissions {
  canSpeak: boolean;
  canVideo: boolean;
  canScreenShare: boolean;
  canChat: boolean;
  canInvite: boolean;
  canRecord: boolean;
  canMute: boolean;
}

export interface DeviceInfo {
  camera: boolean;
  microphone: boolean;
  speaker: boolean;
  screenShare: boolean;
  browser: string;
  os: string;
  connection: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface Recording {
  id: string;
  meetingId: string;
  url: string;
  size: number;
  duration: number;
  startTime: string;
  endTime: string;
  status: 'recording' | 'processing' | 'ready' | 'failed';
  downloadUrl?: string;
}

// Mock Data
const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'meeting-1',
    title: 'Daily Standup',
    description: 'Team daily standup meeting',
    type: 'video',
    status: 'scheduled',
    hostId: 'user-1',
    startTime: new Date(Date.now() - 300000).toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    timezone: 'America/New_York',
    waitingRoom: false,
    maxParticipants: 10,
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
      recordingMode: 'cloud'
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 'meeting-2',
    title: 'Client Presentation',
    description: 'Quarterly review with client stakeholders',
    type: 'video',
    status: 'scheduled',
    hostId: 'user-1',
    startTime: new Date(Date.now() + 7200000).toISOString(),
    endTime: new Date(Date.now() + 10800000).toISOString(),
    timezone: 'America/New_York',
    waitingRoom: true,
    maxParticipants: 8,
    settings: {
      allowChat: true,
      allowScreenShare: true,
      allowRecording: true,
      muteOnJoin: true,
      videoOnJoin: false,
      requirePassword: true,
      password: 'client123',
      enableWaitingRoom: true,
      enableBreakoutRooms: false,
      enableLiveCaptions: false,
      enableTranscription: false,
      autoAdmit: 'everyone',
      recordingMode: 'cloud'
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Mock flag
const USE_MOCK_DATA = false; // Production-ready: Always attempt real API first

export class MeetingAPI {
  private baseURL: string;
  private socket: Socket | null = null;
  private authToken: string | null = null;
  private currentMeeting: Meeting | null = null;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'https://devdesk-nexus-hub.onrender.com') {
    this.baseURL = baseURL;
    this.authToken = localStorage.getItem('auth_token');
  }

  // Authentication
  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Meeting Management
  async getMeetings(
    page = 1, 
    limit = 20, 
    status?: Meeting['status'],
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<MeetingListResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    if (USE_MOCK_DATA) {
      const mockMeetings = await this.mockResponse<Meeting[]>(MOCK_MEETINGS);
      const total = mockMeetings.length;
      const pageMeetings = mockMeetings.slice((page - 1) * limit, page * limit);
      return this.mockResponse<MeetingListResponse>({
        meetings: pageMeetings,
        total,
        page,
        limit
      });
    }

    return this.request<MeetingListResponse>(`/api/meetings?${params}`);
  }

  async getMeeting(meetingId: string): Promise<ApiResponse<Meeting>> {
    if (USE_MOCK_DATA) {
      const meeting = MOCK_MEETINGS.find(m => m.id === meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }
      return this.mockResponse<ApiResponse<Meeting>>({
        success: true,
        data: meeting
      });
    }

    return this.request<Meeting>(`/api/meetings/${meetingId}`);
  }

  async createMeeting(data: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    timezone: string;
    type: Meeting['type'];
    settings: Partial<MeetingSettings>;
    invites?: { email: string; role: 'presenter' | 'attendee' }[];
  }): Promise<ApiResponse<Meeting>> {
    if (USE_MOCK_DATA) {
      const newMeeting: Meeting = {
        id: `meeting-${Date.now()}`,
        title: data.title,
        description: data.description,
        type: data.type,
        status: 'scheduled',
        hostId: 'user-1',
        startTime: data.startTime,
        endTime: data.endTime,
        timezone: data.timezone,
        waitingRoom: data.settings?.enableWaitingRoom || false,
        maxParticipants: data.settings?.maxParticipants || 10,
        settings: {
          allowChat: data.settings?.allowChat || true,
          allowScreenShare: data.settings?.allowScreenShare || true,
          allowRecording: data.settings?.allowRecording || true,
          muteOnJoin: data.settings?.muteOnJoin || false,
          videoOnJoin: data.settings?.videoOnJoin || true,
          requirePassword: data.settings?.requirePassword || false,
          enableWaitingRoom: data.settings?.enableWaitingRoom || false,
          enableBreakoutRooms: data.settings?.enableBreakoutRooms || false,
          enableLiveCaptions: data.settings?.enableLiveCaptions || false,
          enableTranscription: data.settings?.enableTranscription || false,
          autoAdmit: data.settings?.autoAdmit || 'everyone',
          recordingMode: data.settings?.recordingMode || 'cloud'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      MOCK_MEETINGS.push(newMeeting);
      return this.mockResponse<ApiResponse<Meeting>>({
        success: true,
        data: newMeeting
      });
    }

    return this.request<Meeting>('/api/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMeeting(meetingId: string, data: Partial<Meeting>): Promise<ApiResponse<Meeting>> {
    if (USE_MOCK_DATA) {
      const meetingIndex = MOCK_MEETINGS.findIndex(m => m.id === meetingId);
      if (meetingIndex === -1) {
        throw new Error('Meeting not found');
      }

      const updatedMeeting = {
        ...MOCK_MEETINGS[meetingIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };

      MOCK_MEETINGS[meetingIndex] = updatedMeeting;
      return this.mockResponse<ApiResponse<Meeting>>({
        success: true,
        data: updatedMeeting
      });
    }

    return this.request<Meeting>(`/api/meetings/${meetingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMeeting(meetingId: string): Promise<ApiResponse<void>> {
    if (USE_MOCK_DATA) {
      const meetingIndex = MOCK_MEETINGS.findIndex(m => m.id === meetingId);
      if (meetingIndex === -1) {
        throw new Error('Meeting not found');
      }

      MOCK_MEETINGS.splice(meetingIndex, 1);
      return this.mockResponse<ApiResponse<void>>({
        success: true,
        data: undefined
      });
    }

    return this.request<void>(`/api/meetings/${meetingId}`, {
      method: 'DELETE',
    });
  }

  async startMeeting(meetingId: string): Promise<ApiResponse<Meeting>> {
    return this.request<Meeting>(`/api/meetings/${meetingId}/start`, {
      method: 'POST',
    });
  }

  async endMeeting(meetingId: string): Promise<ApiResponse<Meeting>> {
    return this.request<Meeting>(`/api/meetings/${meetingId}/end`, {
      method: 'POST',
    });
  }

  // Participant Management
  async joinMeeting(meetingId: string, password?: string): Promise<ApiResponse<{ meeting: Meeting; participant: MeetingParticipant }>> {
    if (USE_MOCK_DATA) {
      const meeting = MOCK_MEETINGS.find(m => m.id === meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      const participant: MeetingParticipant = {
        id: `p-${Date.now()}`,
        userId: 'user-1',
        meetingId,
        role: 'attendee',
        status: 'joined',
        joinedAt: new Date().toISOString(),
        mediaState: {
          video: true,
          audio: true,
          screenShare: false
        },
        permissions: {
          canMute: false,
          canUnmute: false,
          canShare: false,
          canRecord: false,
          canManageParticipants: false
        },
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@company.com',
          avatar: 'https://example.com/john-doe.jpg'
        }
      };

      meeting.participants.push(participant);
      meeting.status = 'live';
      meeting.startTime = new Date().toISOString();

      return this.mockResponse<ApiResponse<{ meeting: Meeting; participant: MeetingParticipant }>>({
        success: true,
        data: {
          meeting,
          participant
        }
      });
    }

    return this.request<{ meeting: Meeting; participant: MeetingParticipant }>(`/api/meetings/${meetingId}/join`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async leaveMeeting(meetingId: string): Promise<ApiResponse<void>> {
    if (USE_MOCK_DATA) {
      const meeting = MOCK_MEETINGS.find(m => m.id === meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      meeting.status = 'ended';
      meeting.endTime = new Date().toISOString();

      return this.mockResponse<ApiResponse<void>>({
        success: true,
        data: undefined
      });
    }

    return this.request<void>(`/api/meetings/${meetingId}/leave`, {
      method: 'POST',
    });
  }

  async getMeetingParticipants(meetingId: string): Promise<ApiResponse<MeetingParticipant[]>> {
    return this.request<MeetingParticipant[]>(`/api/meetings/${meetingId}/participants`);
  }

  async updateParticipantRole(
    meetingId: string, 
    participantId: string, 
    role: MeetingParticipant['role']
  ): Promise<ApiResponse<MeetingParticipant>> {
    return this.request<MeetingParticipant>(`/api/meetings/${meetingId}/participants/${participantId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async removeParticipant(meetingId: string, participantId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/meetings/${meetingId}/participants/${participantId}`, {
      method: 'DELETE',
    });
  }

  async muteParticipant(meetingId: string, participantId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/meetings/${meetingId}/participants/${participantId}/mute`, {
      method: 'POST',
    });
  }

  async unmuteParticipant(meetingId: string, participantId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/meetings/${meetingId}/participants/${participantId}/unmute`, {
      method: 'POST',
    });
  }

  // Invitations
  async sendInvites(meetingId: string, invites: { email: string; role: 'presenter' | 'attendee' }[]): Promise<ApiResponse<MeetingInvite[]>> {
    return this.request<MeetingInvite[]>(`/api/meetings/${meetingId}/invites`, {
      method: 'POST',
      body: JSON.stringify({ invites }),
    });
  }

  async respondToInvite(inviteId: string, response: 'accepted' | 'declined'): Promise<ApiResponse<MeetingInvite>> {
    return this.request<MeetingInvite>(`/api/invites/${inviteId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  // Chat
  async getChatMessages(meetingId: string, limit = 50): Promise<ApiResponse<ChatMessage[]>> {
    return this.request<ChatMessage[]>(`/api/meetings/${meetingId}/chat?limit=${limit}`);
  }

  async sendChatMessage(meetingId: string, content: string, isPrivate = false, recipientId?: string): Promise<ApiResponse<ChatMessage>> {
    return this.request<ChatMessage>(`/api/meetings/${meetingId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ content, isPrivate, recipientId }),
    });
  }

  async addChatReaction(messageId: string, emoji: string): Promise<ApiResponse<ChatMessage>> {
    return this.request<ChatMessage>(`/api/chat/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  // Recording
  async startRecording(meetingId: string): Promise<ApiResponse<Recording>> {
    if (USE_MOCK_DATA) {
      const recording: Recording = {
        id: `rec-${Date.now()}`,
        meetingId,
        url: `https://recordings.example.com/${meetingId}`,
        size: 0,
        duration: 0,
        startTime: new Date().toISOString(),
        endTime: '',
        status: 'recording'
      };

      return this.mockResponse<ApiResponse<Recording>>({
        success: true,
        data: recording
      });
    }

    return this.request<Recording>(`/api/meetings/${meetingId}/recording/start`, {
      method: 'POST',
    });
  }

  async stopRecording(meetingId: string): Promise<ApiResponse<Recording>> {
    if (USE_MOCK_DATA) {
      const recording: Recording = {
        id: `rec-${Date.now()}`,
        meetingId,
        url: `https://recordings.example.com/${meetingId}`,
        size: 104857600, // 100MB
        duration: 1800, // 30 minutes
        startTime: new Date(Date.now() - 1800000).toISOString(),
        endTime: new Date().toISOString(),
        status: 'processing'
      };

      return this.mockResponse<ApiResponse<Recording>>({
        success: true,
        data: recording
      });
    }

    return this.request<Recording>(`/api/meetings/${meetingId}/recording/stop`, {
      method: 'POST',
    });
  }

  async getRecordings(meetingId?: string): Promise<ApiResponse<{ id: string; meetingId: string; url: string; duration: number; createdAt: string }[]>> {
    const endpoint = meetingId ? `/api/meetings/${meetingId}/recordings` : '/api/recordings';
    return this.request(endpoint);
  }

  // Transcription
  async getTranscript(meetingId: string): Promise<ApiResponse<MeetingTranscript[]>> {
    return this.request<MeetingTranscript[]>(`/api/meetings/${meetingId}/transcript`);
  }

  async enableLiveCaptions(meetingId: string, language = 'en'): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/meetings/${meetingId}/captions/enable`, {
      method: 'POST',
      body: JSON.stringify({ language }),
    });
  }

  async disableLiveCaptions(meetingId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/meetings/${meetingId}/captions/disable`, {
      method: 'POST',
    });
  }

  // Calendar Integration
  async syncWithCalendar(provider: 'google' | 'outlook', meetingId: string): Promise<ApiResponse<CalendarEvent>> {
    return this.request<CalendarEvent>(`/api/meetings/${meetingId}/calendar/sync`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  }

  async getCalendarEvents(startDate: string, endDate: string): Promise<ApiResponse<CalendarEvent[]>> {
    return this.request<CalendarEvent[]>(`/api/calendar/events?startDate=${startDate}&endDate=${endDate}`);
  }

  // Breakout Rooms
  async createBreakoutRoom(meetingId: string, name: string, participantIds: string[]): Promise<ApiResponse<BreakoutRoom>> {
    return this.request<BreakoutRoom>(`/api/meetings/${meetingId}/breakout-rooms`, {
      method: 'POST',
      body: JSON.stringify({ name, participantIds }),
    });
  }

  async joinBreakoutRoom(meetingId: string, roomId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/meetings/${meetingId}/breakout-rooms/${roomId}/join`, {
      method: 'POST',
    });
  }

  async leaveBreakoutRoom(meetingId: string, roomId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/meetings/${meetingId}/breakout-rooms/${roomId}/leave`, {
      method: 'POST',
    });
  }

  // Analytics
  async getMeetingAnalytics(startDate?: string, endDate?: string): Promise<ApiResponse<MeetingAnalytics>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request<MeetingAnalytics>(`/api/analytics/meetings?${params}`);
  }

  // Real-time WebSocket Connection
  connectToMeeting(meetingId: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(this.baseURL, {
        auth: {
          token: this.authToken,
        },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to meeting server');
        this.socket!.emit('join-meeting', { meetingId });
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Failed to connect to meeting server:', error);
        reject(error);
      });

      this.socket.on('error', (error) => {
        console.error('Meeting socket error:', error);
      });
    });
  }

  disconnectFromMeeting(meetingId: string) {
    if (this.socket) {
      this.socket.emit('leave-meeting', meetingId);
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // WebRTC Signaling
  sendWebRTCOffer(meetingId: string, offer: WebRTCOffer, targetId: string) {
    if (this.socket) {
      this.socket.emit('webrtc-offer', { meetingId, offer, targetId });
    }
  }

  sendWebRTCAnswer(meetingId: string, answer: WebRTCAnswer, targetId: string) {
    if (this.socket) {
      this.socket.emit('webrtc-answer', { meetingId, answer, targetId });
    }
  }

  sendICECandidate(meetingId: string, candidate: ICECandidate, targetId: string) {
    if (this.socket) {
      this.socket.emit('ice-candidate', { meetingId, candidate, targetId });
    }
  }

  // Media Controls
  toggleMedia(meetingId: string, type: 'video' | 'audio', enabled: boolean) {
    if (this.socket) {
      this.socket.emit('toggle-media', { meetingId, type, enabled });
    }
  }

  startScreenShare(meetingId: string) {
    if (this.socket) {
      this.socket.emit('start-screen-share', meetingId);
    }
  }

  stopScreenShare(meetingId: string) {
    if (this.socket) {
      this.socket.emit('stop-screen-share', meetingId);
    }
  }

  // Chat
  sendChatMessageRealtime(meetingId: string, message: ChatMessage) {
    if (this.socket) {
      this.socket.emit('send-chat', { meetingId, message });
    }
  }

  // Event Listeners
  onMeetingJoined(callback: (data: { meeting: Meeting; participants: MeetingParticipant[] }) => void) {
    if (this.socket) {
      this.socket.on('meeting-joined', callback);
    }
  }

  onParticipantJoined(callback: (participant: MeetingParticipant) => void) {
    if (this.socket) {
      this.socket.on('participant-joined', callback);
    }
  }

  onParticipantLeft(callback: (data: { participantId: string; reason?: string }) => void) {
    if (this.socket) {
      this.socket.on('participant-left', callback);
    }
  }

  onMediaStateChanged(callback: (data: { participantId: string; mediaState: any }) => void) {
    if (this.socket) {
      this.socket.on('media-state-changed', callback);
    }
  }

  onChatMessage(callback: (message: ChatMessage) => void) {
    if (this.socket) {
      this.socket.on('chat-message', callback);
    }
  }

  onWebRTCOffer(callback: (data: { offer: WebRTCOffer; fromId: string }) => void) {
    if (this.socket) {
      this.socket.on('webrtc-offer-received', callback);
    }
  }

  onWebRTCAnswer(callback: (data: { answer: WebRTCAnswer; fromId: string }) => void) {
    if (this.socket) {
      this.socket.on('webrtc-answer-received', callback);
    }
  }

  onICECandidate(callback: (data: { candidate: ICECandidate; fromId: string }) => void) {
    if (this.socket) {
      this.socket.on('ice-candidate-received', callback);
    }
  }

  onScreenShareStarted(callback: (data: { participantId: string; streamId: string }) => void) {
    if (this.socket) {
      this.socket.on('screen-share-started', callback);
    }
  }

  onScreenShareStopped(callback: (data: { participantId: string }) => void) {
    if (this.socket) {
      this.socket.on('screen-share-stopped', callback);
    }
  }

  onRecordingStarted(callback: () => void) {
    if (this.socket) {
      this.socket.on('recording-started', callback);
    }
  }

  onRecordingStopped(callback: (data: { recordingUrl: string }) => void) {
    if (this.socket) {
      this.socket.on('recording-stopped', callback);
    }
  }

  onTranscriptionUpdate(callback: (transcript: MeetingTranscript) => void) {
    if (this.socket) {
      this.socket.on('transcription-update', callback);
    }
  }

  onMeetingEnded(callback: (data: { reason: string }) => void) {
    if (this.socket) {
      this.socket.on('meeting-ended', callback);
    }
  }

  // Utility Methods
  generateMeetingId(): string {
    return `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateRoomId(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  validateMeetingTime(startTime: string, endTime: string): boolean {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    
    return start > now && end > start;
  }

  generateMeetingLink(meetingId: string): string {
    return `${window.location.origin}/meetings/${meetingId}`;
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .trim()
      .substring(0, 1000); // Limit length
  }

  private mockResponse<T>(data: T): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, 300 + Math.random() * 700);
    });
  }
}

export default new MeetingAPI(); 