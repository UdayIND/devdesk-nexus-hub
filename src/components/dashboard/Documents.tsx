
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Eye,
  MoreVertical,
  Folder,
  Grid,
  List,
  Star,
  Clock,
  Users,
  Lock,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Documents: React.FC = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Files', count: 47 },
    { id: 'team', name: 'Team Shared', count: 23, icon: Users },
    { id: 'public', name: 'Public', count: 12, icon: Globe },
    { id: 'private', name: 'Private', count: 12, icon: Lock },
    { id: 'starred', name: 'Starred', count: 8, icon: Star },
    { id: 'recent', name: 'Recent', count: 15, icon: Clock },
  ];

  const documents = [
    {
      id: 1,
      name: 'Project Requirements.pdf',
      type: 'PDF',
      size: '2.4 MB',
      category: 'team',
      modified: '2 hours ago',
      author: 'John Doe',
      starred: true,
      shared: 'team'
    },
    {
      id: 2,
      name: 'UI Design Specs.figma',
      type: 'Figma',
      size: '8.7 MB',
      category: 'team',
      modified: '5 hours ago',
      author: 'Jane Smith',
      starred: false,
      shared: 'team'
    },
    {
      id: 3,
      name: 'API Documentation.md',
      type: 'Markdown',
      size: '156 KB',
      category: 'public',
      modified: '1 day ago',
      author: 'Mike Wilson',
      starred: true,
      shared: 'public'
    },
    {
      id: 4,
      name: 'Meeting Notes - March.docx',
      type: 'Document',
      size: '542 KB',
      category: 'private',
      modified: '3 days ago',
      author: 'You',
      starred: false,
      shared: 'private'
    },
    {
      id: 5,
      name: 'Design System.sketch',
      type: 'Sketch',
      size: '12.3 MB',
      category: 'team',
      modified: '1 week ago',
      author: 'Sarah Johnson',
      starred: true,
      shared: 'team'
    },
    {
      id: 6,
      name: 'User Research Report.pdf',
      type: 'PDF',
      size: '4.1 MB',
      category: 'public',
      modified: '2 weeks ago',
      author: 'Alex Chen',
      starred: false,
      shared: 'public'
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'figma':
        return '🎨';
      case 'markdown':
        return '📝';
      case 'document':
        return '📃';
      case 'sketch':
        return '✏️';
      default:
        return '📄';
    }
  };

  const getShareIcon = (shared: string) => {
    switch (shared) {
      case 'team':
        return <Users className="w-3 h-3 text-blue-500" />;
      case 'public':
        return <Globe className="w-3 h-3 text-green-500" />;
      case 'private':
        return <Lock className="w-3 h-3 text-gray-500" />;
      default:
        return <Lock className="w-3 h-3 text-gray-500" />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'starred') return doc.starred;
    return doc.category === activeCategory;
  }).filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Document Management</h2>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.icon && <category.icon className="w-4 h-4 mr-2" />}
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Documents Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{getFileIcon(doc.type)}</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-800 text-sm mb-2 line-clamp-2">
                    {doc.name}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{doc.size}</span>
                    <span>{doc.modified}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getShareIcon(doc.shared)}
                      <span className="text-xs text-gray-500">{doc.author}</span>
                    </div>
                    {doc.starred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                  </div>
                  
                  <div className="mt-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-600">
                  <div className="col-span-2">Name</div>
                  <div>Author</div>
                  <div>Modified</div>
                  <div>Size</div>
                  <div>Actions</div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="grid grid-cols-6 gap-4 items-center text-sm">
                      <div className="col-span-2 flex items-center space-x-3">
                        <span className="text-lg">{getFileIcon(doc.type)}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">{doc.name}</span>
                          {doc.starred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                          {getShareIcon(doc.shared)}
                        </div>
                      </div>
                      <div className="text-gray-600">{doc.author}</div>
                      <div className="text-gray-600">{doc.modified}</div>
                      <div className="text-gray-600">{doc.size}</div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Drop files here to upload</h3>
          <p className="text-gray-600 mb-4">or click to browse from your computer</p>
          <Button variant="outline">Choose Files</Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Documents;
