import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Play,
  Settings,
  RefreshCw,
  FileText,
  Image,
  MessageCircle,
  Users,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
  FolderOpen,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFigma } from '@/hooks/useFigma';
import { FigmaNode, FigmaComment } from '@/lib/figma-api';

const FigmaIntegration: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState('select');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [accessToken, setAccessToken] = useState('');
  const [fileKey, setFileKey] = useState('');
  const [teamId, setTeamId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'svg' | 'pdf'>('png');
  const [exportScale, setExportScale] = useState(1);
  const [commentText, setCommentText] = useState('');

  // Initialize with environment variables if available
  useEffect(() => {
    const envToken = import.meta.env.VITE_FIGMA_ACCESS_TOKEN;
    const envFileKey = import.meta.env.VITE_FIGMA_FILE_KEY;
    const envTeamId = import.meta.env.VITE_FIGMA_TEAM_ID;

    if (envToken) {
      setAccessToken(envToken);
      setIsConfigured(true);
    }
    if (envFileKey) setFileKey(envFileKey);
    if (envTeamId) setTeamId(envTeamId);
  }, []);

  const {
    user,
    fileData,
    teamProjects,
    comments,
    selectedNodes,
    isLoading,
    hasError,
    userError,
    fileError,
    selectNode,
    clearSelection,
    extractFrames,
    extractComponents,
    exportSelectedNodes,
    downloadExportedImages,
    postComment,
    isExporting,
    isPostingComment,
    refetchFile
  } = useFigma({
    accessToken: isConfigured ? accessToken : undefined,
    fileKey: fileKey || undefined,
    teamId: teamId || undefined,
  });

  const tools = [
    { id: 'select', icon: MousePointer, name: 'Select' },
    { id: 'move', icon: Move, name: 'Move' },
    { id: 'pen', icon: Pen, name: 'Pen' },
    { id: 'text', icon: Type, name: 'Text' },
    { id: 'rectangle', icon: Square, name: 'Rectangle' },
    { id: 'circle', icon: Circle, name: 'Circle' },
  ];

  const handleConnect = () => {
    if (accessToken.trim()) {
      setIsConfigured(true);
    }
  };

  const handleExportAssets = async () => {
    if (selectedNodes.length === 0) return;
    
    try {
      const exportData = await exportSelectedNodes(exportFormat, exportScale);
      if (exportData) {
        await downloadExportedImages(exportData);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      await postComment(commentText);
      setCommentText('');
    } catch (error) {
      console.error('Comment failed:', error);
    }
  };

  const frames = fileData ? extractFrames(fileData.document) : [];
  const components = fileData ? extractComponents(fileData.document) : [];

  // Configuration Panel
  if (!isConfigured) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Connect to Figma</CardTitle>
            <CardDescription>
              Enter your Figma access token to start collaborating on designs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Access Token</label>
              <Input
                type="password"
                placeholder="Enter your Figma access token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your token from Figma → Settings → Personal Access Tokens
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">File Key (Optional)</label>
              <Input
                placeholder="Figma file key from URL"
                value={fileKey}
                onChange={(e) => setFileKey(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Team ID (Optional)</label>
              <Input
                placeholder="Figma team ID"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleConnect} 
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              disabled={!accessToken.trim()}
            >
              Connect to Figma
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (hasError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Connection Error</CardTitle>
            <CardDescription>
              {userError?.message || fileError?.message || 'Failed to connect to Figma API'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsConfigured(false)} 
              variant="outline" 
              className="w-full"
            >
              Reconfigure Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-pink-500" />
          <p className="text-gray-600">Connecting to Figma...</p>
        </div>
      </div>
    );
  }

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
                ? 'bg-pink-600 text-white' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tool.icon className="w-4 h-4" />
          </Button>
        ))}
        
        <div className="border-t border-gray-200 pt-2 mt-4 space-y-1">
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-600">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-600">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-10 h-10 p-0 text-gray-600"
            onClick={() => refetchFile()}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {fileData?.name || 'Figma Integration'}
            </h3>
            {user && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Connected as {user.email}</span>
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">{zoomLevel}%</span>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {fileData && (
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => window.open(`https://www.figma.com/file/${fileKey}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Figma
              </Button>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="canvas" className="h-full flex flex-col">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="canvas">Canvas</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="canvas" className="flex-1 mt-4">
              {fileData ? (
                <div className="h-full bg-gray-100 relative overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center p-8"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
                      <div className="text-center mb-6">
                        <h4 className="text-xl font-semibold mb-2">{fileData.name}</h4>
                        <p className="text-gray-600">
                          {frames.length} frames • {components.length} components
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {frames.slice(0, 6).map((frame, index) => (
                          <motion.div
                            key={frame.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-gray-50 rounded-lg p-4 cursor-pointer border-2 transition-colors ${
                              selectedNodes.includes(frame.id) 
                                ? 'border-pink-500 bg-pink-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => selectNode(frame.id)}
                          >
                            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded mb-3 flex items-center justify-center">
                              <Layers className="w-8 h-8 text-gray-400" />
                            </div>
                            <h5 className="font-medium text-sm truncate">{frame.name}</h5>
                            <p className="text-xs text-gray-500 mt-1">{frame.type}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No file loaded. Enter a file key to get started.</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="assets" className="flex-1 mt-4 px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Layers className="w-5 h-5" />
                      <span>Frames ({frames.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    {frames.map((frame) => (
                      <div
                        key={frame.id}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${
                          selectedNodes.includes(frame.id) 
                            ? 'bg-pink-50 border border-pink-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => selectNode(frame.id)}
                      >
                        <Square className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 text-sm truncate">{frame.name}</span>
                        <Badge variant="outline" className="text-xs">{frame.type}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Circle className="w-5 h-5" />
                      <span>Components ({components.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    {components.map((component) => (
                      <div
                        key={component.id}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${
                          selectedNodes.includes(component.id) 
                            ? 'bg-pink-50 border border-pink-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => selectNode(component.id)}
                      >
                        <Circle className="w-4 h-4 text-gray-400" />
                        <span className="flex-1 text-sm truncate">{component.name}</span>
                        <Badge variant="outline" className="text-xs">COMPONENT</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="flex-1 mt-4 px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>Comments</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {comments?.comments?.map((comment: FigmaComment) => (
                      <div key={comment.id} className="border-l-4 border-pink-500 pl-4 py-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">{comment.user.handle}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.message}</p>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-8">No comments yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Add Comment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                    />
                    <Button 
                      onClick={handlePostComment}
                      disabled={!commentText.trim() || isPostingComment}
                      className="w-full"
                    >
                      {isPostingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      Post Comment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="export" className="flex-1 mt-4 px-4">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Export Assets</span>
                  </CardTitle>
                  <CardDescription>
                    Export selected frames and components as images
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedNodes.length > 0 ? (
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>
                        {selectedNodes.length} item(s) selected for export
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Select frames or components to export
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Format</label>
                      <Select value={exportFormat} onValueChange={(value: 'png' | 'jpg' | 'svg' | 'pdf') => setExportFormat(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="jpg">JPG</SelectItem>
                          <SelectItem value="svg">SVG</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Scale</label>
                      <Select value={exportScale.toString()} onValueChange={(value) => setExportScale(Number(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1x</SelectItem>
                          <SelectItem value="2">2x</SelectItem>
                          <SelectItem value="3">3x</SelectItem>
                          <SelectItem value="4">4x</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleExportAssets}
                    disabled={selectedNodes.length === 0 || isExporting}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export & Download
                  </Button>

                  {selectedNodes.length > 0 && (
                    <Button 
                      onClick={clearSelection}
                      variant="outline"
                      className="w-full"
                    >
                      Clear Selection
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default FigmaIntegration;
