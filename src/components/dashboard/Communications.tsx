import React from 'react';
import { MessageSquare, Send, Phone, Video, Mail, Bell } from 'lucide-react';

const Communications: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 h-full overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage team communications, messages, and notifications
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Communication Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Today</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Video Calls</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <Video className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
              <Mail className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
              <Bell className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Recent Communications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Communications</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { type: 'message', from: 'John Doe', content: 'Hey team, the new design is ready for review', time: '2 min ago', icon: MessageSquare },
                { type: 'call', from: 'Jane Smith', content: 'Video call ended - 45 minutes', time: '1 hour ago', icon: Video },
                { type: 'email', from: 'Mike Johnson', content: 'Project update sent to stakeholders', time: '3 hours ago', icon: Mail },
                { type: 'message', from: 'Sarah Wilson', content: 'QA testing completed successfully', time: '5 hours ago', icon: MessageSquare },
              ].map((comm, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <comm.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{comm.from}</h3>
                      <span className="text-xs text-gray-500">{comm.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{comm.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
                <p className="text-sm text-gray-500">Send a message to team members</p>
              </div>
            </div>
          </button>

          <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-4">
              <Video className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Start Video Call</h3>
                <p className="text-sm text-gray-500">Begin a video conference</p>
              </div>
            </div>
          </button>

          <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-4">
              <Mail className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Send Email</h3>
                <p className="text-sm text-gray-500">Compose and send an email</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Communications; 