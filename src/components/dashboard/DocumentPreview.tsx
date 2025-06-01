import React, { useState, useEffect, useRef } from 'react';
import { Document } from '../../lib/documents-api';
import {
  X,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface DocumentPreviewProps {
  document: Document | null;
  onClose: () => void;
  onDownload?: (document: Document) => void;
  onShare?: (document: Document) => void;
  className?: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onClose,
  onDownload,
  onShare,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Media controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load preview when document changes
  useEffect(() => {
    if (!document) return;

    setLoading(true);
    setError(null);
    setZoom(100);
    setRotation(0);
    setCurrentPage(1);

    // Simulate loading preview URL
    const loadPreview = async () => {
      try {
        // In a real implementation, this would fetch from the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (document.previewUrl) {
          setPreviewUrl(document.previewUrl);
        } else if (document.url) {
          setPreviewUrl(document.url);
        } else {
          throw new Error('No preview available');
        }
        
        // Set total pages for PDFs
        if (document.mimeType === 'application/pdf' && document.metadata.pageCount) {
          setTotalPages(document.metadata.pageCount);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preview');
        setLoading(false);
      }
    };

    loadPreview();
  }, [document]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!document) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentPage > 1) setCurrentPage(prev => prev - 1);
          break;
        case 'ArrowRight':
          if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
          break;
        case '+':
        case '=':
          setZoom(prev => Math.min(prev + 25, 500));
          break;
        case '-':
          setZoom(prev => Math.max(prev - 25, 25));
          break;
        case '0':
          setZoom(100);
          break;
        case 'r':
          setRotation(prev => (prev + 90) % 360);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case ' ':
          if (isMediaFile()) {
            e.preventDefault();
            togglePlayPause();
          }
          break;
      }
    };

    window.document.addEventListener('keydown', handleKeyDown);
    return () => window.document.removeEventListener('keydown', handleKeyDown);
  }, [document, currentPage, totalPages, onClose]);

  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      window.document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Media controls
  const togglePlayPause = () => {
    if (!mediaRef.current) return;

    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    
    mediaRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!mediaRef.current) return;
    
    mediaRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (time: number) => {
    if (!mediaRef.current) return;
    
    mediaRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Helper functions
  const isImageFile = () => document?.mimeType.startsWith('image/');
  const isVideoFile = () => document?.mimeType.startsWith('video/');
  const isAudioFile = () => document?.mimeType.startsWith('audio/');
  const isPdfFile = () => document?.mimeType === 'application/pdf';
  const isTextFile = () => document?.mimeType.startsWith('text/');
  const isMediaFile = () => isVideoFile() || isAudioFile();

  const getFileIcon = () => {
    if (!document) return <File className="w-16 h-16 text-gray-400" />;
    
    const { mimeType } = document;
    
    if (mimeType.startsWith('image/')) return <Image className="w-16 h-16 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-16 h-16 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-16 h-16 text-green-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-16 h-16 text-red-500" />;
    if (mimeType.includes('archive')) return <Archive className="w-16 h-16 text-yellow-600" />;
    
    return <File className="w-16 h-16 text-gray-500" />;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!document) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50 ${className}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {getFileIcon()}
            <div>
              <h2 className="text-lg font-medium truncate max-w-md" title={document.name}>
                {document.name}
              </h2>
              <p className="text-sm text-gray-300">
                {formatFileSize(document.size)} • {document.mimeType}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          {(isImageFile() || isPdfFile()) && (
            <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg px-3 py-2">
              <button
                onClick={() => setZoom(prev => Math.max(prev - 25, 25))}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm min-w-[3rem] text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(prev + 25, 500))}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Rotation Control */}
          {isImageFile() && (
            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          )}

          {/* Page Navigation */}
          {isPdfFile() && totalPages > 1 && (
            <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg px-3 py-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded disabled:opacity-50"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded disabled:opacity-50"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
            title="Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>

          {/* Download */}
          {onDownload && (
            <button
              onClick={() => onDownload(document)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          {/* Share */}
          {onShare && (
            <button
              onClick={() => onShare(document)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {loading ? (
          <div className="flex items-center space-x-2 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading preview...</span>
          </div>
        ) : error ? (
          <div className="text-center text-white">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-medium mb-2">Preview not available</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            {onDownload && (
              <button
                onClick={() => onDownload(document)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Image Preview */}
            {isImageFile() && previewUrl && (
              <div className="max-w-full max-h-full overflow-auto">
                <img
                  src={previewUrl}
                  alt={document.name}
                  className="max-w-none transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: 'center',
                  }}
                  onLoad={() => setLoading(false)}
                  onError={() => setError('Failed to load image')}
                />
              </div>
            )}

            {/* Video Preview */}
            {isVideoFile() && previewUrl && (
              <div className="relative max-w-full max-h-full">
                <video
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  src={previewUrl}
                  className="max-w-full max-h-full"
                  controls
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement;
                    setDuration(video.duration);
                    setLoading(false);
                  }}
                  onTimeUpdate={(e) => {
                    const video = e.target as HTMLVideoElement;
                    setCurrentTime(video.currentTime);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={() => setError('Failed to load video')}
                />
              </div>
            )}

            {/* Audio Preview */}
            {isAudioFile() && previewUrl && (
              <div className="flex flex-col items-center space-y-6 text-white">
                <div className="text-center">
                  <Music className="w-24 h-24 mx-auto mb-4 text-green-400" />
                  <h3 className="text-xl font-medium mb-2">{document.name}</h3>
                  <p className="text-gray-300">
                    {document.metadata.duration ? formatTime(document.metadata.duration) : 'Audio File'}
                  </p>
                </div>

                <audio
                  ref={mediaRef as React.RefObject<HTMLAudioElement>}
                  src={previewUrl}
                  onLoadedMetadata={(e) => {
                    const audio = e.target as HTMLAudioElement;
                    setDuration(audio.duration);
                    setLoading(false);
                  }}
                  onTimeUpdate={(e) => {
                    const audio = e.target as HTMLAudioElement;
                    setCurrentTime(audio.currentTime);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={() => setError('Failed to load audio')}
                />

                {/* Custom Audio Controls */}
                <div className="flex flex-col items-center space-y-4 w-full max-w-md">
                  {/* Progress Bar */}
                  <div className="w-full">
                    <input
                      type="range"
                      min={0}
                      max={duration}
                      value={currentTime}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleSeek(Math.max(currentTime - 10, 0))}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                      title="Skip Back 10s"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>

                    <button
                      onClick={togglePlayPause}
                      className="p-3 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>

                    <button
                      onClick={() => handleSeek(Math.min(currentTime + 10, duration))}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                      title="Skip Forward 10s"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PDF Preview */}
            {isPdfFile() && previewUrl && (
              <div className="max-w-full max-h-full overflow-auto">
                <iframe
                  src={`${previewUrl}#page=${currentPage}&zoom=${zoom}`}
                  className="w-full h-full min-h-[600px] border-0"
                  title={document.name}
                  onLoad={() => setLoading(false)}
                  onError={() => setError('Failed to load PDF')}
                />
              </div>
            )}

            {/* Text Preview */}
            {isTextFile() && previewUrl && (
              <div className="max-w-4xl max-h-full overflow-auto bg-white rounded-lg p-6">
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[600px] border-0"
                  title={document.name}
                  onLoad={() => setLoading(false)}
                  onError={() => setError('Failed to load text file')}
                />
              </div>
            )}

            {/* Unsupported File Type */}
            {!isImageFile() && !isVideoFile() && !isAudioFile() && !isPdfFile() && !isTextFile() && (
              <div className="text-center text-white">
                {getFileIcon()}
                <h3 className="text-lg font-medium mb-2 mt-4">Preview not supported</h3>
                <p className="text-gray-300 mb-4">
                  This file type cannot be previewed in the browser.
                </p>
                {onDownload && (
                  <button
                    onClick={() => onDownload(document)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download to View</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 rounded-lg p-3 opacity-75">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>ESC: Close</div>
          <div>F: Fullscreen</div>
          {(isImageFile() || isPdfFile()) && (
            <>
              <div>+/-: Zoom</div>
              <div>0: Reset zoom</div>
            </>
          )}
          {isImageFile() && <div>R: Rotate</div>}
          {isPdfFile() && totalPages > 1 && (
            <>
              <div>←/→: Pages</div>
            </>
          )}
          {isMediaFile() && <div>Space: Play/Pause</div>}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview; 