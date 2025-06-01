import React, { useState, useEffect } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { Document, SharedUser, ShareLink } from '../../lib/documents-api';
import {
  X,
  Share2,
  Copy,
  Link,
  Users,
  Globe,
  Lock,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Check,
  AlertTriangle,
  Plus,
  Search,
  Mail,
  Settings,
  Shield,
  UserPlus,
  ExternalLink,
} from 'lucide-react';

interface ShareDialogProps {
  document: Document | null;
  onClose: () => void;
  className?: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  document,
  onClose,
  className = '',
}) => {
  const [state, operations] = useDocuments();
  const [activeTab, setActiveTab] = useState<'users' | 'links' | 'settings'>('users');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<SharedUser['role']>('viewer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Share link settings
  const [linkExpiry, setLinkExpiry] = useState<string>('');
  const [linkPassword, setLinkPassword] = useState('');
  const [linkDownloadLimit, setLinkDownloadLimit] = useState<number | null>(null);
  const [linkRequireAuth, setLinkRequireAuth] = useState(false);

  // Document permissions
  const [isPublic, setIsPublic] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);

  useEffect(() => {
    if (document) {
      setIsPublic(document.permissions.isPublic);
      setAllowComments(document.permissions.allowComment);
      setAllowDownload(document.permissions.allowDownload);
      setRequireApproval(document.permissions.allowComment); // Using allowComment as placeholder
    }
  }, [document]);

  const handleCopyLink = async (link: string, type: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleInviteUser = async () => {
    if (!document || !inviteEmail.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await operations.shareWithUsers(document.id, [{
        email: inviteEmail.trim(),
        role: inviteRole,
      }]);

      setInviteEmail('');
      setInviteMessage('');
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite user');
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!document) return;

    try {
      await operations.removeUserAccess(document.id, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user');
    }
  };

  const handleUpdatePermissions = async (userId: string, role: SharedUser['role']) => {
    if (!document) return;

    try {
      // First remove the user, then re-add with new role
      await operations.removeUserAccess(document.id, userId);
      const user = document.permissions.sharedWith.find(u => u.userId === userId);
      if (user) {
        await operations.shareWithUsers(document.id, [{
          email: user.email,
          role: role,
        }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update permissions');
    }
  };

  const handleCreateShareLink = async () => {
    if (!document) return;

    setLoading(true);
    try {
      const options: any = {
        permissions: {
          canView: true,
          canDownload: allowDownload,
          canComment: allowComments,
          canEdit: false,
          canShare: false,
          canDelete: false,
          canManagePermissions: false,
        }
      };
      
      if (linkExpiry) options.expiresAt = linkExpiry;
      if (linkPassword) options.password = linkPassword;
      if (linkDownloadLimit) options.maxUses = linkDownloadLimit;

      await operations.createShareLink(document.id, options);
      
      // Reset form
      setLinkExpiry('');
      setLinkPassword('');
      setLinkDownloadLimit(null);
      setLinkRequireAuth(false);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link');
      setLoading(false);
    }
  };

  const handleDeleteShareLink = async (linkId: string) => {
    if (!document) return;

    try {
      await operations.deleteShareLink(document.id, linkId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete share link');
    }
  };

  const handleUpdateDocumentSettings = async () => {
    if (!document) return;

    setLoading(true);
    try {
      await operations.updatePermissions(document.id, {
        isPublic,
        allowComment: allowComments,
        allowDownload,
      });
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      setLoading(false);
    }
  };

  const getPermissionIcon = (role: SharedUser['role']) => {
    switch (role) {
      case 'viewer':
        return <Eye className="w-4 h-4" />;
      case 'editor':
        return <Edit className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'commenter':
        return <Settings className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getPermissionColor = (role: SharedUser['role']) => {
    switch (role) {
      case 'viewer':
        return 'text-blue-600';
      case 'editor':
        return 'text-green-600';
      case 'admin':
        return 'text-purple-600';
      case 'commenter':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredUsers = document?.permissions.sharedWith.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!document) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Share2 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Share Document</h2>
              <p className="text-sm text-gray-500 truncate max-w-md" title={document.name}>
                {document.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>People</span>
              {document.permissions.sharedWith.length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {document.permissions.sharedWith.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'links'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Link className="w-4 h-4" />
              <span>Links</span>
              {document.permissions.shareLinks.length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {document.permissions.shareLinks.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* People Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Invite User */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Invite people</h3>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleInviteUser()}
                    />
                  </div>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as SharedUser['role'])}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="viewer">Can view</option>
                    <option value="editor">Can edit</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={handleInviteUser}
                    disabled={!inviteEmail.trim() || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Inviting...' : 'Invite'}
                  </button>
                </div>

                {/* Optional message */}
                <div>
                  <textarea
                    placeholder="Add a message (optional)"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>
              </div>

              {/* Current Users */}
              {document.permissions.sharedWith.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      People with access ({document.permissions.sharedWith.length})
                    </h3>
                    {document.permissions.sharedWith.length > 3 && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm w-48"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* Owner */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-orange-600">
                            {document.ownerId.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{document.ownerId}</p>
                          <p className="text-xs text-gray-500">Owner</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-orange-600">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Owner</span>
                      </div>
                    </div>

                    {/* Shared Users */}
                    {filteredUsers.map((user) => (
                      <div key={user.userId} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.name || user.email}
                            </p>
                            {user.name && (
                              <p className="text-xs text-gray-500">{user.email}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              Shared {formatDate(user.invitedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdatePermissions(user.userId, e.target.value as SharedUser['role'])}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="viewer">Can view</option>
                            <option value="editor">Can edit</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRemoveUser(user.userId)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label="Remove access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              {/* Create Share Link */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Create share link</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expires
                    </label>
                    <select
                      value={linkExpiry}
                      onChange={(e) => setLinkExpiry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Never</option>
                      <option value={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}>1 day</option>
                      <option value={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}>1 week</option>
                      <option value={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()}>1 month</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Download limit
                    </label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      value={linkDownloadLimit || ''}
                      onChange={(e) => setLinkDownloadLimit(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requireAuth"
                    checked={linkRequireAuth}
                    onChange={(e) => setLinkRequireAuth(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="requireAuth" className="text-sm text-gray-700">
                    Require authentication
                  </label>
                </div>

                <button
                  onClick={handleCreateShareLink}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Link'}
                </button>
              </div>

              {/* Existing Share Links */}
              {document.permissions.shareLinks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Active links ({document.permissions.shareLinks.length})
                  </h3>
                  <div className="space-y-3">
                    {document.permissions.shareLinks.map((link) => (
                      <div key={link.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Link className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-900">Share Link</span>
                            {link.password && (
                              <Lock className="w-4 h-4 text-gray-400" aria-label="Password protected" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCopyLink(link.url, link.id)}
                              className="flex items-center space-x-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              {copied === link.id ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteShareLink(link.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              aria-label="Delete link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span>Created {formatDate(link.createdAt)}</span>
                            {link.expiresAt && (
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Expires {formatDate(link.expiresAt)}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <span>{link.useCount} views</span>
                            {link.maxUses && (
                              <span>{link.useCount}/{link.maxUses} uses</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-gray-900">Document permissions</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Public access</label>
                    <p className="text-xs text-gray-500">Anyone with the link can view this document</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {isPublic ? (
                      <Globe className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Allow comments</label>
                    <p className="text-xs text-gray-500">Users can add comments to this document</p>
                  </div>
                  <input
                    type="checkbox"
                    id="allowComments"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Allow downloads</label>
                    <p className="text-xs text-gray-500">Users can download this document</p>
                  </div>
                  <input
                    type="checkbox"
                    id="allowDownload"
                    checked={allowDownload}
                    onChange={(e) => setAllowDownload(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Require approval</label>
                    <p className="text-xs text-gray-500">New users need approval to access</p>
                  </div>
                  <input
                    type="checkbox"
                    id="requireApproval"
                    checked={requireApproval}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateDocumentSettings}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>All sharing is encrypted and secure</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog; 