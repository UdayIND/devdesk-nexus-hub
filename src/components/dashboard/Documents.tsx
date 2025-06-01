import React, { useState, useEffect } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { Document } from '../../lib/documents-api';
import FileManager from './FileManager';
import DocumentPreview from './DocumentPreview';
import ShareDialog from './ShareDialog';
import {
  FileText,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Star,
  Eye,
  FolderPlus,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  RefreshCw,
  Settings,
  BarChart3,
  Clock,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
} from 'lucide-react';

interface DocumentsProps {
  className?: string;
}

const Documents: React.FC<DocumentsProps> = ({ className = '' }) => {
  const [state, operations] = useDocuments();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [shareDocument, setShareDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'recent' | 'shared' | 'starred' | 'trash'>('files');
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);

  // Check storage quota on mount
  useEffect(() => {
    if (state.storageQuota && state.storageQuota.percentage > 90) {
      setShowQuotaWarning(true);
    }
  }, [state.storageQuota]);

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleDocumentPreview = (document: Document) => {
    setPreviewDocument(document);
  };

  const handleDocumentShare = (document: Document) => {
    setShareDocument(document);
  };

  const handleDocumentDownload = async (document: Document) => {
    try {
      await operations.downloadDocument(document.id);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  const handleDocumentDelete = async (document: Document) => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      try {
        await operations.deleteDocuments([document.id]);
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const handleDocumentRestore = async (document: Document) => {
    try {
      await operations.restoreDocuments([document.id]);
    } catch (error) {
      console.error('Failed to restore document:', error);
    }
  };

  const handleBulkAction = async (action: string, documentIds: string[]) => {
    switch (action) {
      case 'download':
        await operations.downloadMultiple(documentIds);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${documentIds.length} documents?`)) {
          await operations.deleteDocuments(documentIds);
        }
        break;
      case 'star':
        // Implement starring functionality
        break;
      case 'move':
        // Implement move functionality
        break;
    }
  };

  const getFilteredDocuments = () => {
    let filtered = state.documents;

    switch (activeTab) {
      case 'recent':
        filtered = filtered
          .filter(doc => doc.status === 'ready')
          .sort((a, b) => new Date(b.lastAccessedAt || b.updatedAt).getTime() - new Date(a.lastAccessedAt || a.updatedAt).getTime())
          .slice(0, 20);
        break;
      case 'shared':
        filtered = filtered.filter(doc => doc.permissions.sharedWith.length > 0 || doc.permissions.isPublic);
        break;
      case 'starred':
        // Filter starred documents (would need to add starred field to Document interface)
        filtered = filtered.filter(doc => doc.tags.includes('starred'));
        break;
      case 'trash':
        filtered = filtered.filter(doc => doc.status === 'deleted');
        break;
      default:
        filtered = filtered.filter(doc => doc.status === 'ready');
    }

    return filtered;
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'files':
        return <FileText className="w-4 h-4" />;
      case 'recent':
        return <Clock className="w-4 h-4" />;
      case 'shared':
        return <Users className="w-4 h-4" />;
      case 'starred':
        return <Star className="w-4 h-4" />;
      case 'trash':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'files':
        return state.documents.filter(doc => doc.status === 'ready').length;
      case 'recent':
        return Math.min(20, state.documents.filter(doc => doc.status === 'ready').length);
      case 'shared':
        return state.documents.filter(doc => doc.permissions.sharedWith.length > 0 || doc.permissions.isPublic).length;
      case 'starred':
        return state.documents.filter(doc => doc.tags.includes('starred')).length;
      case 'trash':
        return state.documents.filter(doc => doc.status === 'deleted').length;
      default:
        return 0;
    }
  };

  const formatStorageUsage = () => {
    if (!state.storageQuota) return 'Loading...';
    
    const { used, total, percentage } = state.storageQuota;
    const usedGB = (used / (1024 * 1024 * 1024)).toFixed(2);
    const totalGB = (total / (1024 * 1024 * 1024)).toFixed(2);
    
    return `${usedGB} GB of ${totalGB} GB used (${percentage.toFixed(1)}%)`;
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your files with secure storage and sharing
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Storage Quota */}
            {state.storageQuota && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      state.storageQuota.percentage > 90
                        ? 'bg-red-500'
                        : state.storageQuota.percentage > 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(state.storageQuota.percentage, 100)}%` }}
                  />
                </div>
                <span className="text-xs">{formatStorageUsage()}</span>
              </div>
            )}

            {/* Quick Actions */}
            <button
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>

            <button
              onClick={() => operations.createFolder('New Folder')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Folder</span>
            </button>
          </div>
        </div>

        {/* Storage Warning */}
        {showQuotaWarning && state.storageQuota && state.storageQuota.percentage > 90 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">Storage almost full</p>
                <p className="text-xs text-red-600">
                  You're using {state.storageQuota.percentage.toFixed(1)}% of your storage. 
                  Consider deleting unused files or upgrading your plan.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowQuotaWarning(false)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {(['files', 'recent', 'shared', 'starred', 'trash'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {getTabIcon(tab)}
              <span className="capitalize">{tab}</span>
              {getTabCount(tab) > 0 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {getTabCount(tab)}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {state.loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading documents...</p>
            </div>
          </div>
        ) : state.error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading documents</h3>
              <p className="text-gray-500 mb-4">{state.error}</p>
              <button
                onClick={() => operations.refreshDocuments()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        ) : (
          <FileManager
            className="h-full"
            initialFolderId={state.currentFolder?.id}
            selectionMode="multiple"
            onFileSelect={(files) => {
              // Handle file selection if needed
              console.log('Selected files:', files);
            }}
            onFolderSelect={(folder) => {
              // Handle folder selection if needed
              console.log('Selected folder:', folder);
            }}
            showUpload={true}
            showCreateFolder={true}
            showSearch={true}
            showFilters={true}
            showViewModes={true}
            maxFileSize={100 * 1024 * 1024} // 100MB
            allowedFileTypes={[]}
            compactMode={false}
          />
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreview
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
          onDownload={handleDocumentDownload}
          onShare={handleDocumentShare}
        />
      )}

      {/* Share Dialog Modal */}
      {shareDocument && (
        <ShareDialog
          document={shareDocument}
          onClose={() => setShareDocument(null)}
        />
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upload Files</h2>
              <button
                onClick={() => setShowUploadDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop files here</p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <button
                  onClick={() => {
                    const input = window.document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) {
                        operations.uploadFiles(Array.from(files));
                        setShowUploadDialog(false);
                      }
                    };
                    input.click();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose Files
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {state.uploads.size > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">
              Uploading {state.uploads.size} file{state.uploads.size > 1 ? 's' : ''}
            </h3>
            <button
              onClick={() => {
                // Cancel all uploads
                state.uploads.forEach((_, id) => operations.cancelUpload(id));
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {Array.from(state.uploads.values()).map((upload) => (
              <div key={upload.documentId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1 mr-2">{upload.fileName}</span>
                  <span>{upload.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      upload.status === 'error'
                        ? 'bg-red-500'
                        : upload.status === 'complete'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${upload.percentage}%` }}
                  />
                </div>
                {upload.error && (
                  <p className="text-xs text-red-600">{upload.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
