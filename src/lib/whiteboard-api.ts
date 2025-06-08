import { io, Socket } from 'socket.io-client';

// Types for Whiteboard API
export interface Board {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  inviteCode?: string;
  thumbnail?: string;
  collaborators: BoardCollaborator[];
  permissions: BoardPermissions;
}

export interface BoardCollaborator {
  id: string;
  userId: string;
  boardId: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  isActive: boolean;
  cursor?: {
    x: number;
    y: number;
    color: string;
  };
}

export interface BoardPermissions {
  canEdit: boolean;
  canInvite: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export interface BoardElement {
  id: string;
  boardId: string;
  type: 'path' | 'text' | 'sticky-note' | 'shape' | 'image';
  data: any;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  style: {
    color?: string;
    backgroundColor?: string;
    strokeWidth?: number;
    fontSize?: number;
    fontFamily?: string;
    opacity?: number;
    rotation?: number;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface BoardEvent {
  id: string;
  boardId: string;
  type: 'element-create' | 'element-update' | 'element-delete' | 'cursor-move' | 'user-join' | 'user-leave';
  data: any;
  userId: string;
  timestamp: string;
  version: number;
}

export interface DrawingPath {
  id: string;
  points: { x: number; y: number; pressure?: number }[];
  color: string;
  strokeWidth: number;
  tool: 'pen' | 'highlighter' | 'eraser';
}

export interface StickyNote {
  id: string;
  text: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  fontSize: number;
}

export interface TextElement {
  id: string;
  text: string;
  position: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
}

export interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'line';
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BoardListResponse {
  boards: Board[];
  total: number;
  page: number;
  limit: number;
}

export interface BoardActivityLog {
  id: string;
  boardId: string;
  userId: string;
  action: string;
  details: any;
  timestamp: string;
  ipAddress?: string;
}

// WebSocket Events
export interface SocketEvents {
  // Client to Server
  'join-board': (boardId: string) => void;
  'leave-board': (boardId: string) => void;
  'board-event': (event: BoardEvent) => void;
  'cursor-move': (data: { boardId: string; x: number; y: number }) => void;
  'start-drawing': (data: { boardId: string; path: Partial<DrawingPath> }) => void;
  'continue-drawing': (data: { boardId: string; pathId: string; point: { x: number; y: number; pressure?: number } }) => void;
  'end-drawing': (data: { boardId: string; pathId: string }) => void;

  // Server to Client
  'board-joined': (data: { board: Board; collaborators: BoardCollaborator[] }) => void;
  'board-left': (data: { userId: string }) => void;
  'board-updated': (event: BoardEvent) => void;
  'collaborator-joined': (collaborator: BoardCollaborator) => void;
  'collaborator-left': (data: { userId: string }) => void;
  'cursor-updated': (data: { userId: string; x: number; y: number; color: string }) => void;
  'drawing-started': (data: { userId: string; path: DrawingPath }) => void;
  'drawing-continued': (data: { userId: string; pathId: string; point: { x: number; y: number; pressure?: number } }) => void;
  'drawing-ended': (data: { userId: string; pathId: string }) => void;
  'error': (error: { message: string; code?: string }) => void;
}

export class WhiteboardAPI {
  private baseURL: string;
  private socket: Socket | null = null;
  private authToken: string | null = null;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'https://devdesk-nexus-hub.onrender.com') {
    this.baseURL = baseURL;
    this.authToken = localStorage.getItem('auth_token');
  }

  // Authentication
  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
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

  // Board Management
  async getBoards(page = 1, limit = 20, search?: string): Promise<ApiResponse<BoardListResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    return this.request<BoardListResponse>(`/api/boards?${params}`);
  }

  async getBoard(boardId: string): Promise<ApiResponse<Board>> {
    return this.request<Board>(`/api/boards/${boardId}`);
  }

  async createBoard(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<Board>> {
    return this.request<Board>('/api/boards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBoard(boardId: string, data: Partial<Board>): Promise<ApiResponse<Board>> {
    return this.request<Board>(`/api/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBoard(boardId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/boards/${boardId}`, {
      method: 'DELETE',
    });
  }

  async duplicateBoard(boardId: string, name?: string): Promise<ApiResponse<Board>> {
    return this.request<Board>(`/api/boards/${boardId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  // Board Elements
  async getBoardElements(boardId: string): Promise<ApiResponse<BoardElement[]>> {
    return this.request<BoardElement[]>(`/api/boards/${boardId}/elements`);
  }

  async createElement(boardId: string, element: Omit<BoardElement, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<ApiResponse<BoardElement>> {
    return this.request<BoardElement>(`/api/boards/${boardId}/elements`, {
      method: 'POST',
      body: JSON.stringify(element),
    });
  }

  async updateElement(boardId: string, elementId: string, data: Partial<BoardElement>): Promise<ApiResponse<BoardElement>> {
    return this.request<BoardElement>(`/api/boards/${boardId}/elements/${elementId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteElement(boardId: string, elementId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/boards/${boardId}/elements/${elementId}`, {
      method: 'DELETE',
    });
  }

  // Board Events
  async applyBoardEvent(boardId: string, event: Omit<BoardEvent, 'id' | 'timestamp' | 'version'>): Promise<ApiResponse<BoardEvent>> {
    return this.request<BoardEvent>(`/api/boards/${boardId}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async getBoardHistory(boardId: string, limit = 50): Promise<ApiResponse<BoardEvent[]>> {
    return this.request<BoardEvent[]>(`/api/boards/${boardId}/history?limit=${limit}`);
  }

  async undoLastAction(boardId: string): Promise<ApiResponse<BoardEvent>> {
    return this.request<BoardEvent>(`/api/boards/${boardId}/undo`, {
      method: 'POST',
    });
  }

  async redoLastAction(boardId: string): Promise<ApiResponse<BoardEvent>> {
    return this.request<BoardEvent>(`/api/boards/${boardId}/redo`, {
      method: 'POST',
    });
  }

  // Collaboration
  async inviteCollaborator(boardId: string, email: string, role: 'editor' | 'viewer' = 'editor'): Promise<ApiResponse<BoardCollaborator>> {
    return this.request<BoardCollaborator>(`/api/boards/${boardId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async updateCollaboratorRole(boardId: string, userId: string, role: 'editor' | 'viewer'): Promise<ApiResponse<BoardCollaborator>> {
    return this.request<BoardCollaborator>(`/api/boards/${boardId}/collaborators/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async removeCollaborator(boardId: string, userId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/boards/${boardId}/collaborators/${userId}`, {
      method: 'DELETE',
    });
  }

  async generateInviteLink(boardId: string, expiresIn?: number): Promise<ApiResponse<{ inviteCode: string; expiresAt: string }>> {
    return this.request<{ inviteCode: string; expiresAt: string }>(`/api/boards/${boardId}/invite-link`, {
      method: 'POST',
      body: JSON.stringify({ expiresIn }),
    });
  }

  async joinBoardByInvite(inviteCode: string): Promise<ApiResponse<Board>> {
    return this.request<Board>(`/api/boards/join/${inviteCode}`, {
      method: 'POST',
    });
  }

  // Export
  async exportBoard(boardId: string, format: 'png' | 'svg' | 'pdf' | 'json'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request<{ downloadUrl: string }>(`/api/boards/${boardId}/export`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  }

  // Activity Logs
  async getBoardActivity(boardId: string, limit = 50): Promise<ApiResponse<BoardActivityLog[]>> {
    return this.request<BoardActivityLog[]>(`/api/boards/${boardId}/activity?limit=${limit}`);
  }

  // Real-time WebSocket Connection
  connectToBoard(boardId: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(this.baseURL, {
        auth: {
          token: this.authToken,
        },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to whiteboard server');
        this.socket!.emit('join-board', boardId);
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Failed to connect to whiteboard server:', error);
        reject(error);
      });

      this.socket.on('error', (error) => {
        console.error('Whiteboard socket error:', error);
      });
    });
  }

  disconnectFromBoard(boardId: string) {
    if (this.socket) {
      this.socket.emit('leave-board', boardId);
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Real-time event emitters
  emitBoardEvent(event: BoardEvent) {
    if (this.socket) {
      this.socket.emit('board-event', event);
    }
  }

  emitCursorMove(boardId: string, x: number, y: number) {
    if (this.socket) {
      this.socket.emit('cursor-move', { boardId, x, y });
    }
  }

  emitDrawingStart(boardId: string, path: Partial<DrawingPath>) {
    if (this.socket) {
      this.socket.emit('start-drawing', { boardId, path });
    }
  }

  emitDrawingContinue(boardId: string, pathId: string, point: { x: number; y: number; pressure?: number }) {
    if (this.socket) {
      this.socket.emit('continue-drawing', { boardId, pathId, point });
    }
  }

  emitDrawingEnd(boardId: string, pathId: string) {
    if (this.socket) {
      this.socket.emit('end-drawing', { boardId, pathId });
    }
  }

  // Event listeners
  onBoardJoined(callback: (data: { board: Board; collaborators: BoardCollaborator[] }) => void) {
    if (this.socket) {
      this.socket.on('board-joined', callback);
    }
  }

  onBoardUpdated(callback: (event: BoardEvent) => void) {
    if (this.socket) {
      this.socket.on('board-updated', callback);
    }
  }

  onCollaboratorJoined(callback: (collaborator: BoardCollaborator) => void) {
    if (this.socket) {
      this.socket.on('collaborator-joined', callback);
    }
  }

  onCollaboratorLeft(callback: (data: { userId: string }) => void) {
    if (this.socket) {
      this.socket.on('collaborator-left', callback);
    }
  }

  onCursorUpdated(callback: (data: { userId: string; x: number; y: number; color: string }) => void) {
    if (this.socket) {
      this.socket.on('cursor-updated', callback);
    }
  }

  onDrawingStarted(callback: (data: { userId: string; path: DrawingPath }) => void) {
    if (this.socket) {
      this.socket.on('drawing-started', callback);
    }
  }

  onDrawingContinued(callback: (data: { userId: string; pathId: string; point: { x: number; y: number; pressure?: number } }) => void) {
    if (this.socket) {
      this.socket.on('drawing-continued', callback);
    }
  }

  onDrawingEnded(callback: (data: { userId: string; pathId: string }) => void) {
    if (this.socket) {
      this.socket.on('drawing-ended', callback);
    }
  }

  // Utility methods
  generateElementId(): string {
    return `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateCoordinates(x: number, y: number): boolean {
    return typeof x === 'number' && typeof y === 'number' && 
           !isNaN(x) && !isNaN(y) && 
           isFinite(x) && isFinite(y);
  }

  sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .trim()
      .substring(0, 10000); // Limit length
  }

  throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;
    
    return ((...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    }) as T;
  }
}

export default WhiteboardAPI; 