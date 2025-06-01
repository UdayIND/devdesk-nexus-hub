import { useState, useEffect, useCallback, useRef } from 'react';
import DocumentsAPI, {
  Document,
  Folder,
  DocumentListResponse,
  UploadProgress,
  DocumentComment,
  DocumentActivity,
  StorageQuota,
  DocumentSearch,
  DocumentSearchResult,
  SharedUser,
  ShareLink,
  DocumentVersion,
  DocumentPermissions,
  UserPermissions,
  SecurityScanResult,
} from '../lib/documents-api';

export interface UseDocumentsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealtime?: boolean;
}

export interface DocumentsState {
  documents: Document[];
  folders: Folder[];
  currentFolder?: Folder;
  selectedDocuments: Set<string>;
  selectedFolders: Set<string>;
  uploads: Map<string, UploadProgress>;
  loading: boolean;
  error: string | null;
  searchResults?: DocumentSearchResult;
  storageQuota?: StorageQuota;
  breadcrumbs: Array<{ id: string; name: string }>;
  viewMode: 'grid' | 'list' | 'tiles';
  sortBy: 'name' | 'size' | 'createdAt' | 'updatedAt';
  sortDirection: 'asc' | 'desc';
  filterBy: {
    type?: string[];
    owner?: string[];
    folder?: string;
    tags?: string[];
    dateRange?: { start: string; end: string };
    sizeRange?: { min: number; max: number };
    hasComments?: boolean;
    isShared?: boolean;
  };
}

export interface DocumentOperations {
  // Navigation
  navigateToFolder: (folderId?: string) => Promise<void>;
  navigateUp: () => Promise<void>;
  refreshDocuments: () => Promise<void>;
  
  // Document Management
  uploadFiles: (files: File[], options?: { folderId?: string; description?: string; tags?: string[] }) => Promise<void>;
  uploadFromUrl: (url: string, options?: { name?: string; folderId?: string }) => Promise<void>;
  deleteDocuments: (documentIds: string[], permanent?: boolean) => Promise<void>;
  restoreDocuments: (documentIds: string[]) => Promise<void>;
  duplicateDocument: (documentId: string, name?: string) => Promise<void>;
  moveDocuments: (documentIds: string[], targetFolderId?: string) => Promise<void>;
  downloadDocument: (documentId: string, versionId?: string) => Promise<void>;
  downloadMultiple: (documentIds: string[]) => Promise<void>;
  
