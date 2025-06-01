import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  GitBranch, 
  Star, 
  Eye, 
  Lock, 
  Globe,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Mail,
  Search,
  Filter,
  UserPlus,
  Settings,
  Shield,
  Crown,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitHubOrganization } from '@/lib/github-api';

interface OrganizationOverviewProps {
  organizations?: GitHubOrganization[];
  selectedOrganization?: GitHubOrganization | null;
  onSelectOrganization: (org: GitHubOrganization) => void;
}

// Mock data for teams and members (in a real app, this would come from the API)
const mockTeams = [
  {
    id: 1,
    name: 'Frontend Team',
    description: 'Responsible for UI/UX development',
    members_count: 8,
    repositories_count: 12,
    privacy: 'closed',
    permission: 'push',
  },
  {
    id: 2,
    name: 'Backend Team',
    description: 'API and server-side development',
    members_count: 6,
    repositories_count: 8,
    privacy: 'closed',
    permission: 'admin',
  },
  {
    id: 3,
    name: 'DevOps Team',
    description: 'Infrastructure and deployment',
    members_count: 4,
    repositories_count: 15,
    privacy: 'secret',
    permission: 'admin',
  },
];

const mockMembers = [
  {
    id: 1,
    login: 'john-doe',
    name: 'John Doe',
    email: 'john@company.com',
    avatar_url: 'https://github.com/github.png',
    role: 'admin',
    teams: ['Frontend Team', 'DevOps Team'],
    joined_at: '2023-01-15T10:00:00Z',
  },
  {
    id: 2,
    login: 'jane-smith',
    name: 'Jane Smith',
    email: 'jane@company.com',
    avatar_url: 'https://github.com/github.png',
    role: 'member',
    teams: ['Backend Team'],
    joined_at: '2023-02-20T14:30:00Z',
  },
  {
    id: 3,
    login: 'mike-wilson',
    name: 'Mike Wilson',
    email: 'mike@company.com',
    avatar_url: 'https://github.com/github.png',
    role: 'member',
    teams: ['Frontend Team', 'Backend Team'],
    joined_at: '2023-03-10T09:15:00Z',
  },
];

const OrganizationOverview: React.FC<OrganizationOverviewProps> = ({
  organizations = [],
  selectedOrganization,
  onSelectOrganization,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = !searchQuery || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.login.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    const matchesTeam = teamFilter === 'all' || 
      member.teams.some(team => team.toLowerCase().includes(teamFilter.toLowerCase()));
    
    return matchesSearch && matchesRole && matchesTeam;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'owner':
        return <Shield className="w-4 h-4 text-red-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'owner':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'secret':
        return <Lock className="w-4 h-4 text-red-500" />;
      case 'closed':
        return <Eye className="w-4 h-4 text-yellow-500" />;
      default:
        return <Globe className="w-4 h-4 text-green-500" />;
    }
  };

  if (!selectedOrganization) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Organization Selected</h3>
          <p className="text-gray-600 mb-4">Select an organization to view details</p>
          {organizations.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Available Organizations:</p>
              <div className="space-y-2">
                {organizations.map((org) => (
                  <Button
                    key={org.id}
                    variant="outline"
                    onClick={() => onSelectOrganization(org)}
                    className="w-full justify-start"
                  >
                    <img 
                      src={org.avatar_url} 
                      alt={org.name}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    {org.name || org.login}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={selectedOrganization.avatar_url} 
            alt={selectedOrganization.name}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedOrganization.name || selectedOrganization.login}
            </h2>
            <p className="text-gray-600">{selectedOrganization.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              {selectedOrganization.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedOrganization.location}</span>
                </span>
              )}
              {selectedOrganization.blog && (
                <span className="flex items-center space-x-1">
                  <LinkIcon className="w-3 h-3" />
                  <a 
                    href={selectedOrganization.blog} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Created {formatDate(selectedOrganization.created_at)}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Members
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Public Repos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedOrganization.public_repos}
                    </p>
                  </div>
                  <GitBranch className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Members</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockMembers.length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Teams</p>
                    <p className="text-2xl font-bold text-gray-900">{mockTeams.length}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Followers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedOrganization.followers}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organization Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Type:</span>
                    <Badge variant="outline">{selectedOrganization.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Public Repositories:</span>
                    <span className="text-sm text-gray-900">{selectedOrganization.public_repos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Public Gists:</span>
                    <span className="text-sm text-gray-900">{selectedOrganization.public_gists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Following:</span>
                    <span className="text-sm text-gray-900">{selectedOrganization.following}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Created:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(selectedOrganization.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Updated:</span>
                    <span className="text-sm text-gray-900">
                      {formatDate(selectedOrganization.updated_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-gray-600">New repository created: project-alpha</span>
                    <span className="text-gray-400">2h ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-gray-600">Member added to Frontend Team</span>
                    <span className="text-gray-400">4h ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-gray-600">Team permissions updated</span>
                    <span className="text-gray-400">1d ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-gray-600">Organization settings changed</span>
                    <span className="text-gray-400">2d ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {mockTeams.map((team) => (
                      <SelectItem key={team.id} value={team.name}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Members</CardTitle>
              <CardDescription>
                {filteredMembers.length} members found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar_url} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{member.name}</h4>
                          <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                            {getRoleIcon(member.role)}
                            <span className="ml-1">{member.role}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">@{member.login}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{member.email}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Joined {formatDate(member.joined_at)}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {member.teams.map((team) => (
                            <Badge key={team} variant="outline" className="text-xs">
                              {team}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Teams</CardTitle>
                  <CardDescription>
                    Manage organization teams and permissions
                  </CardDescription>
                </div>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockTeams.map((team) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                            <CardDescription>{team.description}</CardDescription>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getTeamPrivacyIcon(team.privacy)}
                            <Badge variant="outline" className="text-xs">
                              {team.privacy}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Members:</span>
                            <span className="font-medium">{team.members_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Repositories:</span>
                            <span className="font-medium">{team.repositories_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Permission:</span>
                            <Badge variant="outline" className="text-xs">
                              {team.permission}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Users className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repositories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Repositories</CardTitle>
              <CardDescription>
                {selectedOrganization.public_repos} public repositories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <GitBranch className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Repository list would be loaded here</p>
                <p className="text-sm">This would show all organization repositories with filters and search</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationOverview; 