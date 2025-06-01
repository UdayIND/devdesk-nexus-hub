import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import MeetingAPI, {
  Meeting,
  MeetingParticipant,
  ChatMessage,
  MeetingTranscript,
  WebRTCOffer,
  WebRTCAnswer,
  ICECandidate,
  MeetingSettings,
} from '@/lib/meeting-api';
import { useToast } from '@/hooks/use-toast';

interface UseMeetingOptions {
  meetingId?: string;
  enableVideo?: boolean;
  enableAudio?: boolean;
  enableScreenShare?: boolean;
  enableChat?: boolean;
  enableTranscription?: boolean;
  autoJoin?: boolean;
}

interface MediaDevices {
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  selectedVideoDevice?: string;
  selectedAudioDevice?: string;
}

interface ConnectionQuality {
  latency: number;
  jitter: number;
  packetLoss: number;
  bandwidth: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface WebRTCState {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  peerConnections: Map<string, RTCPeerConnection>;
  screenShareStream: MediaStream | null;
  isScreenSharing: boolean;
  connectionQuality: ConnectionQuality;
}

export const useMeeting = (options: UseMeetingOptions = {}) => {
  const {
    meetingId,
    enableVideo = true,
    enableAudio = true,
    enableScreenShare = true,
    enableChat = true,
    enableTranscription = false,
    autoJoin = false,
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const meetingAPI = useRef(new MeetingAPI());
  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  // State management
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<MeetingParticipant | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [transcripts, setTranscripts] = useState<MeetingTranscript[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(enableVideo);
  const [isAudioEnabled, setIsAudioEnabled] = useState(enableAudio);
  const [isRecording, setIsRecording] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [mediaDevices, setMediaDevices] = useState<MediaDevices>({
    videoDevices: [],
    audioDevices: [],
  });
  const [webrtcState, setWebRTCState] = useState<WebRTCState>({
    localStream: null,
    remoteStreams: new Map(),
    peerConnections: new Map(),
    screenShareStream: null,
    isScreenSharing: false,
    connectionQuality: {
      latency: 0,
      jitter: 0,
      packetLoss: 0,
      bandwidth: 0,
      quality: 'excellent',
    },
  });

  // WebRTC Configuration
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // Add TURN servers for production
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'password'
      // }
    ],
    iceCandidatePoolSize: 10,
  };

  // Queries
  const {
    data: meetingData,
    isLoading: isMeetingLoading,
    error: meetingError,
  } = useQuery({
    queryKey: ['meeting', meetingId],
    queryFn: () => meetingId ? meetingAPI.current.getMeeting(meetingId) : null,
    enabled: !!meetingId,
    staleTime: 30000,
  });

  const {
    data: participantsData,
    isLoading: isParticipantsLoading,
  } = useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: () => meetingId ? meetingAPI.current.getMeetingParticipants(meetingId) : null,
    enabled: !!meetingId && isJoined,
    refetchInterval: 10000,
  });

  // Mutations
  const joinMeetingMutation = useMutation({
    mutationFn: ({ meetingId, password }: { meetingId: string; password?: string }) =>
      meetingAPI.current.joinMeeting(meetingId, password),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setMeeting(response.data.meeting);
        setCurrentParticipant(response.data.participant);
        setIsJoined(true);
        toast({
          title: 'Joined Meeting',
          description: `Welcome to "${response.data.meeting.title}"`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to Join Meeting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const leaveMeetingMutation = useMutation({
    mutationFn: (meetingId: string) => meetingAPI.current.leaveMeeting(meetingId),
    onSuccess: () => {
      setIsJoined(false);
      cleanupWebRTC();
      toast({
        title: 'Left Meeting',
        description: 'You have left the meeting',
      });
    },
  });

  const sendChatMutation = useMutation({
    mutationFn: ({ meetingId, content, isPrivate, recipientId }: {
      meetingId: string;
      content: string;
      isPrivate?: boolean;
      recipientId?: string;
    }) => meetingAPI.current.sendChatMessage(meetingId, content, isPrivate, recipientId),
    onError: (error) => {
      toast({
        title: 'Failed to Send Message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const startRecordingMutation = useMutation({
    mutationFn: (meetingId: string) => meetingAPI.current.startRecording(meetingId),
    onSuccess: () => {
      setIsRecording(true);
      toast({
        title: 'Recording Started',
        description: 'Meeting is now being recorded',
      });
    },
  });

  const stopRecordingMutation = useMutation({
    mutationFn: (meetingId: string) => meetingAPI.current.stopRecording(meetingId),
    onSuccess: () => {
      setIsRecording(false);
      toast({
        title: 'Recording Stopped',
        description: 'Recording has been saved',
      });
    },
  });

  // Media Device Management
  const getMediaDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      setMediaDevices({
        videoDevices,
        audioDevices,
        selectedVideoDevice: videoDevices[0]?.deviceId,
        selectedAudioDevice: audioDevices[0]?.deviceId,
      });
    } catch (error) {
      console.error('Failed to get media devices:', error);
    }
  }, []);

  const getUserMedia = useCallback(async (constraints: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setWebRTCState(prev => ({ ...prev, localStream: stream }));
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      toast({
        title: 'Media Access Failed',
        description: 'Could not access camera or microphone',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const getScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      
      setWebRTCState(prev => ({
        ...prev,
        screenShareStream: stream,
        isScreenSharing: true,
      }));
      
      // Handle screen share end
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });
      
      return stream;
    } catch (error) {
      console.error('Failed to get screen share:', error);
      toast({
        title: 'Screen Share Failed',
        description: 'Could not start screen sharing',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // WebRTC Functions
  const createPeerConnection = useCallback((participantId: string) => {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    
    // Add local stream tracks
    if (webrtcState.localStream) {
      webrtcState.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, webrtcState.localStream!);
      });
    }
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setWebRTCState(prev => {
        const newRemoteStreams = new Map(prev.remoteStreams);
        newRemoteStreams.set(participantId, remoteStream);
        return { ...prev, remoteStreams: newRemoteStreams };
      });
      
      // Attach to video element
      const videoElement = remoteVideoRefs.current.get(participantId);
      if (videoElement) {
        videoElement.srcObject = remoteStream;
      }
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && meetingId) {
        meetingAPI.current.sendICECandidate(meetingId, {
          candidate: event.candidate.candidate,
          sdpMLineIndex: event.candidate.sdpMLineIndex || 0,
          sdpMid: event.candidate.sdpMid || '',
          participantId: currentParticipant?.id || '',
        }, participantId);
      }
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${participantId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'failed') {
        // Attempt to restart ICE
        peerConnection.restartIce();
      }
    };
    
    setWebRTCState(prev => {
      const newPeerConnections = new Map(prev.peerConnections);
      newPeerConnections.set(participantId, peerConnection);
      return { ...prev, peerConnections: newPeerConnections };
    });
    
    return peerConnection;
  }, [webrtcState.localStream, meetingId, currentParticipant]);

  const createOffer = useCallback(async (participantId: string) => {
    const peerConnection = webrtcState.peerConnections.get(participantId) || createPeerConnection(participantId);
    
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      if (meetingId) {
        meetingAPI.current.sendWebRTCOffer(meetingId, {
          type: 'offer',
          sdp: offer.sdp || '',
          participantId: currentParticipant?.id || '',
        }, participantId);
      }
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  }, [webrtcState.peerConnections, createPeerConnection, meetingId, currentParticipant]);

  const handleOffer = useCallback(async (offer: WebRTCOffer, fromId: string) => {
    const peerConnection = webrtcState.peerConnections.get(fromId) || createPeerConnection(fromId);
    
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription({
        type: 'offer',
        sdp: offer.sdp,
      }));
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      if (meetingId) {
        meetingAPI.current.sendWebRTCAnswer(meetingId, {
          type: 'answer',
          sdp: answer.sdp || '',
          participantId: currentParticipant?.id || '',
        }, fromId);
      }
    } catch (error) {
      console.error('Failed to handle offer:', error);
    }
  }, [webrtcState.peerConnections, createPeerConnection, meetingId, currentParticipant]);

  const handleAnswer = useCallback(async (answer: WebRTCAnswer, fromId: string) => {
    const peerConnection = webrtcState.peerConnections.get(fromId);
    
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: answer.sdp,
        }));
      } catch (error) {
        console.error('Failed to handle answer:', error);
      }
    }
  }, [webrtcState.peerConnections]);

  const handleICECandidate = useCallback(async (candidate: ICECandidate, fromId: string) => {
    const peerConnection = webrtcState.peerConnections.get(fromId);
    
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate({
          candidate: candidate.candidate,
          sdpMLineIndex: candidate.sdpMLineIndex,
          sdpMid: candidate.sdpMid,
        }));
      } catch (error) {
        console.error('Failed to add ICE candidate:', error);
      }
    }
  }, [webrtcState.peerConnections]);

  const cleanupWebRTC = useCallback(() => {
    // Stop local stream
    if (webrtcState.localStream) {
      webrtcState.localStream.getTracks().forEach(track => track.stop());
    }
    
    // Stop screen share
    if (webrtcState.screenShareStream) {
      webrtcState.screenShareStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connections
    webrtcState.peerConnections.forEach(pc => pc.close());
    
    setWebRTCState({
      localStream: null,
      remoteStreams: new Map(),
      peerConnections: new Map(),
      screenShareStream: null,
      isScreenSharing: false,
      connectionQuality: {
        latency: 0,
        jitter: 0,
        packetLoss: 0,
        bandwidth: 0,
        quality: 'excellent',
      },
    });
  }, [webrtcState]);

  // Real-time connection setup
  useEffect(() => {
    if (!meetingId || !isJoined) return;

    const connectToMeeting = async () => {
      try {
        const socket = await meetingAPI.current.connectToMeeting(meetingId);
        socketRef.current = socket;
        setIsConnected(true);

        // Set up event listeners
        meetingAPI.current.onMeetingJoined(({ meeting, participants }) => {
          setMeeting(meeting);
          setParticipants(participants);
        });

        meetingAPI.current.onParticipantJoined((participant) => {
          setParticipants(prev => [...prev.filter(p => p.id !== participant.id), participant]);
          // Create offer for new participant
          if (participant.id !== currentParticipant?.id) {
            createOffer(participant.id);
          }
        });

        meetingAPI.current.onParticipantLeft(({ participantId }) => {
          setParticipants(prev => prev.filter(p => p.id !== participantId));
          // Clean up peer connection
          const peerConnection = webrtcState.peerConnections.get(participantId);
          if (peerConnection) {
            peerConnection.close();
            setWebRTCState(prev => {
              const newPeerConnections = new Map(prev.peerConnections);
              const newRemoteStreams = new Map(prev.remoteStreams);
              newPeerConnections.delete(participantId);
              newRemoteStreams.delete(participantId);
              return {
                ...prev,
                peerConnections: newPeerConnections,
                remoteStreams: newRemoteStreams,
              };
            });
          }
        });

        meetingAPI.current.onChatMessage((message) => {
          setChatMessages(prev => [...prev, message]);
        });

        meetingAPI.current.onWebRTCOffer(({ offer, fromId }) => {
          handleOffer(offer, fromId);
        });

        meetingAPI.current.onWebRTCAnswer(({ answer, fromId }) => {
          handleAnswer(answer, fromId);
        });

        meetingAPI.current.onICECandidate(({ candidate, fromId }) => {
          handleICECandidate(candidate, fromId);
        });

        meetingAPI.current.onRecordingStarted(() => {
          setIsRecording(true);
        });

        meetingAPI.current.onRecordingStopped(() => {
          setIsRecording(false);
        });

        meetingAPI.current.onTranscriptionUpdate((transcript) => {
          setTranscripts(prev => [...prev, transcript]);
        });

        meetingAPI.current.onMeetingEnded(() => {
          setIsJoined(false);
          cleanupWebRTC();
          toast({
            title: 'Meeting Ended',
            description: 'The meeting has been ended by the host',
          });
        });

      } catch (error) {
        console.error('Failed to connect to meeting:', error);
        setIsConnected(false);
        toast({
          title: 'Connection Failed',
          description: 'Failed to connect to meeting server',
          variant: 'destructive',
        });
      }
    };

    connectToMeeting();

    return () => {
      if (socketRef.current && meetingId) {
        meetingAPI.current.disconnectFromMeeting(meetingId);
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [meetingId, isJoined, currentParticipant, createOffer, handleOffer, handleAnswer, handleICECandidate, cleanupWebRTC, toast]);

  // Initialize media devices
  useEffect(() => {
    getMediaDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getMediaDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getMediaDevices);
    };
  }, [getMediaDevices]);

  // Auto-join if enabled
  useEffect(() => {
    if (autoJoin && meetingId && !isJoined && meetingData?.success) {
      joinMeeting(meetingId);
    }
  }, [autoJoin, meetingId, isJoined, meetingData]);

  // Update state when data changes
  useEffect(() => {
    if (meetingData?.success && meetingData.data) {
      setMeeting(meetingData.data);
    }
  }, [meetingData]);

  useEffect(() => {
    if (participantsData?.success && participantsData.data) {
      setParticipants(participantsData.data);
    }
  }, [participantsData]);

  // Public API
  const joinMeeting = useCallback(async (meetingId: string, password?: string) => {
    try {
      // Get user media first
      const constraints: MediaStreamConstraints = {
        video: isVideoEnabled ? {
          deviceId: mediaDevices.selectedVideoDevice,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        } : false,
        audio: isAudioEnabled ? {
          deviceId: mediaDevices.selectedAudioDevice,
          echoCancellation: true,
          noiseSuppression: true,
        } : false,
      };
      
      await getUserMedia(constraints);
      joinMeetingMutation.mutate({ meetingId, password });
    } catch (error) {
      console.error('Failed to join meeting:', error);
    }
  }, [isVideoEnabled, isAudioEnabled, mediaDevices, getUserMedia, joinMeetingMutation]);

  const leaveMeeting = useCallback(() => {
    if (meetingId) {
      leaveMeetingMutation.mutate(meetingId);
    }
  }, [meetingId, leaveMeetingMutation]);

  const toggleVideo = useCallback(async () => {
    if (webrtcState.localStream) {
      const videoTrack = webrtcState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        if (meetingId) {
          meetingAPI.current.toggleMedia(meetingId, 'video', videoTrack.enabled);
        }
      }
    }
  }, [webrtcState.localStream, meetingId]);

  const toggleAudio = useCallback(async () => {
    if (webrtcState.localStream) {
      const audioTrack = webrtcState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        if (meetingId) {
          meetingAPI.current.toggleMedia(meetingId, 'audio', audioTrack.enabled);
        }
      }
    }
  }, [webrtcState.localStream, meetingId]);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await getScreenShare();
      
      if (meetingId) {
        meetingAPI.current.startScreenShare(meetingId);
      }
      
      // Replace video track in peer connections
      webrtcState.peerConnections.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender && screenStream.getVideoTracks()[0]) {
          await sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }
      });
    } catch (error) {
      console.error('Failed to start screen share:', error);
    }
  }, [getScreenShare, meetingId, webrtcState.peerConnections]);

  const stopScreenShare = useCallback(async () => {
    if (webrtcState.screenShareStream) {
      webrtcState.screenShareStream.getTracks().forEach(track => track.stop());
      
      setWebRTCState(prev => ({
        ...prev,
        screenShareStream: null,
        isScreenSharing: false,
      }));
      
      if (meetingId) {
        meetingAPI.current.stopScreenShare(meetingId);
      }
      
      // Replace back to camera
      if (webrtcState.localStream) {
        const videoTrack = webrtcState.localStream.getVideoTracks()[0];
        webrtcState.peerConnections.forEach(async (pc) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }
        });
      }
    }
  }, [webrtcState.screenShareStream, webrtcState.localStream, webrtcState.peerConnections, meetingId]);

  const sendChatMessage = useCallback((content: string, isPrivate = false, recipientId?: string) => {
    if (meetingId) {
      sendChatMutation.mutate({ meetingId, content, isPrivate, recipientId });
    }
  }, [meetingId, sendChatMutation]);

  const startRecording = useCallback(() => {
    if (meetingId) {
      startRecordingMutation.mutate(meetingId);
    }
  }, [meetingId, startRecordingMutation]);

  const stopRecording = useCallback(() => {
    if (meetingId) {
      stopRecordingMutation.mutate(meetingId);
    }
  }, [meetingId, stopRecordingMutation]);

  const raiseHand = useCallback(() => {
    if (meetingId && socketRef.current) {
      socketRef.current.emit('raise-hand', meetingId);
      setIsHandRaised(true);
    }
  }, [meetingId]);

  const lowerHand = useCallback(() => {
    if (meetingId && socketRef.current) {
      socketRef.current.emit('lower-hand', meetingId);
      setIsHandRaised(false);
    }
  }, [meetingId]);

  const setVideoDevice = useCallback(async (deviceId: string) => {
    setMediaDevices(prev => ({ ...prev, selectedVideoDevice: deviceId }));
    
    if (webrtcState.localStream && isVideoEnabled) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId },
          audio: false,
        });
        
        const videoTrack = newStream.getVideoTracks()[0];
        const oldVideoTrack = webrtcState.localStream.getVideoTracks()[0];
        
        // Replace track in local stream
        webrtcState.localStream.removeTrack(oldVideoTrack);
        webrtcState.localStream.addTrack(videoTrack);
        
        // Replace track in peer connections
        webrtcState.peerConnections.forEach(async (pc) => {
          const sender = pc.getSenders().find(s => s.track === oldVideoTrack);
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
        });
        
        oldVideoTrack.stop();
      } catch (error) {
        console.error('Failed to change video device:', error);
      }
    }
  }, [webrtcState.localStream, webrtcState.peerConnections, isVideoEnabled]);

  const setAudioDevice = useCallback(async (deviceId: string) => {
    setMediaDevices(prev => ({ ...prev, selectedAudioDevice: deviceId }));
    
    if (webrtcState.localStream && isAudioEnabled) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: { deviceId },
        });
        
        const audioTrack = newStream.getAudioTracks()[0];
        const oldAudioTrack = webrtcState.localStream.getAudioTracks()[0];
        
        // Replace track in local stream
        webrtcState.localStream.removeTrack(oldAudioTrack);
        webrtcState.localStream.addTrack(audioTrack);
        
        // Replace track in peer connections
        webrtcState.peerConnections.forEach(async (pc) => {
          const sender = pc.getSenders().find(s => s.track === oldAudioTrack);
          if (sender) {
            await sender.replaceTrack(audioTrack);
          }
        });
        
        oldAudioTrack.stop();
      } catch (error) {
        console.error('Failed to change audio device:', error);
      }
    }
  }, [webrtcState.localStream, webrtcState.peerConnections, isAudioEnabled]);

  return {
    // State
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
    
    // Loading states
    isLoading: isMeetingLoading || isParticipantsLoading,
    error: meetingError,
    
    // Meeting functions
    joinMeeting,
    leaveMeeting,
    
    // Media functions
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    setVideoDevice,
    setAudioDevice,
    
    // Communication functions
    sendChatMessage,
    raiseHand,
    lowerHand,
    
    // Recording functions
    startRecording,
    stopRecording,
    
    // Refs for video elements
    localVideoRef,
    remoteVideoRefs,
    
    // Utility functions
    formatDuration: meetingAPI.current.formatDuration,
    generateMeetingLink: meetingAPI.current.generateMeetingLink,
  };
};

export default useMeeting; 