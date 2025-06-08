// Documents API Service for File Storage & Sharing with Permissions

// Core Document Types
export interface Document {
  id: string;
  name: string;
  originalName: string;
  description?: string;
  type: string;
  mimeType: string;
  size: number;
  ownerId: string;
  folderId?: string;
  path: string;
  url: string;
  downloadUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  checksum: string;
  version: number;
  status: 'uploading' | 'processing' | 'ready' | 'error' | 'deleted';
  tags: string[];
  metadata: DocumentMetadata;
  permissions: DocumentPermissions;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  expiresAt?: string;
}

export interface DocumentMetadata {
  width?: number;
  height?: number;
  duration?: number;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  author?: string;
  title?: string;
  subject?: string;
  keywords?: string[];
  customFields: Record<string, any>;
}

export interface DocumentPermissions {
  isPublic: boolean;
  allowDownload: boolean;
  allowShare: boolean;
  allowComment: boolean;
  allowEdit: boolean;
  passwordProtected: boolean;
  expirationDate?: string;
  maxDownloads?: number;
  downloadCount: number;
  accessLevel: 'private' | 'team' | 'organization' | 'public';
  sharedWith: SharedUser[];
  shareLinks: ShareLink[];
}

export interface SharedUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'viewer' | 'commenter' | 'editor' | 'admin';
  permissions: UserPermissions;
  invitedAt: string;
  acceptedAt?: string;
  lastAccessedAt?: string;
}

export interface UserPermissions {
  canView: boolean;
  canDownload: boolean;
  canComment: boolean;
  canEdit: boolean;
  canShare: boolean;
  canDelete: boolean;
  canManagePermissions: boolean;
}

