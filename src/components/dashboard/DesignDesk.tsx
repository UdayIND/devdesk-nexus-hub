
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Users, 
  Share,
  Settings,
  Calendar,
  Clock,
  MessageSquare,
  ScreenShare,
  Camera,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DesignDesk: React.FC = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeView, setActiveView] = useState('meetings');

  const upcomingMeetings = [
    {
      id: 1,
      title: 'Daily Standup',
      time: '9:00 AM',
      participants: 8,
      status: 'starting-soon',
      duration: '30 min'
    },
    {
      id: 2,
      title: 'Design Review',
      time: '2:00 PM',
      participants: 5,
      status: 'scheduled',
      duration: '1 hour'
    },
    {
      id: 3,
      title: 'Client Presentation',
      time: '4:30 PM',
      participants: 12,
      status: 'scheduled',
      duration: '45 min'
    },
  ];

  const participants = [
    { id: 1, name: 'John Doe', role: 'Host', video: true, audio: true, avatar: 'JD' },
    { id: 2, name: 'Jane Smith', role: 'Presenter', video: true, audio: false, avatar: 'JS' },
    { id: 3, name: 'Mike Wilson', role: 'Participant', video: false, audio: true, avatar: 'MW' },
    { id: 4, name: 'Sarah Johnson', role: 'Participant', video: true, audio: true, avatar: 'SJ' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'starting-soon':
        return 'bg-orange-100 text-orange-800';
      case 'live':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Design Desk - Video Collaboration</h2>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Video className="w-4 h-4 mr-2" />
                Start Instant Meeting
              </Button>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              variant={activeView === 'meetings' ? 'default' : 'outline'}
              onClick={() => setActiveView('meetings')}
            >
              Meetings
            </Button>
            <Button
              variant={activeView === 'live' ? 'default' : 'outline'}
              onClick={() => setActiveView('live')}
            >
              Live Session
            </Button>
          </div>
        </motion.div>

        {activeView === 'meetings' ? (
          // Meetings View
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Meetings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Schedule</h3>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-800">{meeting.title}</h4>
                          <p className="text-sm text-gray-600">{meeting.time} • {meeting.duration}</p>
                        </div>
                      </div>
                      <Badge className={getStatusBadge(meeting.status)}>
                        {meeting.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{meeting.participants} participants</span>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Join Meeting
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Video className="w-4 h-4 mr-3" />
                    Start Video Call
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="w-4 h-4 mr-3" />
                    Audio Only Call
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <ScreenShare className="w-4 h-4 mr-3" />
                    Share Screen
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-3" />
                    Chat Room
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Recordings</h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    Design Review - March 15
                  </div>
                  <div className="text-sm text-gray-600 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    Client Demo - March 12
                  </div>
                  <div className="text-sm text-gray-600 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    Team Standup - March 10
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Live Session View
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Video Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 bg-black rounded-xl overflow-hidden"
            >
              <div className="aspect-video relative">
                {/* Main Video Feed */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Camera is off</p>
                  </div>
                </div>

                {/* Participant Video Tiles */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  {participants.slice(0, 3).map((participant) => (
                    <div
                      key={participant.id}
                      className="w-24 h-16 bg-gray-800 rounded-lg relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{participant.avatar}</span>
                      </div>
                      {!participant.video && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <VideoOff className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4">
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant={isAudioOn ? 'secondary' : 'destructive'}
                      size="sm"
                      onClick={() => setIsAudioOn(!isAudioOn)}
                      className="rounded-full w-12 h-12 p-0"
                    >
                      {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant={isVideoOn ? 'secondary' : 'destructive'}
                      size="sm"
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      className="rounded-full w-12 h-12 p-0"
                    >
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant={isScreenSharing ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setIsScreenSharing(!isScreenSharing)}
                      className="rounded-full w-12 h-12 p-0"
                    >
                      <ScreenShare className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full w-12 h-12 p-0"
                    >
                      <PhoneOff className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Participants & Chat Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Participants ({participants.length})</h3>
              </div>
              
              <div className="flex-1 p-4 space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {participant.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{participant.name}</p>
                      <p className="text-xs text-gray-500">{participant.role}</p>
                    </div>
                    <div className="flex space-x-1">
                      {participant.audio ? (
                        <Volume2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <MicOff className="w-3 h-3 text-red-500" />
                      )}
                      {participant.video ? (
                        <Video className="w-3 h-3 text-green-500" />
                      ) : (
                        <VideoOff className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignDesk;
