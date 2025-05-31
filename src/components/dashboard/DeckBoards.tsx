
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Pen, 
  Eraser, 
  Type, 
  Shapes, 
  Image, 
  Sticky,
  MousePointer,
  Download,
  Share2,
  Users,
  Palette,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const DeckBoards: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);

  const tools = [
    { id: 'select', icon: MousePointer, name: 'Select' },
    { id: 'pen', icon: Pen, name: 'Pen' },
    { id: 'eraser', icon: Eraser, name: 'Eraser' },
    { id: 'text', icon: Type, name: 'Text' },
    { id: 'shapes', icon: Shapes, name: 'Shapes' },
    { id: 'sticky', icon: Sticky, name: 'Sticky Note' },
    { id: 'image', icon: Image, name: 'Image' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
  ];

  const collaborators = [
    { id: 1, name: 'John Doe', color: '#3B82F6', active: true },
    { id: 2, name: 'Jane Smith', color: '#EF4444', active: true },
    { id: 3, name: 'Mike Wilson', color: '#10B981', active: false },
  ];

  return (
    <div className="h-full flex bg-gray-50">
      {/* Left Toolbar */}
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-3">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTool(tool.id)}
            className={`w-12 h-12 p-0 ${
              selectedTool === tool.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            title={tool.name}
          >
            <tool.icon className="w-5 h-5" />
          </Button>
        ))}
        
        <div className="border-t border-gray-200 pt-3 mt-4 space-y-2">
          <Button variant="ghost" size="sm" className="w-12 h-12 p-0 text-gray-600" title="Undo">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-12 h-12 p-0 text-gray-600" title="Redo">
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-800">Project Brainstorm</h3>
            
            {/* Color Palette */}
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gray-600" />
              <div className="flex space-x-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setStrokeColor(color)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      strokeColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Width:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600 w-6">{strokeWidth}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Collaborators */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-600" />
              <div className="flex -space-x-1">
                {collaborators.map((user) => (
                  <div
                    key={user.id}
                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium ${
                      user.active ? 'ring-2 ring-green-400' : ''
                    }`}
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">100%</span>
              <Button variant="ghost" size="sm">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-white">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" className="pointer-events-none">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Sample Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 p-8"
          >
            {/* Sticky Notes */}
            <div className="absolute top-20 left-20 w-48 h-32 bg-yellow-200 rounded-lg p-4 shadow-lg transform rotate-2">
              <p className="text-sm font-medium text-gray-800">User Authentication</p>
              <p className="text-xs text-gray-600 mt-2">
                - Login/Register
                - OAuth integration
                - Password reset
              </p>
            </div>

            <div className="absolute top-32 right-32 w-48 h-32 bg-blue-200 rounded-lg p-4 shadow-lg transform -rotate-1">
              <p className="text-sm font-medium text-gray-800">Dashboard Features</p>
              <p className="text-xs text-gray-600 mt-2">
                - Analytics charts
                - Real-time updates
                - Customizable widgets
              </p>
            </div>

            <div className="absolute bottom-40 left-40 w-48 h-32 bg-green-200 rounded-lg p-4 shadow-lg transform rotate-1">
              <p className="text-sm font-medium text-gray-800">API Integration</p>
              <p className="text-xs text-gray-600 mt-2">
                - REST endpoints
                - GraphQL support
                - Rate limiting
              </p>
            </div>

            {/* Drawn Connections */}
            <svg className="absolute inset-0 pointer-events-none">
              <path
                d="M 170 150 Q 300 200 420 180"
                stroke="#6366f1"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
              />
              <path
                d="M 200 280 Q 350 350 500 320"
                stroke="#10b981"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
              />
            </svg>

            {/* Text Annotations */}
            <div className="absolute top-60 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-lg font-semibold text-gray-800 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow">
                Core Features Mindmap
              </p>
            </div>
          </motion.div>

          {/* Drawing Area Overlay */}
          <div className="absolute inset-0 cursor-crosshair" />
        </div>
      </div>

      {/* Right Panel - Tools & Layers */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Layers</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-blue-50">
              <Type className="w-4 h-4 text-blue-600" />
              <span className="flex-1 text-sm text-gray-700">Core Features Text</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <Sticky className="w-4 h-4 text-yellow-600" />
              <span className="flex-1 text-sm text-gray-700">Sticky Notes</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <Pen className="w-4 h-4 text-purple-600" />
              <span className="flex-1 text-sm text-gray-700">Connections</span>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Properties</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Opacity</label>
              <input type="range" min="0" max="100" className="w-full" defaultValue="100" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Border Radius</label>
              <input type="range" min="0" max="20" className="w-full" defaultValue="8" />
            </div>
          </div>
        </div>

        <div className="p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Templates</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="aspect-square bg-gray-100 rounded-lg p-2 cursor-pointer hover:bg-gray-200 transition-colors">
              <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 rounded"></div>
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg p-2 cursor-pointer hover:bg-gray-200 transition-colors">
              <div className="w-full h-full bg-gradient-to-br from-green-200 to-blue-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckBoards;
