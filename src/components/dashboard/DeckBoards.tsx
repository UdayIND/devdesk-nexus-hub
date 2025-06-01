import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pen, 
  Eraser, 
  Type, 
  Shapes, 
  Image, 
  StickyNote,
  MousePointer,
  Download,
  Share2,
  Users,
  Palette,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Grid,
  Plus,
  Minus,
  Square,
  Circle,
  Triangle,
  ArrowRight,
  Highlighter,
  Save,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  RotateCcw,
  Move,
  Hand,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Activity,
  Clock,
  MessageCircle,
  Bell,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import useWhiteboard from '@/hooks/useWhiteboard';
import BoardManager from './BoardManager';

interface DeckBoardsProps {
  boardId?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

interface Cursor {
  id: string;
  x: number;
  y: number;
  color: string;
  user: {
    name: string;
    avatar?: string;
  };
}

interface Comment {
  id: string;
  x: number;
  y: number;
  text: string;
  author: string;
  timestamp: string;
  resolved: boolean;
}

const DeckBoards: React.FC<DeckBoardsProps> = ({ 
  boardId: initialBoardId, 
  isFullscreen = false, 
  onToggleFullscreen 
}) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentBoardId, setCurrentBoardId] = useState<string | undefined>(initialBoardId);
  const [showBoardManager, setShowBoardManager] = useState(!currentBoardId);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState<{ x: number; y: number; text: string } | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [showCollaborators, setShowCollaborators] = useState(true);
  const [showMinimap, setShowMinimap] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const {
    board,
    elements,
    collaborators,
    drawingState,
    viewportState,
    selectionState,
    hasUnsavedChanges,
    isLoading,
    error,
    startDrawing,
    continueDrawing,
    endDrawing,
    createElement,
    updateElement,
    deleteElement,
    deleteSelectedElements,
    selectElement,
    clearSelection,
    setZoom,
    setPan,
    resetViewport,
    undo,
    redo,
    canUndo,
    canRedo,
    setTool,
    setStrokeColor,
    setStrokeWidth,
    setFillColor,
    updateCursor,
    saveBoard,
  } = useWhiteboard({
    boardId: currentBoardId,
    enableRealTime: true,
    autoSave,
  });

  const tools = [
    { id: 'select', icon: MousePointer, name: 'Select', shortcut: 'V' },
    { id: 'pan', icon: Hand, name: 'Pan', shortcut: 'H' },
    { id: 'pen', icon: Pen, name: 'Pen', shortcut: 'P' },
    { id: 'highlighter', icon: Highlighter, name: 'Highlighter', shortcut: 'H' },
    { id: 'eraser', icon: Eraser, name: 'Eraser', shortcut: 'E' },
    { id: 'text', icon: Type, name: 'Text', shortcut: 'T' },
    { id: 'sticky-note', icon: StickyNote, name: 'Sticky Note', shortcut: 'S' },
    { id: 'shape', icon: Shapes, name: 'Shapes', shortcut: 'R' },
    { id: 'image', icon: Image, name: 'Image', shortcut: 'I' },
  ] as const;

  const shapes = [
    { id: 'rectangle', icon: Square, name: 'Rectangle' },
    { id: 'circle', icon: Circle, name: 'Circle' },
    { id: 'triangle', icon: Triangle, name: 'Triangle' },
    { id: 'arrow', icon: ArrowRight, name: 'Arrow' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
    '#8B4513', '#808080', '#000080', '#008000', '#800000',
    '#008080', '#C0C0C0', '#FFFFFF'
  ];

  const strokeWidths = [1, 2, 3, 5, 8, 12, 16, 20];

  // Mock collaborators for demo
  const mockCollaborators = [
    { id: '1', name: 'John Doe', color: '#3B82F6', active: true, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    { id: '2', name: 'Jane Smith', color: '#EF4444', active: true, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face' },
    { id: '3', name: 'Mike Wilson', color: '#10B981', active: false, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
    { id: '4', name: 'Sarah Johnson', color: '#F59E0B', active: true, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            e.preventDefault();
            saveBoard();
            break;
          case 'a':
            e.preventDefault();
            // Select all elements
            break;
          case 'd':
            e.preventDefault();
            // Duplicate selected elements
            break;
          case 'Backspace':
          case 'Delete':
            e.preventDefault();
            deleteSelectedElements();
            break;
        }
      } else {
        switch (e.key) {
          case 'v':
            setTool('select');
            break;
          case 'h':
            setTool('pan');
            break;
          case 'p':
            setTool('pen');
            break;
          case 'e':
            setTool('eraser');
            break;
          case 't':
            setTool('text');
            break;
          case 's':
            setTool('sticky-note');
            break;
          case 'r':
            setTool('shape');
            break;
          case 'i':
            setTool('image');
            break;
          case 'Escape':
            clearSelection();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveBoard, deleteSelectedElements, setTool, clearSelection]);

  // Canvas drawing logic
  const getCanvasPoint = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewportState.panX) / viewportState.zoom;
    const y = (e.clientY - rect.top - viewportState.panY) / viewportState.zoom;
    
    if (snapToGrid) {
      const gridSize = 20;
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
      };
    }
    
    return { x, y };
  }, [viewportState, snapToGrid]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const point = getCanvasPoint(e);
    
    if (drawingState.tool === 'pen' || drawingState.tool === 'highlighter' || drawingState.tool === 'eraser') {
      setIsDrawing(true);
      setLastPoint(point);
      startDrawing(point.x, point.y, 0.5);
    } else if (drawingState.tool === 'text') {
      // Create text element
      createElement('text', {
        text: 'Click to edit',
        fontSize: 16,
        fontFamily: 'Arial',
        color: drawingState.strokeColor,
        alignment: 'left',
      }, point);
    } else if (drawingState.tool === 'sticky-note') {
      // Create sticky note
      createElement('sticky-note', {
        text: 'New note',
        color: '#FFEB3B',
        fontSize: 14,
      }, point);
    }
  }, [drawingState.tool, getCanvasPoint, startDrawing, createElement, drawingState.strokeColor]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const point = getCanvasPoint(e);
    
    // Update cursor position for real-time collaboration
    updateCursor(point.x, point.y);
    
    if (isDrawing && lastPoint && (drawingState.tool === 'pen' || drawingState.tool === 'highlighter' || drawingState.tool === 'eraser')) {
      continueDrawing(point.x, point.y, 0.5);
      setLastPoint(point);
    }
  }, [isDrawing, lastPoint, drawingState.tool, getCanvasPoint, continueDrawing, updateCursor]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
      endDrawing();
    }
  }, [isDrawing, endDrawing]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(5, viewportState.zoom * zoomFactor));
      setZoom(newZoom);
    } else {
      // Pan
      setPan(
        viewportState.panX - e.deltaX,
        viewportState.panY - e.deltaY
      );
    }
  }, [viewportState, setZoom, setPan]);

  const handleAddComment = useCallback((x: number, y: number) => {
    setNewComment({ x, y, text: '' });
  }, []);

  const handleSaveComment = useCallback(() => {
    if (newComment && newComment.text.trim()) {
      const comment: Comment = {
        id: `comment_${Date.now()}`,
        x: newComment.x,
        y: newComment.y,
        text: newComment.text,
        author: 'Current User',
        timestamp: new Date().toISOString(),
        resolved: false,
      };
      setComments(prev => [...prev, comment]);
      setNewComment(null);
      toast({
        title: 'Comment Added',
        description: 'Your comment has been added to the board',
      });
    }
  }, [newComment, toast]);

  const handleExport = useCallback(async (format: 'png' | 'svg' | 'pdf' | 'json') => {
    try {
      // In a real implementation, this would call the API
      toast({
        title: 'Export Started',
        description: `Exporting board as ${format.toUpperCase()}...`,
      });
      
      // Simulate export delay
      setTimeout(() => {
        toast({
          title: 'Export Complete',
          description: `Board exported as ${format.toUpperCase()}`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export board',
        variant: 'destructive',
      });
    }
  }, [toast]);

  if (showBoardManager) {
    return (
      <BoardManager
        onSelectBoard={(boardId) => {
          setCurrentBoardId(boardId);
          setShowBoardManager(false);
        }}
        onCreateBoard={() => {
          // Handle board creation
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading whiteboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBoardManager(true)}
            className="text-gray-600"
          >
            ← Back to Boards
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {board?.name || 'Untitled Board'}
            </h3>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Unsaved
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Collaborators */}
          {showCollaborators && (
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1">
                {mockCollaborators.slice(0, 4).map((user) => (
                  <Avatar
                    key={user.id}
                    className={`w-8 h-8 border-2 border-white ${
                      user.active ? 'ring-2 ring-green-400' : ''
                    }`}
                    title={user.name}
                  >
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback style={{ backgroundColor: user.color }}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {mockCollaborators.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{mockCollaborators.length - 4}
                </Badge>
              )}
            </div>
          )}

          <Separator orientation="vertical" className="h-6" />

          {/* Connection Status */}
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-gray-600">
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={saveBoard}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Share Board</h4>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={`https://app.devdesk.com/boards/${currentBoardId}`}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://app.devdesk.com/boards/${currentBoardId}`);
                        toast({ title: 'Link copied to clipboard' });
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Export Options</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleExport('png')}>
                      PNG
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExport('svg')}>
                      SVG
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExport('pdf')}>
                      PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleExport('json')}>
                      JSON
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={drawingState.tool === tool.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool(tool.id as any)}
              className={`w-12 h-12 p-0 ${
                drawingState.tool === tool.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title={`${tool.name} (${tool.shortcut})`}
            >
              <tool.icon className="w-5 h-5" />
            </Button>
          ))}
          
          <Separator className="w-8" />
          
          {/* Color Palette */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-12 h-12 p-0"
                title="Colors"
              >
                <div
                  className="w-6 h-6 rounded border-2 border-gray-300"
                  style={{ backgroundColor: drawingState.strokeColor }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" side="right">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Stroke Color</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setStrokeColor(color)}
                        className={`w-8 h-8 rounded border-2 ${
                          drawingState.strokeColor === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Stroke Width</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {strokeWidths.map((width) => (
                      <Button
                        key={width}
                        variant={drawingState.strokeWidth === width ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStrokeWidth(width)}
                        className="h-8"
                      >
                        {width}px
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Shape Tools */}
          {drawingState.tool === 'shape' && (
            <div className="space-y-1">
              {shapes.map((shape) => (
                <Button
                  key={shape.id}
                  variant="ghost"
                  size="sm"
                  className="w-12 h-8 p-0 text-gray-600"
                  title={shape.name}
                >
                  <shape.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative overflow-hidden" ref={containerRef}>
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair"
            width={2000}
            height={2000}
            style={{
              transform: `translate(${viewportState.panX}px, ${viewportState.panY}px) scale(${viewportState.zoom})`,
              transformOrigin: '0 0',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
          />

          {/* Grid Background */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          )}

          {/* Collaborator Cursors */}
          <AnimatePresence>
            {cursors.map((cursor) => (
              <motion.div
                key={cursor.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute pointer-events-none z-10"
                style={{
                  left: cursor.x * viewportState.zoom + viewportState.panX,
                  top: cursor.y * viewportState.zoom + viewportState.panY,
                }}
              >
                <div className="relative">
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path
                      d="M0 0L20 7L8 10L5 20L0 0Z"
                      fill={cursor.color}
                      stroke="white"
                      strokeWidth="1"
                    />
                  </svg>
                  <div
                    className="absolute top-5 left-2 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
                    style={{ backgroundColor: cursor.color }}
                  >
                    {cursor.user.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Comments */}
          {showComments && comments.map((comment) => (
            <div
              key={comment.id}
              className="absolute z-20"
              style={{
                left: comment.x * viewportState.zoom + viewportState.panX,
                top: comment.y * viewportState.zoom + viewportState.panY,
              }}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    className="w-6 h-6 p-0 rounded-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                  >
                    <MessageCircle className="w-3 h-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{comment.author}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        Reply
                      </Button>
                      <Button size="sm" variant="outline">
                        {comment.resolved ? 'Unresolve' : 'Resolve'}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ))}

          {/* New Comment Dialog */}
          {newComment && (
            <Dialog open={!!newComment} onOpenChange={() => setNewComment(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Comment</DialogTitle>
                  <DialogDescription>
                    Add a comment at this location on the board
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your comment..."
                    value={newComment.text}
                    onChange={(e) => setNewComment(prev => prev ? { ...prev, text: e.target.value } : null)}
                    className="min-h-20"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setNewComment(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveComment} disabled={!newComment.text.trim()}>
                      Add Comment
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setZoom(viewportState.zoom * 0.8)}
              disabled={viewportState.zoom <= 0.1}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-12 text-center">
              {Math.round(viewportState.zoom * 100)}%
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setZoom(viewportState.zoom * 1.25)}
              disabled={viewportState.zoom >= 5}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              size="sm"
              variant="ghost"
              onClick={resetViewport}
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Minimap */}
          {showMinimap && (
            <div className="absolute top-4 right-4 w-48 h-32 bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gray-100 relative">
                <div className="text-xs text-gray-500 p-2">Minimap</div>
                {/* Minimap content would be rendered here */}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <Tabs defaultValue="layers" className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="layers" className="flex-1 p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Layers</h4>
                <div className="space-y-1">
                  {elements.slice(0, 10).map((element, index) => (
                    <div
                      key={element.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${
                        selectionState.selectedElements.includes(element.id)
                          ? 'bg-purple-50 border border-purple-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => selectElement(element.id)}
                    >
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <span className="flex-1 text-sm text-gray-700 capitalize">
                        {element.type.replace('-', ' ')}
                      </span>
                      <Button size="sm" variant="ghost" className="w-6 h-6 p-0">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="properties" className="flex-1 p-4 space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">Properties</h4>
                
                {selectionState.selectedElements.length > 0 ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Opacity</Label>
                      <Slider
                        value={[100]}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm">Rotation</Label>
                      <Slider
                        value={[0]}
                        min={-180}
                        max={180}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Actions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline">
                          <Copy className="w-3 h-3 mr-1" />
                          Duplicate
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Select an element to edit properties</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="comments" className="flex-1 p-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">Comments</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowComments(!showComments)}
                  >
                    {showComments ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <Card key={comment.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="h-6 text-xs">
                            Reply
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 text-xs">
                            {comment.resolved ? 'Unresolve' : 'Resolve'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {comments.length === 0 && (
                    <p className="text-sm text-gray-500">No comments yet</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Elements: {elements.length}</span>
            <span>Selected: {selectionState.selectedElements.length}</span>
            <div className="flex items-center space-x-2">
              <Switch
                id="grid"
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
              <Label htmlFor="grid" className="text-xs">Grid</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="snap"
                checked={snapToGrid}
                onCheckedChange={setSnapToGrid}
              />
              <Label htmlFor="snap" className="text-xs">Snap</Label>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Zoom: {Math.round(viewportState.zoom * 100)}%</span>
            <span>
              Position: {Math.round(viewportState.panX)}, {Math.round(viewportState.panY)}
            </span>
            <span>Last saved: {hasUnsavedChanges ? 'Unsaved changes' : 'Just now'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckBoards;
