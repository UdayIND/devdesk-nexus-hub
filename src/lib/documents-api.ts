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

export class DocumentsAPI {
  private baseURL: string;
  private authToken: string | null = null;
  private uploadAbortControllers: Map<string, AbortController> = new Map();

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.authToken = localStorage.getItem('auth_token');
  }

  // Authentication
  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Document Management
  async getDocuments(
    folderId?: string,
    page = 1,
    limit = 20,
    sort = 'updatedAt',
    direction: 'asc' | 'desc' = 'desc'
  ): Promise<ApiResponse<DocumentListResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      direction,
    });
    
    if (folderId) params.append('folderId', folderId);

    return this.request<DocumentListResponse>(`/api/documents?${params}`);
  }

  async getDocument(documentId: string): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/api/documents/${documentId}`);
  }

  async searchDocuments(searchParams: DocumentSearch): Promise<ApiResponse<DocumentSearchResult>> {
    return this.request<DocumentSearchResult>('/api/documents/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchParams),
    });
  }

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

  async getStorageQuota(): Promise<ApiResponse<StorageQuota>> {
    return this.request<StorageQuota>('/api/storage/quota');
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