import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  Users, 
  FileText, 
  Video, 
  GitBranch, 
  Figma, 
  BarChart3, 
  Settings,
  Play,
  Check,
  ArrowRight,
  HelpCircle,
  BookOpen,
  Lightbulb,
  Star
} from 'lucide-react';

const Help: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      title: "Documents",
      description: "Secure file storage, sharing, and collaboration with version control.",
      features: ["Drag & drop upload", "Permission management", "Real-time collaboration", "Version history"],
      route: "/dashboard/documents"
    },
    {
      icon: <Video className="h-8 w-8 text-green-500" />,
      title: "Meetings",
      description: "Video calls, screen sharing, and virtual whiteboard collaboration.",
      features: ["HD video calls", "Screen sharing", "Digital whiteboard", "Meeting recordings"],
      route: "/dashboard/meetings"
    },
    {
      icon: <GitBranch className="h-8 w-8 text-purple-500" />,
      title: "GitHub Integration",
      description: "Connect your repositories and manage development workflows.",
      features: ["Repository sync", "Pull request tracking", "Issue management", "Code reviews"],
      route: "/dashboard/github"
    },
    {
      icon: <Figma className="h-8 w-8 text-pink-500" />,
      title: "Figma Integration", 
      description: "Design collaboration and prototype sharing.",
      features: ["Design sync", "Comments & feedback", "Version tracking", "Asset management"],
      route: "/dashboard/figma"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-500" />,
      title: "Analytics",
      description: "Project insights, team performance, and productivity metrics.",
      features: ["Performance dashboards", "Team analytics", "Project tracking", "Custom reports"],
      route: "/dashboard/analytics"
    },
    {
      icon: <Users className="h-8 w-8 text-indigo-500" />,
      title: "Team Management",
      description: "Collaborate with team members and manage permissions.",
      features: ["User roles", "Permission control", "Activity tracking", "Team insights"],
      route: "/dashboard/team"
    }
  ];

  const quickStartSteps = [
    {
      id: 1,
      title: "Set up your profile",
      description: "Complete your profile information and preferences",
      action: "Go to Settings",
      route: "/dashboard/settings"
    },
    {
      id: 2,
      title: "Connect GitHub",
      description: "Link your GitHub account to sync repositories",
      action: "Connect GitHub",
      route: "/dashboard/github"
    },
    {
      id: 3,
      title: "Create your first project",
      description: "Set up a new project and invite team members",
      action: "Create Project",
      route: "/dashboard/projects"
    },
    {
      id: 4,
      title: "Upload documents",
      description: "Add project files and documents for collaboration",
      action: "Upload Files",
      route: "/dashboard/documents"
    },
    {
      id: 5,
      title: "Schedule a meeting",
      description: "Plan your first team meeting or collaboration session",
      action: "Schedule Meeting",
      route: "/dashboard/meetings"
    }
  ];

  const faqs = [
    {
      question: "How do I invite team members?",
      answer: "Go to Team Management in your dashboard, click 'Invite Member', and enter their email address. They'll receive an invitation to join your workspace."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! We use enterprise-grade encryption, secure file storage, and comprehensive access controls to protect your data. All files are scanned for malware before upload."
    },
    {
      question: "Can I integrate with other tools?",
      answer: "DevDesk Nexus Hub integrates with GitHub, Figma, and many other development tools. More integrations are added regularly based on user feedback."
    },
    {
      question: "How does file versioning work?",
      answer: "Every time you upload a new version of a file, we automatically create a version history. You can view, download, or restore any previous version at any time."
    },
    {
      question: "What file types are supported?",
      answer: "We support all common file types including documents (PDF, DOC, TXT), images (JPG, PNG, SVG), code files, and design files. Files are automatically scanned and previewed when possible."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to DevDesk Nexus Hub
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your all-in-one workspace for development teams. Collaborate, create, and deploy with confidence.
          </p>
          <Badge variant="secondary" className="mt-4">
            🚀 Your development workspace awaits
          </Badge>
        </div>

        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="quickstart" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {feature.icon}
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {feature.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-4 w-4 text-green-500" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full group-hover:bg-blue-600 transition-colors"
                      onClick={() => window.location.href = feature.route}
                    >
                      Explore {feature.title}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quick Start Tab */}
          <TabsContent value="quickstart">
            <Card className="border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Get Started in 5 Steps
                </CardTitle>
                <CardDescription>
                  Follow these steps to set up your workspace and start collaborating with your team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickStartSteps.map((step) => (
                    <div 
                      key={step.id} 
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                        completedSteps.includes(step.id) 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        completedSteps.includes(step.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {completedSteps.includes(step.id) ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-semibold">{step.id}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                      <Button 
                        variant={completedSteps.includes(step.id) ? "outline" : "default"}
                        size="sm"
                        onClick={() => {
                          handleStepComplete(step.id);
                          window.location.href = step.route;
                        }}
                      >
                        {completedSteps.includes(step.id) ? 'Completed' : step.action}
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {completedSteps.length}/{quickStartSteps.length} completed
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedSteps.length / quickStartSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>📚 User Guides</CardTitle>
                  <CardDescription>Detailed guides for common tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    File Management & Sharing
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Video className="h-4 w-4 mr-2" />
                    Setting up Video Meetings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <GitBranch className="h-4 w-4 mr-2" />
                    GitHub Integration Setup
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Team Collaboration Best Practices
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>🎥 Video Tutorials</CardTitle>
                  <CardDescription>Watch and learn with video guides</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Getting Started (5 min)
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Advanced File Management (8 min)
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Team Collaboration Features (12 min)
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Integration Masterclass (15 min)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card className="border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about DevDesk Nexus Hub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Need more help?</strong> Contact our support team or check out our comprehensive documentation for detailed guides and troubleshooting.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      Contact Support
                    </Button>
                    <Button size="sm" variant="outline">
                      View Documentation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Join thousands of development teams who are already using DevDesk Nexus Hub to streamline their workflow and boost productivity.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                >
                  Take the Tour
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help; 