
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Download, 
  Share2, 
  Layers, 
  Move, 
  Type, 
  Square, 
  Circle,
  Pen,
  MousePointer,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const FigmaIntegration: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('select');
  const [zoomLevel, setZoomLevel] = useState(100);

  const tools = [
    { id: 'select', icon: MousePointer, name: 'Select' },
    { id: 'move', icon: Move, name: 'Move' },
    { id: 'pen', icon: Pen, name: 'Pen' },
    { id: 'text', icon: Type, name: 'Text' },
    { id: 'rectangle', icon: Square, name: 'Rectangle' },
    { id: 'circle', icon: Circle, name: 'Circle' },
  ];

  const layers = [
    { id: 1, name: 'Header Component', visible: true, locked: false },
    { id: 2, name: 'Navigation Bar', visible: true, locked: false },
    { id: 3, name: 'Main Content', visible: true, locked: false },
    { id: 4, name: 'Sidebar', visible: false, locked: false },
    { id: 5, name: 'Footer', visible: true, locked: true },
  ];

  return (
    <div className="h-full flex bg-gray-50">
      {/* Tool Panel */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTool(tool.id)}
            className={`w-10 h-10 p-0 ${
              selectedTool === tool.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tool.icon className="w-4 h-4" />
          </Button>
        ))}
        
        <div className="border-t border-gray-200 pt-2 mt-4">
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-600">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-600">
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-800">Mobile App Design</h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">{zoomLevel}%</span>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Prototype
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-100 relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="space-y-6">
                {/* Phone Mockup */}
                <div className="bg-gray-900 rounded-3xl p-2 mx-auto w-64">
                  <div className="bg-white rounded-2xl h-96 p-4 space-y-4">
                    <div className="h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Header</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 bg-purple-100 rounded-lg"></div>
                      <div className="h-16 bg-green-100 rounded-lg"></div>
                    </div>
                    <div className="h-20 bg-yellow-100 rounded-lg"></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Click and drag to edit elements</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Layers & Properties */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Layers</h4>
          <div className="space-y-2">
            {layers.map((layer) => (
              <motion.div
                key={layer.id}
                whileHover={{ backgroundColor: '#f9fafb' }}
                className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer"
              >
                <Layers className="w-4 h-4 text-gray-400" />
                <span className="flex-1 text-sm text-gray-700">{layer.name}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full opacity-50"></div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Properties</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fill</label>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded border"></div>
                <span className="text-sm text-gray-700">#2563EB</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Opacity</label>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
            <Download className="w-4 h-4 mr-2" />
            Export Assets
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FigmaIntegration;