  // Folder Management
  createFolder: (name: string, parentId?: string, description?: string) => Promise<void>;
  updateFolder: (folderId: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (folderId: string, deleteContents?: boolean) => Promise<void>;
  
  // Search & Filter
  searchDocuments: (query: string, filters?: DocumentSearch['filters']) => Promise<void>;
  clearSearch: () => void;
  setFilter: (filter: Partial<DocumentsState['filterBy']>) => void;
  setSorting: (sortBy: DocumentsState['sortBy'], direction?: DocumentsState['sortDirection']) => void;
  setViewMode: (mode: DocumentsState['viewMode']) => void;
  
  // Selection
  selectDocument: (documentId: string, multi?: boolean) => void;
  selectFolder: (folderId: string, multi?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Permissions & Sharing
  updatePermissions: (documentId: string, permissions: Partial<DocumentPermissions>) => Promise<void>;
  shareWithUsers: (documentId: string, users: Array<{ email: string; role: SharedUser['role'] }>) => Promise<void>;
  removeUserAccess: (documentId: string, userId: string) => Promise<void>;
  createShareLink: (documentId: string, options: {
    name?: string;
    permissions: Partial<UserPermissions>;
    password?: string;
    expiresAt?: string;
    maxUses?: number;
  }) => Promise<ShareLink>;
  deleteShareLink: (documentId: string, linkId: string) => Promise<void>;
  
  // Versions
  getVersions: (documentId: string) => Promise<DocumentVersion[]>;
  uploadNewVersion: (documentId: string, file: File, changes?: string) => Promise<void>;
  restoreVersion: (documentId: string, versionId: string) => Promise<void>;
  
  // Comments
  getComments: (documentId: string) => Promise<DocumentComment[]>;
  addComment: (documentId: string, content: string, position?: { x: number; y: number; page?: number }) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  resolveComment: (commentId: string) => Promise<void>;
  
  // Upload Control
  cancelUpload: (uploadId: string) => void;
  pauseUpload: (uploadId: string) => void;
  resumeUpload: (uploadId: string) => void;
  
  // Utility
  getStorageQuota: () => Promise<void>;
  scanDocument: (documentId: string) => Promise<SecurityScanResult>;
  getActivity: (documentId: string) => Promise<DocumentActivity[]>;
  previewDocument: (documentId: string) => Promise<string>;
  getThumbnail: (documentId: string, size?: string) => Promise<string>;
}

export function useDocuments(options: UseDocumentsOptions = {}): [DocumentsState, DocumentOperations] {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    enableRealtime = true,
  } = options;

  const api = useRef(new DocumentsAPI());
  const refreshTimer = useRef<NodeJS.Timeout>();
  const dragCounter = useRef(0);

  const [state, setState] = useState<DocumentsState>({
    documents: [],
    folders: [],
    selectedDocuments: new Set(),
    selectedFolders: new Set(),
    uploads: new Map(),
    loading: false,
    error: null,
    breadcrumbs: [{ id: '', name: 'Home' }],
    viewMode: 'grid',
    sortBy: 'updatedAt',
    sortDirection: 'desc',
    filterBy: {},
  });

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      refreshTimer.current = setInterval(() => {
        refreshDocuments();
      }, refreshInterval);

      return () => {
        if (refreshTimer.current) {
          clearInterval(refreshTimer.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval]);

  // Load initial data
  useEffect(() => {
    refreshDocuments();
    getStorageQuota();
  }, []);

  // Navigation
  const navigateToFolder = useCallback(async (folderId?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await api.current.getDocuments(folderId, 1, 50, state.sortBy, state.sortDirection);
      
      if (response.success && response.data) {
        const { documents, folders, path } = response.data;
        
        setState(prev => ({
          ...prev,
          documents,
          folders,
          currentFolder: folderId ? folders.find(f => f.id === folderId) : undefined,
          breadcrumbs: path.map(p => ({ id: p, name: p === '' ? 'Home' : p })),
          selectedDocuments: new Set(),
          selectedFolders: new Set(),
          loading: false,
        }));
      } else {
        setState(prev => ({ ...prev, error: response.error || 'Failed to load documents', loading: false }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load documents',
        loading: false 
      }));
    }
  }, [state.sortBy, state.sortDirection]);

  const navigateUp = useCallback(async () => {
    const parentId = state.breadcrumbs.length > 1 
      ? state.breadcrumbs[state.breadcrumbs.length - 2]?.id 
      : undefined;
    await navigateToFolder(parentId);
  }, [state.breadcrumbs, navigateToFolder]);

  const refreshDocuments = useCallback(async () => {
    const currentFolderId = state.currentFolder?.id;
    await navigateToFolder(currentFolderId);
  }, [state.currentFolder?.id, navigateToFolder]);

  // File Upload
  const uploadFiles = useCallback(async (
    files: File[], 
    options: { folderId?: string; description?: string; tags?: string[] } = {}
  ) => {
    const folderId = options.folderId || state.currentFolder?.id;
    
    for (const file of files) {
      const validation = api.current.validateFile(file);
      if (!validation.valid) {
        setState(prev => ({ ...prev, error: validation.error || 'Invalid file' }));
        continue;
      }

      try {
        await api.current.uploadDocument(file, {
          ...options,
          folderId,
          onProgress: (progress) => {
            setState(prev => ({
              ...prev,
              uploads: new Map(prev.uploads.set(progress.documentId, progress)),
            }));
          },
        });

        // Remove from uploads when complete
        setState(prev => {
          const newUploads = new Map(prev.uploads);
          newUploads.delete(`upload_${file.name}`);
          return { ...prev, uploads: newUploads };
        });
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        }));
      }
    }