export interface ShareLink {
  id: string;
  token: string;
  url: string;
  name?: string;
  permissions: UserPermissions;
  password?: string;
  expiresAt?: string;
  maxUses?: number;
  useCount: number;
  createdAt: string;
  lastUsedAt?: string;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  ownerId: string;
  path: string;
  permissions: DocumentPermissions;
  documentCount: number;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  name: string;
  size: number;
  checksum: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  changes?: string;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  position?: { x: number; y: number; page?: number };
  parentId?: string;
  replies: DocumentComment[];
  reactions: CommentReaction[];
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentReaction {
  emoji: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface UploadProgress {
  documentId: string;
  fileName: string;
  loaded: number;
  total: number;
  percentage: number;
  speed: number;
  timeRemaining: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface DocumentActivity {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: 'created' | 'updated' | 'downloaded' | 'shared' | 'commented' | 'deleted' | 'restored';
  details?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface StorageQuota {
  used: number;
  total: number;
  percentage: number;
  documentCount: number;
  byType: Record<string, { count: number; size: number }>;
}

export interface DocumentSearch {
  query: string;
  filters: {
    type?: string[];
    owner?: string[];
    folder?: string;
    tags?: string[];
    dateRange?: { start: string; end: string };
    sizeRange?: { min: number; max: number };
    hasComments?: boolean;
    isShared?: boolean;
  };
  sort: {
    field: 'name' | 'size' | 'createdAt' | 'updatedAt' | 'lastAccessedAt';
    direction: 'asc' | 'desc';
  };
  page: number;
  limit: number;
}

export interface DocumentSearchResult {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  facets: {
    types: Array<{ type: string; count: number }>;
    owners: Array<{ userId: string; name: string; count: number }>;
    tags: Array<{ tag: string; count: number }>;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DocumentListResponse {
  documents: Document[];
  folders: Folder[];
  total: number;
  page: number;
  limit: number;
  path: string[];
}

export interface UploadResponse {
  document: Document;
  uploadUrl?: string;
  uploadId?: string;
}

// Security & Validation
export interface SecurityScanResult {
  documentId: string;
  isClean: boolean;
  threats: Array<{
    type: 'virus' | 'malware' | 'suspicious' | 'phishing';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
  scanDate: string;
  scanner: string;
}

export interface AccessLog {
  id: string;
  documentId: string;
  userId?: string;
  userAgent: string;
  ipAddress: string;
  action: 'view' | 'download' | 'share' | 'edit' | 'delete';
  success: boolean;
  error?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Mock data for demo purposes
const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: 'Project Requirements.pdf',
    originalName: 'Project Requirements.pdf',
    description: 'Detailed project requirements document',
    type: 'pdf',
    mimeType: 'application/pdf',
    size: 2485760,
    ownerId: 'user-1',
    path: '/documents/Project Requirements.pdf',
    url: '/documents/1',
    downloadUrl: '/documents/1/download',
    previewUrl: '/documents/1/preview',
    thumbnailUrl: '/documents/1/thumbnail',
    checksum: 'abc123',
    version: 1,
    status: 'ready',
    tags: ['requirements', 'project'],
    metadata: {
      pageCount: 15,
      author: 'John Doe',
      title: 'Project Requirements',
      customFields: {}
    },
    permissions: {
      isPublic: false,
      allowDownload: true,
      allowShare: true,
      allowComment: true,
      allowEdit: false,
      passwordProtected: false,
      downloadCount: 5,
      accessLevel: 'team',
      sharedWith: [],
      shareLinks: []
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    lastAccessedAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: '2',
    name: 'Design Mockups.figma',
    originalName: 'Design Mockups.figma',
    description: 'UI/UX design mockups for the new dashboard',
    type: 'figma',
    mimeType: 'application/figma',
    size: 15728640,
    ownerId: 'user-2',
    path: '/documents/Design Mockups.figma',
    url: '/documents/2',
    downloadUrl: '/documents/2/download',
    previewUrl: '/documents/2/preview',
    thumbnailUrl: '/documents/2/thumbnail',
    checksum: 'def456',
    version: 3,
    status: 'ready',
    tags: ['design', 'mockups', 'ui'],
    metadata: {
      width: 1920,
      height: 1080,
      author: 'Jane Smith',
      title: 'Dashboard Mockups',
      customFields: {}
    },
    permissions: {
      isPublic: false,
      allowDownload: true,
      allowShare: true,
      allowComment: true,
      allowEdit: true,
      passwordProtected: false,
      downloadCount: 12,
      accessLevel: 'team',
      sharedWith: [],
      shareLinks: []
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    lastAccessedAt: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: '3',
    name: 'API Documentation.md',
    originalName: 'API Documentation.md',
    description: 'Complete API documentation with examples',
    type: 'markdown',
    mimeType: 'text/markdown',
    size: 524288,
    ownerId: 'user-1',
    path: '/documents/API Documentation.md',
    url: '/documents/3',
    downloadUrl: '/documents/3/download',
    previewUrl: '/documents/3/preview',
    thumbnailUrl: '/documents/3/thumbnail',
    checksum: 'ghi789',
    version: 2,
    status: 'ready',
    tags: ['documentation', 'api', 'starred'],
    metadata: {
      wordCount: 2500,
      author: 'Development Team',
      title: 'API Documentation',
      customFields: {}
    },
    permissions: {
      isPublic: true,
      allowDownload: true,
      allowShare: true,
      allowComment: true,
      allowEdit: false,
      passwordProtected: false,
      downloadCount: 28,
      accessLevel: 'organization',
      sharedWith: [
        {
          id: 'share-1',
          userId: 'user-3',
          email: 'teammate@company.com',
          name: 'Team Member',
          role: 'viewer',
          permissions: {
            canView: true,
            canDownload: true,
            canComment: false,
            canEdit: false,
            canShare: false,
            canDelete: false,
            canManagePermissions: false
          },
          invitedAt: new Date(Date.now() - 86400000).toISOString(),
          acceptedAt: new Date(Date.now() - 82800000).toISOString(),
          lastAccessedAt: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      shareLinks: []
    },
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    lastAccessedAt: new Date(Date.now() - 600000).toISOString()
  }
];

const MOCK_FOLDERS: Folder[] = [
  {
    id: 'folder-1',
    name: 'Project Assets',
    description: 'All project-related assets and resources',
    ownerId: 'user-1',
    path: '/Project Assets',
    permissions: {
      isPublic: false,
      allowDownload: true,
      allowShare: true,
      allowComment: true,
      allowEdit: true,
      passwordProtected: false,
      downloadCount: 0,
      accessLevel: 'team',
      sharedWith: [],
      shareLinks: []
    },
    documentCount: 8,
    totalSize: 52428800,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'folder-2',
    name: 'Documentation',
    description: 'Project documentation and guides',
    ownerId: 'user-1',
    path: '/Documentation',
    permissions: {
      isPublic: true,
      allowDownload: true,
      allowShare: true,
      allowComment: true,
      allowEdit: false,
      passwordProtected: false,
      downloadCount: 0,
      accessLevel: 'organization',
      sharedWith: [],
      shareLinks: []
    },
    documentCount: 12,
    totalSize: 15728640,
    createdAt: new Date(Date.now() - 1209600000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

const MOCK_STORAGE_QUOTA: StorageQuota = {
  used: 157286400, // ~150MB
  total: 5368709120, // 5GB
  percentage: 2.93,
  documentCount: 42,
  byType: {
    'application/pdf': { count: 8, size: 52428800 },
    'image/png': { count: 15, size: 41943040 },
    'text/markdown': { count: 6, size: 3145728 },
    'application/figma': { count: 3, size: 47185920 },
    'application/json': { count: 10, size: 1048576 }
  }
};

// Production-ready: Always try real API first, fallback to mock data only if API fails
const USE_MOCK_DATA = false; // Always attempt real API first

export class DocumentsAPI {
  private baseURL: string;
  private authToken: string | null = null;
  private uploadAbortControllers: Map<string, AbortController> = new Map();

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'https://devdesk-nexus-hub.onrender.com') {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Add mock response helper
  private mockResponse<T>(data: T): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data });
      }, 300 + Math.random() * 700); // Simulate network delay
    });
  }

  private mockError(message: string): Promise<ApiResponse<any>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: false, error: message });
      }, 300);
    });
  }

  async getDocuments(
    folderId?: string,
    page = 1,
    limit = 20,
    sort = 'updatedAt',
    direction: 'asc' | 'desc' = 'desc'
  ): Promise<ApiResponse<DocumentListResponse>> {
    // Try real API first
    if (!USE_MOCK_DATA) {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sort,
          direction,
        });

        if (folderId) {
          params.append('folderId', folderId);
        }

        const result = await this.request<DocumentListResponse>(`/api/documents?${params}`);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn('API request failed, falling back to mock data:', error);
      }
    }

    // Fallback to mock data
    let filteredDocs = [...MOCK_DOCUMENTS];
    
    // Apply sorting
    filteredDocs.sort((a, b) => {
      const aVal = a[sort as keyof Document] as string;
      const bVal = b[sort as keyof Document] as string;
      const comparison = aVal.localeCompare(bVal);
      return direction === 'asc' ? comparison : -comparison;
    });

    const response: DocumentListResponse = {
      documents: filteredDocs,
      folders: MOCK_FOLDERS,
      total: filteredDocs.length,
      page,
      limit,
      path: folderId ? [folderId] : ['']
    };

    return this.mockResponse(response);
  }

  async getDocument(documentId: string): Promise<ApiResponse<Document>> {
    if (USE_MOCK_DATA) {
      const document = MOCK_DOCUMENTS.find(doc => doc.id === documentId);
      if (document) {
        return this.mockResponse(document);
      } else {
        return this.mockError('Document not found');
      }
    }

    return this.request<Document>(`/api/documents/${documentId}`);
  }

  async searchDocuments(searchParams: DocumentSearch): Promise<ApiResponse<DocumentSearchResult>> {
    if (USE_MOCK_DATA) {
      const { query, filters, sort, page, limit } = searchParams;
      let filteredDocs = [...MOCK_DOCUMENTS];

      // Apply search query
      if (query) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.name.toLowerCase().includes(query.toLowerCase()) ||
          doc.description?.toLowerCase().includes(query.toLowerCase()) ||
          doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      }

      // Apply filters
      if (filters.type?.length) {
        filteredDocs = filteredDocs.filter(doc => filters.type!.includes(doc.type));
      }

      if (filters.tags?.length) {
        filteredDocs = filteredDocs.filter(doc => 
          filters.tags!.some(tag => doc.tags.includes(tag))
        );
      }

      // Apply sorting
      filteredDocs.sort((a, b) => {
        const aVal = a[sort.field as keyof Document] as string;
        const bVal = b[sort.field as keyof Document] as string;
        const comparison = aVal.localeCompare(bVal);
        return sort.direction === 'asc' ? comparison : -comparison;
      });

      const start = (page - 1) * limit;
      const paginatedDocs = filteredDocs.slice(start, start + limit);

      const result: DocumentSearchResult = {
        documents: paginatedDocs,
        total: filteredDocs.length,
        page,
        limit,
        facets: {
          types: [
            { type: 'pdf', count: MOCK_DOCUMENTS.filter(d => d.type === 'pdf').length },
            { type: 'figma', count: MOCK_DOCUMENTS.filter(d => d.type === 'figma').length },
            { type: 'markdown', count: MOCK_DOCUMENTS.filter(d => d.type === 'markdown').length }
          ],
          owners: [
            { userId: 'user-1', name: 'John Doe', count: MOCK_DOCUMENTS.filter(d => d.ownerId === 'user-1').length },
            { userId: 'user-2', name: 'Jane Smith', count: MOCK_DOCUMENTS.filter(d => d.ownerId === 'user-2').length }
          ],
          tags: [
            { tag: 'requirements', count: 1 },
            { tag: 'design', count: 1 },
            { tag: 'documentation', count: 1 },
            { tag: 'api', count: 1 }
          ]
        }
      };

      return this.mockResponse(result);
    }

    return this.request<DocumentSearchResult>('/api/documents/search', {
      method: 'POST',
      body: JSON.stringify(searchParams),
    });
  }

  async getStorageQuota(): Promise<ApiResponse<StorageQuota>> {
    if (USE_MOCK_DATA) {
      return this.mockResponse(MOCK_STORAGE_QUOTA);
    }

    return this.request<StorageQuota>('/api/documents/quota');
  }

  // Document Management
  async uploadDocument(
    file: File,
    options: {
      folderId?: string;
      description?: string;
      tags?: string[];
      permissions?: Partial<DocumentPermissions>;
      onProgress?: (progress: UploadProgress) => void;
    } = {}
  ): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.folderId) formData.append('folderId', options.folderId);
    if (options.description) formData.append('description', options.description);
    if (options.tags) formData.append('tags', JSON.stringify(options.tags));
    if (options.permissions) formData.append('permissions', JSON.stringify(options.permissions));

    const abortController = new AbortController();
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.uploadAbortControllers.set(uploadId, abortController);

    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && options.onProgress) {
            const progress: UploadProgress = {
              documentId: uploadId,
              fileName: file.name,
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
              speed: 0, // Calculate based on time
              timeRemaining: 0, // Calculate based on speed
              status: 'uploading',
            };
            options.onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          this.uploadAbortControllers.delete(uploadId);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          this.uploadAbortControllers.delete(uploadId);
          reject(new Error('Upload failed'));
        });

        xhr.addEventListener('abort', () => {
          this.uploadAbortControllers.delete(uploadId);
          reject(new Error('Upload cancelled'));
        });

        abortController.signal.addEventListener('abort', () => {
          xhr.abort();
        });

        xhr.open('POST', `${this.baseURL}/api/documents/upload`);
        
        // Set auth header
        if (this.authToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`);
        }
        
        xhr.send(formData);
      });
    } catch (error) {
      this.uploadAbortControllers.delete(uploadId);
      throw error;
    }
  }

  async uploadMultipleDocuments(
    files: File[],
    options: {
      folderId?: string;
      onProgress?: (progress: UploadProgress[]) => void;
      onComplete?: (results: Array<ApiResponse<UploadResponse>>) => void;
    } = {}
  ): Promise<Array<ApiResponse<UploadResponse>>> {
    const results: Array<ApiResponse<UploadResponse>> = [];
    const progressMap = new Map<string, UploadProgress>();

    for (const file of files) {
      try {
        const result = await this.uploadDocument(file, {
          ...options,
          onProgress: (progress) => {
            progressMap.set(progress.documentId, progress);
            if (options.onProgress) {
              options.onProgress(Array.from(progressMap.values()));
            }
          },
        });
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    if (options.onComplete) {
      options.onComplete(results);
    }

    return results;
  }

  async cancelUpload(uploadId: string): Promise<void> {
    const controller = this.uploadAbortControllers.get(uploadId);
    if (controller) {
      controller.abort();
      this.uploadAbortControllers.delete(uploadId);
    }
  }

  async updateDocument(documentId: string, updates: Partial<Document>): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/api/documents/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }

  async deleteDocument(documentId: string, permanent = false): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/documents/${documentId}?permanent=${permanent}`, {
      method: 'DELETE',
    });
  }

  async restoreDocument(documentId: string): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/api/documents/${documentId}/restore`, {
      method: 'POST',
    });
  }

  async duplicateDocument(documentId: string, name?: string): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/api/documents/${documentId}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  // Folder Management
  async getFolders(parentId?: string): Promise<ApiResponse<Folder[]>> {
    const params = parentId ? `?parentId=${parentId}` : '';
    return this.request<Folder[]>(`/api/folders${params}`);
  }

  async createFolder(data: {
    name: string;
    description?: string;
    parentId?: string;
    permissions?: Partial<DocumentPermissions>;
  }): Promise<ApiResponse<Folder>> {
    return this.request<Folder>('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async updateFolder(folderId: string, updates: Partial<Folder>): Promise<ApiResponse<Folder>> {
    return this.request<Folder>(`/api/folders/${folderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }

  async deleteFolder(folderId: string, deleteContents = false): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/folders/${folderId}?deleteContents=${deleteContents}`, {
      method: 'DELETE',
    });
  }

  async moveDocument(documentId: string, targetFolderId?: string): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/api/documents/${documentId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetFolderId }),
    });
  }

  // Permissions & Sharing
  async updatePermissions(
    documentId: string,
    permissions: Partial<DocumentPermissions>
  ): Promise<ApiResponse<DocumentPermissions>> {
    return this.request<DocumentPermissions>(`/api/documents/${documentId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permissions),
    });
  }

  async shareWithUsers(
    documentId: string,
    users: Array<{ email: string; role: SharedUser['role'] }>
  ): Promise<ApiResponse<SharedUser[]>> {
    return this.request<SharedUser[]>(`/api/documents/${documentId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users }),
    });
  }

  async removeUserAccess(documentId: string, userId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/documents/${documentId}/share/${userId}`, {
      method: 'DELETE',
    });
  }

  async createShareLink(
    documentId: string,
    options: {
      name?: string;
      permissions: Partial<UserPermissions>;
      password?: string;
      expiresAt?: string;
      maxUses?: number;
    }
  ): Promise<ApiResponse<ShareLink>> {
    return this.request<ShareLink>(`/api/documents/${documentId}/share-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
  }

  async getShareLinks(documentId: string): Promise<ApiResponse<ShareLink[]>> {
    return this.request<ShareLink[]>(`/api/documents/${documentId}/share-links`);
  }

  async deleteShareLink(documentId: string, linkId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/documents/${documentId}/share-links/${linkId}`, {
      method: 'DELETE',
    });
  }

  async accessSharedDocument(token: string, password?: string): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/api/shared/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
  }

  // Versions
  async getDocumentVersions(documentId: string): Promise<ApiResponse<DocumentVersion[]>> {
    return this.request<DocumentVersion[]>(`/api/documents/${documentId}/versions`);
  }

  async uploadNewVersion(
    documentId: string,
    file: File,
    changes?: string
  ): Promise<ApiResponse<DocumentVersion>> {
    const formData = new FormData();
    formData.append('file', file);
    if (changes) formData.append('changes', changes);

    return this.request<DocumentVersion>(`/api/documents/${documentId}/versions`, {
      method: 'POST',
      body: formData,
    });
  }

  async restoreVersion(documentId: string, versionId: string): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/api/documents/${documentId}/versions/${versionId}/restore`, {
      method: 'POST',
    });
  }

  // Comments
  async getComments(documentId: string): Promise<ApiResponse<DocumentComment[]>> {
    return this.request<DocumentComment[]>(`/api/documents/${documentId}/comments`);
  }

  async addComment(
    documentId: string,
    content: string,
    position?: { x: number; y: number; page?: number },
    parentId?: string
  ): Promise<ApiResponse<DocumentComment>> {
    return this.request<DocumentComment>(`/api/documents/${documentId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, position, parentId }),
    });
  }

  async updateComment(commentId: string, content: string): Promise<ApiResponse<DocumentComment>> {
    return this.request<DocumentComment>(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async resolveComment(commentId: string): Promise<ApiResponse<DocumentComment>> {
    return this.request<DocumentComment>(`/api/comments/${commentId}/resolve`, {
      method: 'POST',
    });
  }

  async addCommentReaction(commentId: string, emoji: string): Promise<ApiResponse<DocumentComment>> {
    return this.request<DocumentComment>(`/api/comments/${commentId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
  }

  // Download & Preview
  async getDownloadUrl(documentId: string, versionId?: string): Promise<ApiResponse<{ url: string; expiresAt: string }>> {
    const params = versionId ? `?versionId=${versionId}` : '';
    return this.request<{ url: string; expiresAt: string }>(`/api/documents/${documentId}/download${params}`);
  }

  async getPreviewUrl(documentId: string, page?: number): Promise<ApiResponse<{ url: string; expiresAt: string }>> {
    const params = page ? `?page=${page}` : '';
    return this.request<{ url: string; expiresAt: string }>(`/api/documents/${documentId}/preview${params}`);
  }

  async getThumbnailUrl(documentId: string, size = 'medium'): Promise<ApiResponse<{ url: string; expiresAt: string }>> {
    return this.request<{ url: string; expiresAt: string }>(`/api/documents/${documentId}/thumbnail?size=${size}`);
  }

  // Analytics & Activity
  async getDocumentActivity(documentId: string, limit = 50): Promise<ApiResponse<DocumentActivity[]>> {
    return this.request<DocumentActivity[]>(`/api/documents/${documentId}/activity?limit=${limit}`);
  }

  async getAccessLogs(documentId: string, limit = 100): Promise<ApiResponse<AccessLog[]>> {
    return this.request<AccessLog[]>(`/api/documents/${documentId}/access-logs?limit=${limit}`);
  }

  // Security
  async scanDocument(documentId: string): Promise<ApiResponse<SecurityScanResult>> {
    return this.request<SecurityScanResult>(`/api/documents/${documentId}/scan`, {
      method: 'POST',
    });
  }

  async reportDocument(documentId: string, reason: string, details?: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/documents/${documentId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, details }),
    });
  }

  // Utility Methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    if (mimeType.includes('text/')) return '📄';
    return '📄';
  }

  isPreviewable(mimeType: string): boolean {
    const previewableTypes = [
      'image/',
      'application/pdf',
      'text/',
      'application/json',
      'application/xml',
    ];
    
    return previewableTypes.some(type => mimeType.startsWith(type));
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    // Size limit (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 100MB limit' };
    }

    // Blocked extensions
    const blockedExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (blockedExtensions.includes(extension)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Blocked MIME types
    const blockedMimeTypes = [
      'application/x-executable',
      'application/x-msdownload',
      'application/x-msdos-program',
    ];
    if (blockedMimeTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    return { valid: true };
  }

  generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .trim()
      .substring(0, 255); // Limit length
  }
}

export default DocumentsAPI; 