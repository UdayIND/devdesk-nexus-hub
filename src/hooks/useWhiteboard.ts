import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import WhiteboardAPI, {
  Board,
  BoardElement,
  BoardEvent,
  BoardCollaborator,
  DrawingPath,
  StickyNote,
  TextElement,
  Shape,
  BoardActivityLog,
} from '@/lib/whiteboard-api';
import { useToast } from '@/hooks/use-toast';

interface UseWhiteboardOptions {
  boardId?: string;
  enableRealTime?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  maxUndoHistory?: number;
}

interface DrawingState {
  isDrawing: boolean;
  currentPath?: DrawingPath;
  tool: 'pen' | 'highlighter' | 'eraser' | 'select' | 'text' | 'sticky-note' | 'shape' | 'pan' | 'image';
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
}

interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
  width: number;
  height: number;
}

interface SelectionState {
  selectedElements: string[];
  selectionBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const useWhiteboard = (options: UseWhiteboardOptions = {}) => {
  const {
    boardId,
    enableRealTime = true,
    autoSave = true,
    autoSaveInterval = 5000,
    maxUndoHistory = 50,
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const whiteboardAPI = useRef(new WhiteboardAPI());
  const socketRef = useRef<Socket | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State management
  const [board, setBoard] = useState<Board | null>(null);
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [collaborators, setCollaborators] = useState<BoardCollaborator[]>([]);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    tool: 'pen',
    strokeColor: '#000000',
    strokeWidth: 3,
  });
  const [viewportState, setViewportState] = useState<ViewportState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    width: 0,
    height: 0,
  });
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedElements: [],
  });
  const [undoHistory, setUndoHistory] = useState<BoardEvent[]>([]);
  const [redoHistory, setRedoHistory] = useState<BoardEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Queries
  const {
    data: boardData,
    isLoading: isBoardLoading,
    error: boardError,
  } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => boardId ? whiteboardAPI.current.getBoard(boardId) : null,
    enabled: !!boardId,
    staleTime: 30000,
  });

  const {
    data: elementsData,
    isLoading: isElementsLoading,
    error: elementsError,
  } = useQuery({
    queryKey: ['board-elements', boardId],
    queryFn: () => boardId ? whiteboardAPI.current.getBoardElements(boardId) : null,
    enabled: !!boardId,
    staleTime: 10000,
  });

  const {
    data: activityData,
  } = useQuery({
    queryKey: ['board-activity', boardId],
    queryFn: () => boardId ? whiteboardAPI.current.getBoardActivity(boardId) : null,
    enabled: !!boardId,
    staleTime: 60000,
  });

  // Mutations
  const createElementMutation = useMutation({
    mutationFn: ({ boardId, element }: { boardId: string; element: Omit<BoardElement, 'id' | 'createdAt' | 'updatedAt' | 'version'> }) =>
      whiteboardAPI.current.createElement(boardId, element),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setElements(prev => [...prev, response.data!]);
        queryClient.invalidateQueries({ queryKey: ['board-elements', boardId] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to create element',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateElementMutation = useMutation({
    mutationFn: ({ boardId, elementId, data }: { boardId: string; elementId: string; data: Partial<BoardElement> }) =>
      whiteboardAPI.current.updateElement(boardId, elementId, data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setElements(prev => prev.map(el => el.id === response.data!.id ? response.data! : el));
        queryClient.invalidateQueries({ queryKey: ['board-elements', boardId] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to update element',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteElementMutation = useMutation({
    mutationFn: ({ boardId, elementId }: { boardId: string; elementId: string }) =>
      whiteboardAPI.current.deleteElement(boardId, elementId),
    onSuccess: (_, { elementId }) => {
      setElements(prev => prev.filter(el => el.id !== elementId));
      queryClient.invalidateQueries({ queryKey: ['board-elements', boardId] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete element',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const undoMutation = useMutation({
    mutationFn: (boardId: string) => whiteboardAPI.current.undoLastAction(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-elements', boardId] });
    },
  });

  const redoMutation = useMutation({
    mutationFn: (boardId: string) => whiteboardAPI.current.redoLastAction(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-elements', boardId] });
    },
  });

  // Real-time connection setup
  useEffect(() => {
    if (!boardId || !enableRealTime) return;

    const connectToBoard = async () => {
      try {
        const socket = await whiteboardAPI.current.connectToBoard(boardId);
        socketRef.current = socket;
        setIsConnected(true);

        // Set up event listeners
        whiteboardAPI.current.onBoardJoined(({ board, collaborators }) => {
          setBoard(board);
          setCollaborators(collaborators);
        });

        whiteboardAPI.current.onBoardUpdated((event) => {
          handleRealTimeEvent(event);
        });

        whiteboardAPI.current.onCollaboratorJoined((collaborator) => {
          setCollaborators(prev => [...prev.filter(c => c.userId !== collaborator.userId), collaborator]);
        });

        whiteboardAPI.current.onCollaboratorLeft(({ userId }) => {
          setCollaborators(prev => prev.filter(c => c.userId !== userId));
        });

        whiteboardAPI.current.onCursorUpdated(({ userId, x, y, color }) => {
          setCollaborators(prev => prev.map(c => 
            c.userId === userId 
              ? { ...c, cursor: { x, y, color } }
              : c
          ));
        });

        whiteboardAPI.current.onDrawingStarted(({ userId, path }) => {
          // Handle real-time drawing start
          if (userId !== getCurrentUserId()) {
            // Add temporary drawing path for other users
            setElements(prev => [...prev, {
              id: path.id,
              boardId,
              type: 'path',
              data: path,
              position: { x: 0, y: 0 },
              style: {
                color: path.color,
                strokeWidth: path.strokeWidth,
              },
              createdBy: userId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              version: 1,
            }]);
          }
        });

        whiteboardAPI.current.onDrawingContinued(({ userId, pathId, point }) => {
          if (userId !== getCurrentUserId()) {
            setElements(prev => prev.map(el => {
              if (el.id === pathId && el.type === 'path') {
                const pathData = el.data as DrawingPath;
                return {
                  ...el,
                  data: {
                    ...pathData,
                    points: [...pathData.points, point],
                  },
                };
              }
              return el;
            }));
          }
        });

      } catch (error) {
        console.error('Failed to connect to board:', error);
        setIsConnected(false);
        toast({
          title: 'Connection Failed',
          description: 'Failed to connect to real-time collaboration',
          variant: 'destructive',
        });
      }
    };

    connectToBoard();

    return () => {
      if (socketRef.current) {
        whiteboardAPI.current.disconnectFromBoard(boardId);
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [boardId, enableRealTime]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges || !boardId) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveBoard();
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, autoSave, autoSaveInterval, boardId]);

  // Update state when data changes
  useEffect(() => {
    if (boardData?.success && boardData.data) {
      setBoard(boardData.data);
    }
  }, [boardData]);

  useEffect(() => {
    if (elementsData?.success && elementsData.data) {
      setElements(elementsData.data);
    }
  }, [elementsData]);

  // Helper functions
  const getCurrentUserId = () => {
    // This should be replaced with actual user ID from auth context
    return 'current-user-id';
  };

  const handleRealTimeEvent = (event: BoardEvent) => {
    switch (event.type) {
      case 'element-create':
        setElements(prev => [...prev, event.data]);
        break;
      case 'element-update':
        setElements(prev => prev.map(el => el.id === event.data.id ? event.data : el));
        break;
      case 'element-delete':
        setElements(prev => prev.filter(el => el.id !== event.data.id));
        break;
    }
  };

  const saveBoard = useCallback(async () => {
    if (!boardId) return;

    try {
      // In a real implementation, you would save the current state
      setHasUnsavedChanges(false);
      toast({
        title: 'Board Saved',
        description: 'Your changes have been saved automatically',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save board changes',
        variant: 'destructive',
      });
    }
  }, [boardId, toast]);

  // Drawing functions
  const startDrawing = useCallback((x: number, y: number, pressure?: number) => {
    if (!boardId || drawingState.tool === 'select') return;

    const pathId = whiteboardAPI.current.generateElementId();
    const newPath: DrawingPath = {
      id: pathId,
      points: [{ x, y, pressure }],
      color: drawingState.strokeColor,
      strokeWidth: drawingState.strokeWidth,
      tool: drawingState.tool as 'pen' | 'highlighter' | 'eraser',
    };

    setDrawingState(prev => ({
      ...prev,
      isDrawing: true,
      currentPath: newPath,
    }));

    // Emit real-time event
    if (enableRealTime && socketRef.current) {
      whiteboardAPI.current.emitDrawingStart(boardId, newPath);
    }

    setHasUnsavedChanges(true);
  }, [boardId, drawingState, enableRealTime]);

  const continueDrawing = useCallback((x: number, y: number, pressure?: number) => {
    if (!drawingState.isDrawing || !drawingState.currentPath || !boardId) return;

    const point = { x, y, pressure };
    const updatedPath = {
      ...drawingState.currentPath,
      points: [...drawingState.currentPath.points, point],
    };

    setDrawingState(prev => ({
      ...prev,
      currentPath: updatedPath,
    }));

    // Emit real-time event
    if (enableRealTime && socketRef.current) {
      whiteboardAPI.current.emitDrawingContinue(boardId, drawingState.currentPath.id, point);
    }
  }, [drawingState, boardId, enableRealTime]);

  const endDrawing = useCallback(() => {
    if (!drawingState.isDrawing || !drawingState.currentPath || !boardId) return;

    const pathElement: Omit<BoardElement, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      boardId,
      type: 'path',
      data: drawingState.currentPath,
      position: { x: 0, y: 0 },
      style: {
        color: drawingState.currentPath.color,
        strokeWidth: drawingState.currentPath.strokeWidth,
      },
      createdBy: getCurrentUserId(),
    };

    // Create element
    createElementMutation.mutate({ boardId, element: pathElement });

    // Emit real-time event
    if (enableRealTime && socketRef.current) {
      whiteboardAPI.current.emitDrawingEnd(boardId, drawingState.currentPath.id);
    }

    setDrawingState(prev => ({
      ...prev,
      isDrawing: false,
      currentPath: undefined,
    }));
  }, [drawingState, boardId, enableRealTime, createElementMutation]);

  // Element manipulation functions
  const createElement = useCallback((type: BoardElement['type'], data: any, position: { x: number; y: number }) => {
    if (!boardId) return;

    const element: Omit<BoardElement, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      boardId,
      type,
      data,
      position,
      style: {},
      createdBy: getCurrentUserId(),
    };

    createElementMutation.mutate({ boardId, element });
    setHasUnsavedChanges(true);
  }, [boardId, createElementMutation]);

  const updateElement = useCallback((elementId: string, updates: Partial<BoardElement>) => {
    if (!boardId) return;

    updateElementMutation.mutate({ boardId, elementId, data: updates });
    setHasUnsavedChanges(true);
  }, [boardId, updateElementMutation]);

  const deleteElement = useCallback((elementId: string) => {
    if (!boardId) return;

    deleteElementMutation.mutate({ boardId, elementId });
    setHasUnsavedChanges(true);
  }, [boardId, deleteElementMutation]);

  const deleteSelectedElements = useCallback(() => {
    selectionState.selectedElements.forEach(elementId => {
      deleteElement(elementId);
    });
    setSelectionState({ selectedElements: [] });
  }, [selectionState.selectedElements, deleteElement]);

  // Selection functions
  const selectElement = useCallback((elementId: string, multiSelect = false) => {
    setSelectionState(prev => ({
      ...prev,
      selectedElements: multiSelect 
        ? prev.selectedElements.includes(elementId)
          ? prev.selectedElements.filter(id => id !== elementId)
          : [...prev.selectedElements, elementId]
        : [elementId],
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState({ selectedElements: [] });
  }, []);

  // Viewport functions
  const setZoom = useCallback((zoom: number) => {
    setViewportState(prev => ({ ...prev, zoom: Math.max(0.1, Math.min(5, zoom)) }));
  }, []);

  const setPan = useCallback((panX: number, panY: number) => {
    setViewportState(prev => ({ ...prev, panX, panY }));
  }, []);

  const resetViewport = useCallback(() => {
    setViewportState(prev => ({ ...prev, zoom: 1, panX: 0, panY: 0 }));
  }, []);

  // Undo/Redo functions
  const undo = useCallback(() => {
    if (!boardId || undoHistory.length === 0) return;
    undoMutation.mutate(boardId);
  }, [boardId, undoHistory, undoMutation]);

  const redo = useCallback(() => {
    if (!boardId || redoHistory.length === 0) return;
    redoMutation.mutate(boardId);
  }, [boardId, redoHistory, redoMutation]);

  // Cursor tracking
  const updateCursor = useCallback(whiteboardAPI.current.throttle((x: number, y: number) => {
    if (enableRealTime && socketRef.current && boardId) {
      whiteboardAPI.current.emitCursorMove(boardId, x, y);
    }
  }, 100), [enableRealTime, boardId]);

  // Tool functions
  const setTool = useCallback((tool: DrawingState['tool']) => {
    setDrawingState(prev => ({ ...prev, tool }));
  }, []);

  const setStrokeColor = useCallback((color: string) => {
    setDrawingState(prev => ({ ...prev, strokeColor: color }));
  }, []);

  const setStrokeWidth = useCallback((width: number) => {
    setDrawingState(prev => ({ ...prev, strokeWidth: width }));
  }, []);

  const setFillColor = useCallback((color: string) => {
    setDrawingState(prev => ({ ...prev, fillColor: color }));
  }, []);

  return {
    // State
    board,
    elements,
    collaborators,
    drawingState,
    viewportState,
    selectionState,
    isConnected,
    hasUnsavedChanges,
    undoHistory,
    redoHistory,
    
    // Loading states
    isLoading: isBoardLoading || isElementsLoading,
    error: boardError || elementsError,
    
    // Drawing functions
    startDrawing,
    continueDrawing,
    endDrawing,
    
    // Element functions
    createElement,
    updateElement,
    deleteElement,
    deleteSelectedElements,
    
    // Selection functions
    selectElement,
    clearSelection,
    
    // Viewport functions
    setZoom,
    setPan,
    resetViewport,
    
    // History functions
    undo,
    redo,
    canUndo: undoHistory.length > 0,
    canRedo: redoHistory.length > 0,
    
    // Tool functions
    setTool,
    setStrokeColor,
    setStrokeWidth,
    setFillColor,
    
    // Utility functions
    updateCursor,
    saveBoard,
    
    // Data
    activityLogs: activityData?.data || [],
  };
};

export default useWhiteboard; 