    // Refresh documents after uploads
    await refreshDocuments();
  }, [state.currentFolder?.id, refreshDocuments]);

  const uploadFromUrl = useCallback(async (
    url: string, 
    options: { name?: string; folderId?: string } = {}
  ) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // This would typically be handled by the backend
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], options.name || 'download', { type: blob.type });
      
      await uploadFiles([file], { folderId: options.folderId });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to upload from URL',
        loading: false 
      }));
    }
  }, [uploadFiles]);

  // Document Operations
  const deleteDocuments = useCallback(async (documentIds: string[], permanent = false) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await Promise.all(
        documentIds.map(id => api.current.deleteDocument(id, permanent))
      );
      
      setState(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => !documentIds.includes(doc.id)),
        selectedDocuments: new Set(),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete documents',
        loading: false 
      }));
    }
  }, []);

  const restoreDocuments = useCallback(async (documentIds: string[]) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await Promise.all(
        documentIds.map(id => api.current.restoreDocument(id))
      );
      
      await refreshDocuments();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to restore documents',
        loading: false 
      }));
    }
  }, [refreshDocuments]);

  const duplicateDocument = useCallback(async (documentId: string, name?: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await api.current.duplicateDocument(documentId, name);
      await refreshDocuments();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to duplicate document',
        loading: false 
      }));
    }
  }, [refreshDocuments]);

  const moveDocuments = useCallback(async (documentIds: string[], targetFolderId?: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await Promise.all(
        documentIds.map(id => api.current.moveDocument(id, targetFolderId))
      );
      
      await refreshDocuments();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to move documents',
        loading: false 
      }));
    }
  }, [refreshDocuments]);

  const downloadDocument = useCallback(async (documentId: string, versionId?: string) => {
    try {
      const response = await api.current.getDownloadUrl(documentId, versionId);
      
      if (response.success && response.data) {
        const link = document.createElement('a');
        link.href = response.data.url;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setState(prev => ({ ...prev, error: response.error || 'Failed to download document' }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to download document' 
      }));
    }
  }, []);

  const downloadMultiple = useCallback(async (documentIds: string[]) => {
    // Download each document individually
    for (const documentId of documentIds) {
      await downloadDocument(documentId);
    }
  }, [downloadDocument]);

  // Folder Operations
  const createFolder = useCallback(async (name: string, parentId?: string, description?: string) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await api.current.createFolder({
        name,
        parentId: parentId || state.currentFolder?.id,
        description,
      });
      
      await refreshDocuments();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create folder',
        loading: false 
      }));
    }
  }, [state.currentFolder?.id, refreshDocuments]);

  const updateFolder = useCallback(async (folderId: string, updates: Partial<Folder>) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await api.current.updateFolder(folderId, updates);
      await refreshDocuments();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update folder',
        loading: false 
      }));
    }
  }, [refreshDocuments]);

  const deleteFolder = useCallback(async (folderId: string, deleteContents = false) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await api.current.deleteFolder(folderId, deleteContents);
      
      setState(prev => ({
        ...prev,
        folders: prev.folders.filter(folder => folder.id !== folderId),
        selectedFolders: new Set(Array.from(prev.selectedFolders).filter(id => id !== folderId)),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete folder',
        loading: false 
      }));
    }
  }, []);

  // Search & Filter
  const searchDocuments = useCallback(async (
    query: string, 
    filters: DocumentSearch['filters'] = {}
  ) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const searchParams: DocumentSearch = {
        query,
        filters: { ...state.filterBy, ...filters },
        sort: { field: state.sortBy, direction: state.sortDirection },
        page: 1,
        limit: 50,
      };
      
      const response = await api.current.searchDocuments(searchParams);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          searchResults: response.data,
          loading: false,
        }));
      } else {
        setState(prev => ({ ...prev, error: response.error || 'Search failed', loading: false }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Search failed',
        loading: false 
      }));
    }
  }, [state.filterBy, state.sortBy, state.sortDirection]);

  const clearSearch = useCallback(() => {
    setState(prev => ({ ...prev, searchResults: undefined }));
  }, []);

  const setFilter = useCallback((filter: Partial<DocumentsState['filterBy']>) => {
    setState(prev => ({ ...prev, filterBy: { ...prev.filterBy, ...filter } }));
  }, []);

  const setSorting = useCallback((
    sortBy: DocumentsState['sortBy'], 
    direction: DocumentsState['sortDirection'] = 'desc'
  ) => {
    setState(prev => ({ ...prev, sortBy, sortDirection: direction }));
  }, []);

  const setViewMode = useCallback((mode: DocumentsState['viewMode']) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  // Selection
  const selectDocument = useCallback((documentId: string, multi = false) => {
    setState(prev => {
      const newSelection = new Set(multi ? prev.selectedDocuments : []);
      
      if (newSelection.has(documentId)) {
        newSelection.delete(documentId);
      } else {
        newSelection.add(documentId);
      }
      
      return { ...prev, selectedDocuments: newSelection };
    });
  }, []);

  const selectFolder = useCallback((folderId: string, multi = false) => {
    setState(prev => {
      const newSelection = new Set(multi ? prev.selectedFolders : []);
      
      if (newSelection.has(folderId)) {
        newSelection.delete(folderId);
      } else {
        newSelection.add(folderId);
      }
      
      return { ...prev, selectedFolders: newSelection };
    });
  }, []);

  const selectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedDocuments: new Set(prev.documents.map(doc => doc.id)),
      selectedFolders: new Set(prev.folders.map(folder => folder.id)),
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedDocuments: new Set(),
      selectedFolders: new Set(),
    }));
  }, []);

  // Permissions & Sharing
  const updatePermissions = useCallback(async (
    documentId: string, 
    permissions: Partial<DocumentPermissions>
  ) => {
    try {
      const response = await api.current.updatePermissions(documentId, permissions);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc =>
            doc.id === documentId ? { ...doc, permissions: { ...doc.permissions, ...permissions } } : doc
          ),
        }));
      } else {
        setState(prev => ({ ...prev, error: response.error || 'Failed to update permissions' }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update permissions' 
      }));
    }
  }, []);

  const shareWithUsers = useCallback(async (
    documentId: string, 
    users: Array<{ email: string; role: SharedUser['role'] }>
  ) => {
    try {
      const response = await api.current.shareWithUsers(documentId, users);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc =>
            doc.id === documentId 
              ? { ...doc, permissions: { ...doc.permissions, sharedWith: response.data! } }
              : doc
          ),
        }));
      } else {
        setState(prev => ({ ...prev, error: response.error || 'Failed to share document' }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to share document' 
      }));
    }
  }, []);

  const removeUserAccess = useCallback(async (documentId: string, userId: string) => {
    try {
      const response = await api.current.removeUserAccess(documentId, userId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc =>
            doc.id === documentId 
              ? { 
                  ...doc, 
                  permissions: { 
                    ...doc.permissions, 
                    sharedWith: doc.permissions.sharedWith.filter(user => user.userId !== userId) 
                  } 
                }
              : doc
          ),
        }));
      } else {
        setState(prev => ({ ...prev, error: response.error || 'Failed to remove user access' }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to remove user access' 
      }));
    }
  }, []);

  const createShareLink = useCallback(async (
    documentId: string, 
    options: {
      name?: string;
      permissions: Partial<UserPermissions>;
      password?: string;
      expiresAt?: string;
      maxUses?: number;
    }
  ): Promise<ShareLink> => {
    const response = await api.current.createShareLink(documentId, options);
    
    if (response.success && response.data) {
      setState(prev => ({
        ...prev,
        documents: prev.documents.map(doc =>
          doc.id === documentId 
            ? { 
                ...doc, 
                permissions: { 
                  ...doc.permissions, 
                  shareLinks: [...doc.permissions.shareLinks, response.data!] 
                } 
              }
            : doc
        ),
      }));
      
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to create share link');
    }
  }, []);

  const deleteShareLink = useCallback(async (documentId: string, linkId: string) => {
    try {
      const response = await api.current.deleteShareLink(documentId, linkId);
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc =>
            doc.id === documentId 
              ? { 
                  ...doc, 
                  permissions: { 
                    ...doc.permissions, 
                    shareLinks: doc.permissions.shareLinks.filter(link => link.id !== linkId) 
                  } 
                }
              : doc
          ),
        }));
      } else {
        setState(prev => ({ ...prev, error: response.error || 'Failed to delete share link' }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete share link' 
      }));
    }
  }, []);

  // Versions
  const getVersions = useCallback(async (documentId: string): Promise<DocumentVersion[]> => {
    const response = await api.current.getDocumentVersions(documentId);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to get versions');
    }
  }, []);

  const uploadNewVersion = useCallback(async (
    documentId: string, 
    file: File, 
    changes?: string
  ) => {
    try {
      await api.current.uploadNewVersion(documentId, file, changes);
      await refreshDocuments();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to upload new version' 
      }));
    }
  }, [refreshDocuments]);

  const restoreVersion = useCallback(async (documentId: string, versionId: string) => {
    try {
      await api.current.restoreVersion(documentId, versionId);
      await refreshDocuments();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to restore version' 
      }));
    }
  }, [refreshDocuments]);

  // Comments
  const getComments = useCallback(async (documentId: string): Promise<DocumentComment[]> => {
    const response = await api.current.getComments(documentId);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to get comments');
    }
  }, []);

  const addComment = useCallback(async (
    documentId: string, 
    content: string, 
    position?: { x: number; y: number; page?: number }
  ) => {
    try {
      await api.current.addComment(documentId, content, position);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to add comment' 
      }));
    }
  }, []);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    try {
      await api.current.updateComment(commentId, content);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update comment' 
      }));
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      await api.current.deleteComment(commentId);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete comment' 
      }));
    }
  }, []);

  const resolveComment = useCallback(async (commentId: string) => {
    try {
      await api.current.resolveComment(commentId);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to resolve comment' 
      }));
    }
  }, []);

  // Upload Control
  const cancelUpload = useCallback((uploadId: string) => {
    api.current.cancelUpload(uploadId);
    setState(prev => {
      const newUploads = new Map(prev.uploads);
      newUploads.delete(uploadId);
      return { ...prev, uploads: newUploads };
    });
  }, []);

  const pauseUpload = useCallback((uploadId: string) => {
    // Implementation would depend on upload service
    console.log('Pause upload:', uploadId);
  }, []);

  const resumeUpload = useCallback((uploadId: string) => {
    // Implementation would depend on upload service
    console.log('Resume upload:', uploadId);
  }, []);

  // Utility Functions
  const getStorageQuota = useCallback(async () => {
    try {
      const response = await api.current.getStorageQuota();
      
      if (response.success && response.data) {
        setState(prev => ({ ...prev, storageQuota: response.data }));
      }
    } catch (error) {
      console.error('Failed to get storage quota:', error);
    }
  }, []);

  const scanDocument = useCallback(async (documentId: string): Promise<SecurityScanResult> => {
    const response = await api.current.scanDocument(documentId);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to scan document');
    }
  }, []);

  const getActivity = useCallback(async (documentId: string): Promise<DocumentActivity[]> => {
    const response = await api.current.getDocumentActivity(documentId);
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to get activity');
    }
  }, []);

  const previewDocument = useCallback(async (documentId: string): Promise<string> => {
    const response = await api.current.getPreviewUrl(documentId);
    
    if (response.success && response.data) {
      return response.data.url;
    } else {
      throw new Error(response.error || 'Failed to get preview');
    }
  }, []);

  const getThumbnail = useCallback(async (documentId: string, size = 'medium'): Promise<string> => {
    const response = await api.current.getThumbnailUrl(documentId, size);
    
    if (response.success && response.data) {
      return response.data.url;
    } else {
      throw new Error(response.error || 'Failed to get thumbnail');
    }
  }, []);

  const operations: DocumentOperations = {
    // Navigation
    navigateToFolder,
    navigateUp,
    refreshDocuments,
    
    // Document Management
    uploadFiles,
    uploadFromUrl,
    deleteDocuments,
    restoreDocuments,
    duplicateDocument,
    moveDocuments,
    downloadDocument,
    downloadMultiple,
    
    // Folder Management
    createFolder,
    updateFolder,
    deleteFolder,
    
    // Search & Filter
    searchDocuments,
    clearSearch,
    setFilter,
    setSorting,
    setViewMode,
    
    // Selection
    selectDocument,
    selectFolder,
    selectAll,
    clearSelection,
    
    // Permissions & Sharing
    updatePermissions,
    shareWithUsers,
    removeUserAccess,
    createShareLink,
    deleteShareLink,
    
    // Versions
    getVersions,
    uploadNewVersion,
    restoreVersion,
    
    // Comments
    getComments,
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
    
    // Upload Control
    cancelUpload,
    pauseUpload,
    resumeUpload,
    
    // Utility
    getStorageQuota,
    scanDocument,
    getActivity,
    previewDocument,
    getThumbnail,
  };

  return [state, operations];
} 