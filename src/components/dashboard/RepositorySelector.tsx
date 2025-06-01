import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  GitBranch, 
  Search, 
  ChevronDown, 
  Star, 
  Lock, 
  Globe,
  Users,
  Calendar,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { GitHubOrganization, GitHubRepository } from '@/lib/github-api';

interface RepositorySelectorProps {
  organizations?: GitHubOrganization[];
  repositories?: GitHubRepository[];
  selectedRepository?: GitHubRepository | null;
  selectedOrganization?: GitHubOrganization | null;
  onSelectRepository: (repo: GitHubRepository) => void;
  onSelectOrganization: (org: GitHubOrganization) => void;
  isLoading?: boolean;
}

const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  organizations = [],
  repositories = [],
  selectedRepository,
  selectedOrganization,
  onSelectRepository,
  onSelectOrganization,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrgSelector, setShowOrgSelector] = useState(false);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');

  // Filter repositories based on search query and type
  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = !searchQuery || 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || 
      (filterType === 'public' && !repo.private) ||
      (filterType === 'private' && repo.private);
    
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      'C#': '#239120',
      PHP: '#4F5D95',
      Ruby: '#701516',
      Go: '#00ADD8',
      Rust: '#dea584',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
    };
    return colors[language] || '#6b7280';
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
          <div className="w-32 h-4 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
          <div className="w-48 h-4 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Organization Selector */}
      <Popover open={showOrgSelector} onOpenChange={setShowOrgSelector}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={showOrgSelector}
            className="w-64 justify-between"
          >
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="truncate">
                {selectedOrganization ? selectedOrganization.name : 'Select Organization'}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search organizations..." />
            <CommandEmpty>No organizations found.</CommandEmpty>
            <CommandGroup>
              {organizations.map((org) => (
                <CommandItem
                  key={org.id}
                  onSelect={() => {
                    onSelectOrganization(org);
                    setShowOrgSelector(false);
                  }}
                  className="flex items-center space-x-3 p-3"
                >
                  <img 
                    src={org.avatar_url} 
                    alt={org.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 truncate">
                        {org.name || org.login}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {org.type}
                      </Badge>
                    </div>
                    {org.description && (
                      <p className="text-sm text-gray-500 truncate">
                        {org.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <GitBranch className="w-3 h-3" />
                        <span>{org.public_repos} repos</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{org.followers} members</span>
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Repository Selector */}
      <Popover open={showRepoSelector} onOpenChange={setShowRepoSelector}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={showRepoSelector}
            className="w-80 justify-between"
            disabled={!repositories.length}
          >
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-gray-500" />
              <span className="truncate">
                {selectedRepository ? selectedRepository.name : 'Select Repository'}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {filteredRepositories.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No repositories found
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredRepositories.map((repo) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      onSelectRepository(repo);
                      setShowRepoSelector(false);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 truncate">
                            {repo.name}
                          </span>
                          <div className="flex items-center space-x-1">
                            {repo.private ? (
                              <Lock className="w-3 h-3 text-gray-400" />
                            ) : (
                              <Globe className="w-3 h-3 text-gray-400" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {repo.visibility}
                            </Badge>
                          </div>
                        </div>
                        
                        {repo.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {repo.language && (
                            <div className="flex items-center space-x-1">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: getLanguageColor(repo.language) }}
                              />
                              <span>{repo.language}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>{repo.stargazers_count}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <GitBranch className="w-3 h-3" />
                            <span>{repo.forks_count}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Updated {formatDate(repo.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Repository Info */}
      {selectedRepository && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4 text-sm text-gray-600"
        >
          <div className="flex items-center space-x-1">
            {selectedRepository.private ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            <span>{selectedRepository.visibility}</span>
          </div>
          
          {selectedRepository.language && (
            <div className="flex items-center space-x-1">
              <Code className="w-4 h-4" />
              <span>{selectedRepository.language}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4" />
            <span>{selectedRepository.stargazers_count}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <GitBranch className="w-4 h-4" />
            <span>{selectedRepository.forks_count}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RepositorySelector; 