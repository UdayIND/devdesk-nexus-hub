import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { Document, Folder, UploadProgress } from '../../lib/documents-api';
import {
  Upload,
  FolderPlus,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Eye,
  Edit,
  Copy,
  Move,
  Star,
  Clock,
  User,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  AlertTriangle,
  Info,
  Settings,
  Lock,
  Globe,
  Users,
  Link,
  Calendar,
  Tag,
  SortAsc,
  SortDesc,
  RefreshCw,
  Home,
  ArrowUp,
  Plus,
  Loader2,
} from 'lucide-react';

interface FileManagerProps {
  className?: string;
  initialFolderId?: string;
  selectionMode?: 'single' | 'multiple' | 'none';
  onFileSelect?: (files: Document[]) => void;
  onFolderSelect?: (folder: Folder) => void;
  showUpload?: boolean;
  showCreateFolder?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showViewModes?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  compactMode?: boolean;
}

const FileManager: React.FC<FileManagerProps> = ({
  className = '',
  initialFolderId,
  selectionMode = 'multiple',
  onFileSelect,
  onFolderSelect,
  showUpload = true,
  showCreateFolder = true,
  showSearch = true,
  showFilters = true,
  showViewModes = true,
  maxFileSize = 100 * 1024 * 1024, // 100MB
  allowedFileTypes = [],
  compactMode = false,
}) => {
  const [state, operations] = useDocuments({ autoRefresh: true, refreshInterval: 30000 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedDocumentForShare, setSelectedDocumentForShare] = useState<Document | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Initialize with folder if provided
  useEffect(() => {
    if (initialFolderId) {
      operations.navigateToFolder(initialFolderId);
    }
  }, [initialFolderId]);

  // Handle file selection callbacks
  useEffect(() => {
    if (onFileSelect && state.selectedDocuments.size > 0) {
      const selectedFiles = state.documents.filter(doc => state.selectedDocuments.has(doc.id));
      onFileSelect(selectedFiles);
    }
  }, [state.selectedDocuments, state.documents, onFileSelect]);

  useEffect(() => {
    if (onFolderSelect && state.selectedFolders.size === 1) {
      const selectedFolder = state.folders.find(folder => state.selectedFolders.has(folder.id));
      if (selectedFolder) {
        onFolderSelect(selectedFolder);
      }
    }
  }, [state.selectedFolders, state.folders, onFolderSelect]);

  // Drag and Drop Handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await operations.uploadFiles(files, { folderId: state.currentFolder?.id });
    }
  }, [operations, state.currentFolder?.id]);

  // File Upload Handlers
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (file.size > maxFileSize) {
        console.error(`File ${file.name} exceeds size limit`);
        return false;
      }
      
      if (allowedFileTypes.length > 0) {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedFileTypes.includes(fileExtension) && !allowedFileTypes.includes(file.type)) {
          console.error(`File type ${file.type} not allowed`);
          return false;
        }
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      await operations.uploadFiles(validFiles, { folderId: state.currentFolder?.id });
    }
  }, [operations, state.currentFolder?.id, maxFileSize, allowedFileTypes]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderUploadClick = () => {
    folderInputRef.current?.click();
  };

  // Search and Filter
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await operations.searchDocuments(query, state.filterBy);
    } else {
      operations.clearSearch();
    }
  }, [operations, state.filterBy]);

  // Folder Operations
  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await operations.createFolder(newFolderName.trim(), state.currentFolder?.id);
      setNewFolderName('');
      setShowCreateFolderDialog(false);
    }
  };

  const handleFolderDoubleClick = (folder: Folder) => {
    operations.navigateToFolder(folder.id);
  };

  // Document Operations
  const handleDocumentDoubleClick = (document: Document) => {
    setPreviewDocument(document);
  };

  const handleDownloadSelected = async () => {
    const selectedIds = Array.from(state.selectedDocuments);
    if (selectedIds.length === 1) {
      await operations.downloadDocument(selectedIds[0]);
    } else if (selectedIds.length > 1) {
      await operations.downloadMultiple(selectedIds);
    }
  };

  const handleDeleteSelected = async () => {
    const selectedDocuments = Array.from(state.selectedDocuments);
    const selectedFolders = Array.from(state.selectedFolders);
    
    if (selectedDocuments.length > 0) {
      await operations.deleteDocuments(selectedDocuments);
    }
    
    if (selectedFolders.length > 0) {
      for (const folderId of selectedFolders) {
        await operations.deleteFolder(folderId);
      }
    }
    
    operations.clearSelection();
  };

  const handleShareDocument = (document: Document) => {
    setSelectedDocumentForShare(document);
    setShowShareDialog(true);
  };

  // File Icon Helper
  const getFileIcon = (document: Document) => {
    const { mimeType } = document;
    
    if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-green-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="w-5 h-5 text-blue-600" />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileText className="w-5 h-5 text-green-600" />;
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return <FileText className="w-5 h-5 text-orange-500" />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <Archive className="w-5 h-5 text-yellow-600" />;
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayDocuments = state.searchResults?.documents || state.documents;
  const displayFolders = state.searchResults ? [] : state.folders;

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex flex-col space-y-4 p-4 border-b border-gray-200">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={() => operations.navigateToFolder()}
            className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          {state.breadcrumbs.slice(1).map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => operations.navigateToFolder(crumb.id)}
                className="hover:text-blue-600 transition-colors"
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            {/* Navigation */}
            <button
              onClick={operations.navigateUp}
              disabled={state.breadcrumbs.length <= 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Go up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            <button
              onClick={operations.refreshDocuments}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Upload */}
            {showUpload && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleUploadClick}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload Files</span>
                </button>

                <button
                  onClick={handleFolderUploadClick}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  title="Upload Folder"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Create Folder */}
            {showCreateFolder && (
              <button
                onClick={() => setShowCreateFolderDialog(true)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Folder</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`p-2 rounded-lg border transition-colors ${
                  showFiltersPanel ? 'bg-blue-50 border-blue-300' : 'border-gray-300 hover:bg-gray-50'
                }`}
                title="Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            )}

            {/* View Mode */}
            {showViewModes && (
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => operations.setViewMode('grid')}
                  className={`p-2 ${
                    state.viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => operations.setViewMode('list')}
                  className={`p-2 ${
                    state.viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Sort */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <select
                value={state.sortBy}
                onChange={(e) => operations.setSorting(e.target.value as any)}
                className="px-3 py-2 border-0 bg-transparent focus:ring-0 text-sm"
              >
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="createdAt">Created</option>
                <option value="updatedAt">Modified</option>
              </select>
              <button
                onClick={() => operations.setSorting(state.sortBy, state.sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-2 hover:bg-gray-50"
                title={`Sort ${state.sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {state.sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Selection Actions */}
        {(state.selectedDocuments.size > 0 || state.selectedFolders.size > 0) && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              {state.selectedDocuments.size + state.selectedFolders.size} item(s) selected
            </span>
            <div className="flex items-center space-x-2">
              {state.selectedDocuments.size > 0 && (
                <>
                  <button
                    onClick={handleDownloadSelected}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  {state.selectedDocuments.size === 1 && (
                    <button
                      onClick={() => {
                        const doc = state.documents.find(d => state.selectedDocuments.has(d.id));
                        if (doc) handleShareDocument(doc);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  )}
                </>
              )}
              <button
                onClick={handleDeleteSelected}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-white border border-red-300 text-red-700 rounded hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={operations.clearSelection}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}

        {/* Storage Quota */}
        {state.storageQuota && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    state.storageQuota.percentage > 90 ? 'bg-red-500' :
                    state.storageQuota.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(state.storageQuota.percentage, 100)}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {formatFileSize(state.storageQuota.used)} of {formatFileSize(state.storageQuota.total)} used
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {state.storageQuota.documentCount} files
            </span>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
              <select
                value={state.filterBy.type?.[0] || ''}
                onChange={(e) => operations.setFilter({ type: e.target.value ? [e.target.value] : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="image/">Images</option>
                <option value="video/">Videos</option>
                <option value="audio/">Audio</option>
                <option value="application/pdf">PDF</option>
                <option value="text/">Text</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">All Sizes</option>
                <option value="small">Small (&lt; 1MB)</option>
                <option value="medium">Medium (1-10MB)</option>
                <option value="large">Large (&gt; 10MB)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div
        className={`flex-1 overflow-auto ${dragActive ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {state.loading && !state.documents.length && !state.folders.length ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Drag Overlay */}
            {dragActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 z-10">
                <div className="text-center">
                  <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-blue-700">Drop files here to upload</p>
                </div>
              </div>
            )}

            {/* Grid View */}
            {state.viewMode === 'grid' && (
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {/* Folders */}
                  {displayFolders.map((folder) => (
                    <div
                      key={folder.id}
                      className={`group relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        state.selectedFolders.has(folder.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={(e) => {
                        if (selectionMode !== 'none') {
                          operations.selectFolder(folder.id, e.ctrlKey || e.metaKey);
                        }
                      }}
                      onDoubleClick={() => handleFolderDoubleClick(folder)}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg">
                          <FolderPlus className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900 truncate w-full" title={folder.name}>
                            {folder.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {folder.documentCount} items
                          </p>
                        </div>
                      </div>
                      
                      {/* Folder Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 bg-white rounded shadow-sm border border-gray-200 hover:bg-gray-50">
                          <MoreVertical className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Documents */}
                  {displayDocuments.map((document) => (
                    <div
                      key={document.id}
                      className={`group relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        state.selectedDocuments.has(document.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={(e) => {
                        if (selectionMode !== 'none') {
                          operations.selectDocument(document.id, e.ctrlKey || e.metaKey);
                        }
                      }}
                      onDoubleClick={() => handleDocumentDoubleClick(document)}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {/* Thumbnail or Icon */}
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                          {document.thumbnailUrl ? (
                            <img
                              src={document.thumbnailUrl}
                              alt={document.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            getFileIcon(document)
                          )}
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900 truncate w-full" title={document.name}>
                            {document.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(document.size)}
                          </p>
                        </div>
                      </div>

                      {/* Document Status */}
                      {document.status !== 'ready' && (
                        <div className="absolute top-2 left-2">
                          {document.status === 'uploading' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          )}
                          {document.status === 'processing' && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          )}
                          {document.status === 'error' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                          )}
                        </div>
                      )}

                      {/* Document Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareDocument(document);
                          }}
                          className="p-1 bg-white rounded shadow-sm border border-gray-200 hover:bg-gray-50"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Sharing Indicator */}
                      {document.permissions.sharedWith.length > 0 && (
                        <div className="absolute bottom-2 left-2">
                          <Users className="w-3 h-3 text-blue-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List View */}
            {state.viewMode === 'list' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modified
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sharing
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Folders */}
                    {displayFolders.map((folder) => (
                      <tr
                        key={folder.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          state.selectedFolders.has(folder.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={(e) => {
                          if (selectionMode !== 'none') {
                            operations.selectFolder(folder.id, e.ctrlKey || e.metaKey);
                          }
                        }}
                        onDoubleClick={() => handleFolderDoubleClick(folder)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <FolderPlus className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-medium text-gray-900">{folder.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {folder.documentCount} items
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(folder.updatedAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {folder.ownerId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {folder.permissions.sharedWith.length > 0 ? (
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-blue-600">
                                {folder.permissions.sharedWith.length}
                              </span>
                            </div>
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Documents */}
                    {displayDocuments.map((document) => (
                      <tr
                        key={document.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          state.selectedDocuments.has(document.id) ? 'bg-blue-50' : ''
                        }`}
                        onClick={(e) => {
                          if (selectionMode !== 'none') {
                            operations.selectDocument(document.id, e.ctrlKey || e.metaKey);
                          }
                        }}
                        onDoubleClick={() => handleDocumentDoubleClick(document)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(document)}
                            <div>
                              <span className="text-sm font-medium text-gray-900">{document.name}</span>
                              {document.status !== 'ready' && (
                                <div className="flex items-center space-x-1 mt-1">
                                  {document.status === 'uploading' && (
                                    <>
                                      <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                                      <span className="text-xs text-blue-600">Uploading...</span>
                                    </>
                                  )}
                                  {document.status === 'processing' && (
                                    <>
                                      <Clock className="w-3 h-3 text-yellow-500" />
                                      <span className="text-xs text-yellow-600">Processing...</span>
                                    </>
                                  )}
                                  {document.status === 'error' && (
                                    <>
                                      <AlertTriangle className="w-3 h-3 text-red-500" />
                                      <span className="text-xs text-red-600">Error</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(document.size)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(document.updatedAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {document.ownerId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {document.permissions.sharedWith.length > 0 ? (
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-blue-600">
                                {document.permissions.sharedWith.length}
                              </span>
                            </div>
                          ) : document.permissions.isPublic ? (
                            <Globe className="w-4 h-4 text-green-500" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                operations.downloadDocument(document.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareDocument(document);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="Share"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {!state.loading && displayDocuments.length === 0 && displayFolders.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <File className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">No files found</h3>
                <p className="text-sm text-center mb-4">
                  {state.searchResults ? 'No files match your search criteria.' : 'This folder is empty.'}
                </p>
                {showUpload && !state.searchResults && (
                  <button
                    onClick={handleUploadClick}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload your first file</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Progress */}
      {state.uploads.size > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Uploading Files</h4>
          <div className="space-y-2">
            {Array.from(state.uploads.values()).map((upload) => (
              <div key={upload.documentId} className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{upload.fileName}</span>
                    <span className="text-sm text-gray-500">{upload.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${upload.percentage}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => operations.cancelUpload(upload.documentId)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="border-t border-red-200 bg-red-50 p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">{state.error}</span>
            <button
              onClick={() => operations.refreshDocuments()}
              className="ml-auto text-sm text-red-600 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
        accept={allowedFileTypes.length > 0 ? allowedFileTypes.join(',') : undefined}
      />
      
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '' } as any)}
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      {/* Create Folder Dialog */}
      {showCreateFolderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowCreateFolderDialog(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager; 