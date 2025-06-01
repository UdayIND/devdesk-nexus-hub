import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Share2, 
  Trash2, 
  Edit, 
  Copy, 
  Users, 
  Clock, 
  Eye, 
  Lock, 
  Globe,
  MoreHorizontal,
  Download,
  Upload,
  FolderPlus,
  Settings,
  Link,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Board, BoardCollaborator } from '@/lib/whiteboard-api';

interface BoardManagerProps {
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: () => void;
}

interface MockBoard extends Board {
  lastModified: string;
  collaboratorCount: number;
  isStarred: boolean;
  thumbnail?: string;
}

const BoardManager: React.FC<BoardManagerProps> = ({ onSelectBoard, onCreateBoard }) => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'shared' | 'starred'>('all');
  const [sortBy, setSortBy] = useState<'modified' | 'created' | 'name'>('modified');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<MockBoard | null>(null);
  const [newBoardData, setNewBoardData] = useState({
    name: '',
    description: '',
    isPublic: false,
    template: 'blank',
  });
  const [shareData, setShareData] = useState({
    email: '',
    role: 'editor' as 'editor' | 'viewer',
    message: '',
  });

  // Mock data - in a real app, this would come from the API
  const [boards, setBoards] = useState<MockBoard[]>([
    {
      id: '1',
      name: 'Project Brainstorm',
      description: 'Initial ideas and concepts for the new project',
      ownerId: 'user1',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
      lastModified: '2024-01-15T14:30:00Z',
      isPublic: false,
      collaborators: [],
      collaboratorCount: 5,
      isStarred: true,
      permissions: {
        canEdit: true,
        canInvite: true,
        canDelete: true,
        canExport: true,
      },
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
    },
    {
      id: '2',
      name: 'UI/UX Wireframes',
      description: 'User interface mockups and user experience flow',
      ownerId: 'user1',
      createdAt: '2024-01-12T09:00:00Z',
      updatedAt: '2024-01-14T16:45:00Z',
      lastModified: '2024-01-14T16:45:00Z',
      isPublic: true,
      collaborators: [],
      collaboratorCount: 3,
      isStarred: false,
      permissions: {
        canEdit: true,
        canInvite: true,
        canDelete: true,
        canExport: true,
      },
      thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=300&h=200&fit=crop',
    },
    {
      id: '3',
      name: 'Team Retrospective',
      description: 'Sprint retrospective and improvement planning',
      ownerId: 'user2',
      createdAt: '2024-01-08T11:00:00Z',
      updatedAt: '2024-01-13T10:15:00Z',
      lastModified: '2024-01-13T10:15:00Z',
      isPublic: false,
      collaborators: [],
      collaboratorCount: 8,
      isStarred: true,
      permissions: {
        canEdit: false,
        canInvite: false,
        canDelete: false,
        canExport: true,
      },
    },
  ]);

  const templates = [
    { id: 'blank', name: 'Blank Board', description: 'Start with an empty canvas' },
    { id: 'brainstorm', name: 'Brainstorming', description: 'Structured brainstorming template' },
    { id: 'kanban', name: 'Kanban Board', description: 'Task management board' },
    { id: 'flowchart', name: 'Flowchart', description: 'Process flow diagram' },
    { id: 'mindmap', name: 'Mind Map', description: 'Hierarchical idea mapping' },
    { id: 'retrospective', name: 'Retrospective', description: 'Team retrospective template' },
  ];

  const filteredBoards = boards.filter(board => {
    const matchesSearch = !searchQuery || 
      board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'owned' && board.ownerId === 'user1') ||
      (filterType === 'shared' && board.ownerId !== 'user1') ||
      (filterType === 'starred' && board.isStarred);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'modified':
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
  });

  const handleCreateBoard = async () => {
    try {
      const newBoard: MockBoard = {
        id: `board_${Date.now()}`,
        name: newBoardData.name,
        description: newBoardData.description,
        ownerId: 'user1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        isPublic: newBoardData.isPublic,
        collaborators: [],
        collaboratorCount: 1,
        isStarred: false,
        permissions: {
          canEdit: true,
          canInvite: true,
          canDelete: true,
          canExport: true,
        },
      };

      setBoards(prev => [newBoard, ...prev]);
      setShowCreateDialog(false);
      setNewBoardData({ name: '', description: '', isPublic: false, template: 'blank' });
      
      toast({
        title: 'Board Created',
        description: `"${newBoard.name}" has been created successfully`,
      });

      onSelectBoard(newBoard.id);
    } catch (error) {
      toast({
        title: 'Failed to Create Board',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      setBoards(prev => prev.filter(b => b.id !== boardId));
      toast({
        title: 'Board Deleted',
        description: 'The board has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Failed to Delete Board',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateBoard = async (board: MockBoard) => {
    try {
      const duplicatedBoard: MockBoard = {
        ...board,
        id: `board_${Date.now()}`,
        name: `${board.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        collaboratorCount: 1,
      };

      setBoards(prev => [duplicatedBoard, ...prev]);
      
      toast({
        title: 'Board Duplicated',
        description: `"${duplicatedBoard.name}" has been created`,
      });
    } catch (error) {
      toast({
        title: 'Failed to Duplicate Board',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStar = (boardId: string) => {
    setBoards(prev => prev.map(board => 
      board.id === boardId 
        ? { ...board, isStarred: !board.isStarred }
        : board
    ));
  };

  const handleShareBoard = async () => {
    try {
      // In a real app, this would call the API to invite a collaborator
      toast({
        title: 'Invitation Sent',
        description: `Invitation sent to ${shareData.email}`,
      });
      setShowShareDialog(false);
      setShareData({ email: '', role: 'editor', message: '' });
    } catch (error) {
      toast({
        title: 'Failed to Send Invitation',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Boards</h1>
            <p className="text-gray-600">Create and manage your whiteboards</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Board
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Board</DialogTitle>
                <DialogDescription>
                  Start a new whiteboard for your team collaboration
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="boardName">Board Name</Label>
                  <Input
                    id="boardName"
                    placeholder="Enter board name"
                    value={newBoardData.name}
                    onChange={(e) => setNewBoardData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="boardDescription">Description (Optional)</Label>
                  <Textarea
                    id="boardDescription"
                    placeholder="Describe your board"
                    value={newBoardData.description}
                    onChange={(e) => setNewBoardData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select value={newBoardData.template} onValueChange={(value) => setNewBoardData(prev => ({ ...prev, template: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-500">{template.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={newBoardData.isPublic}
                    onCheckedChange={(checked) => setNewBoardData(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="isPublic">Make board public</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateBoard}
                    disabled={!newBoardData.name.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Create Board
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boards</SelectItem>
              <SelectItem value="owned">Owned</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
              <SelectItem value="starred">Starred</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modified">Last Modified</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-2"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Board Grid/List */}
      <div className="flex-1 overflow-auto p-6">
        {filteredBoards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderPlus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No boards found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search or filters' : 'Create your first board to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Board
              </Button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBoards.map((board) => (
                  <motion.div
                    key={board.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-200">
                      <div className="relative">
                        {board.thumbnail ? (
                          <img
                            src={board.thumbnail}
                            alt={board.name}
                            className="w-full h-32 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-t-lg flex items-center justify-center">
                            <div className="text-4xl font-bold text-purple-300">
                              {board.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2 flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStar(board.id);
                            }}
                          >
                            <Star className={`w-4 h-4 ${board.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onSelectBoard(board.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Open
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedBoard(board);
                                setShowShareDialog(true);
                              }}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateBoard(board)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteBoard(board.id)}
                                className="text-red-600"
                                disabled={!board.permissions.canDelete}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="absolute bottom-2 left-2">
                          {board.isPublic ? (
                            <Badge variant="secondary" className="text-xs">
                              <Globe className="w-3 h-3 mr-1" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-white/80">
                              <Lock className="w-3 h-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardContent className="p-4" onClick={() => onSelectBoard(board.id)}>
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{board.name}</h3>
                        {board.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{board.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{board.collaboratorCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(board.lastModified)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBoards.map((board) => (
                  <motion.div
                    key={board.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="group cursor-pointer hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4" onClick={() => onSelectBoard(board.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg font-bold text-purple-600">
                                {board.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">{board.name}</h3>
                                {board.isStarred && (
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                )}
                                {board.isPublic ? (
                                  <Globe className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Lock className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              {board.description && (
                                <p className="text-sm text-gray-600 truncate">{board.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{board.collaboratorCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimeAgo(board.lastModified)}</span>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="w-8 h-8 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onSelectBoard(board.id)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Open
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedBoard(board);
                                  setShowShareDialog(true);
                                }}>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateBoard(board)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteBoard(board.id)}
                                  className="text-red-600"
                                  disabled={!board.permissions.canDelete}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Board</DialogTitle>
            <DialogDescription>
              Invite others to collaborate on "{selectedBoard?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="invite" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="invite">Invite People</TabsTrigger>
              <TabsTrigger value="link">Share Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="invite" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={shareData.email}
                  onChange={(e) => setShareData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Permission Level</Label>
                <Select value={shareData.role} onValueChange={(value: any) => setShareData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor - Can edit and comment</SelectItem>
                    <SelectItem value="viewer">Viewer - Can view and comment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message"
                  value={shareData.message}
                  onChange={(e) => setShareData(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleShareBoard}
                  disabled={!shareData.email.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="link" className="space-y-4">
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={`https://app.devdesk.com/boards/${selectedBoard?.id}`}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://app.devdesk.com/boards/${selectedBoard?.id}`);
                      toast({ title: 'Link copied to clipboard' });
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Anyone with this link can view the board
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="publicAccess" />
                <Label htmlFor="publicAccess">Allow public access</Label>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoardManager; 