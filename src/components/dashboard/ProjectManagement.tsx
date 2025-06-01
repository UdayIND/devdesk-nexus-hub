import React from 'react';
import { Calendar, CheckCircle, Clock, Users, Plus, Filter } from 'lucide-react';

const ProjectManagement: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 h-full overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track projects, tasks, and deadlines
              </p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">34</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <button className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filter</span>
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Website Redesign', status: 'In Progress', progress: 75, team: 5, deadline: '2024-02-15' },
                { name: 'Mobile App Development', status: 'Planning', progress: 25, team: 8, deadline: '2024-03-01' },
                { name: 'API Integration', status: 'In Progress', progress: 60, team: 3, deadline: '2024-01-30' },
                { name: 'User Research Study', status: 'Completed', progress: 100, team: 4, deadline: '2024-01-15' },
              ].map((project, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                        <span className="text-sm text-gray-500">Due: {project.deadline}</span>
                        <span className="text-sm text-gray-500">{project.team} members</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{project.progress}%</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            project.progress === 100 ? 'bg-green-500' :
                            project.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
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
              <Plus className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create Project</h3>
                <p className="text-sm text-gray-500">Start a new project</p>
              </div>
            </div>
          </button>

          <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Calendar</h3>
                <p className="text-sm text-gray-500">See project timelines</p>
              </div>
            </div>
          </button>

          <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Teams</h3>
                <p className="text-sm text-gray-500">Assign team members</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement; 