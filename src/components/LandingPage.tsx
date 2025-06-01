import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  ChevronRight, 
  Code, 
  Users, 
  Zap, 
  GitBranch,
  Palette,
  Video,
  FileText,
  MessageSquare,
  Calendar,
  BarChart3,
  Shield,
  Globe,
  Sparkles,
  ArrowRight,
  Play,
  Star,
  CheckCircle,
  Layers,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate featured items with reduced frequency for performance
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % coreFeatures.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  const coreFeatures = useMemo(() => [
    {
      id: 'figma',
      icon: <Palette className="w-8 h-8" />,
      title: "Figma Integration",
      description: "Seamless design-to-development workflow with real-time Figma sync",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20"
    },
    {
      id: 'devmode',
      icon: <Code className="w-8 h-8" />,
      title: "Dev Mode",
      description: "Advanced development environment with live preview and debugging",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      id: 'deck',
      icon: <Video className="w-8 h-8" />,
      title: "Deck (Meetings)",
      description: "Interactive presentation platform with real-time collaboration",
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      id: 'documents',
      icon: <FileText className="w-8 h-8" />,
      title: "Documents",
      description: "Secure file storage and sharing with advanced permissions",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      id: 'communications',
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Communications",
      description: "Integrated chat, video calls, and team messaging",
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      id: 'analytics',
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics",
      description: "Comprehensive insights and performance metrics",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20"
    }
  ], []);

  const benefits = useMemo(() => [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized performance for professional workflows"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Collaboration",
      description: "Work seamlessly with teams across the world"
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: "Version Control",
      description: "Advanced Git integration with organizational controls"
    }
  ], []);

  const stats = useMemo(() => [
    // Remove fake stats - they are not real
  ], []);

  // Optimized animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: shouldReduceMotion ? 0.1 : 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 relative overflow-hidden">
      {/* Simplified Background - No heavy animations */}
      <div className="absolute inset-0">
        {/* Static gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        
        {/* Simplified grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}
          />
        </div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav
          {...fadeInUp}
          className="container mx-auto px-6 py-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">DevDesk Nexus Hub</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">Benefits</a>
              <a href="#deployment" className="text-gray-600 hover:text-gray-900 transition-colors">Deployment</a>
              <Button
                onClick={onGetStarted}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Sign In
              </Button>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            {...fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-sm text-blue-800 font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                All-in-One Development Platform
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Build, Collaborate,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Deploy
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              The ultimate workspace for development teams. Seamlessly integrate design, 
              development, and deployment in one powerful platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold group min-w-[180px]"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 text-lg font-semibold min-w-[180px]"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="w-5 h-5 mr-2" />
                Explore Features
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Stats Section - Removed fake stats */}
        {stats.length > 0 && (
          <section className="py-16 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-6">
              <motion.div 
                {...staggerContainer}
                className="grid grid-cols-2 md:grid-cols-4 gap-8"
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    {...fadeInUp}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* Core Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your entire development workflow with our comprehensive suite of integrated tools
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 items-center mb-20">
            {/* Feature Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {coreFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  className={`${feature.bgColor} backdrop-blur-sm rounded-2xl p-6 border ${feature.borderColor} hover:scale-105 transition-all duration-300 cursor-pointer group ${
                    activeFeature === index ? 'ring-2 ring-blue-500/30' : ''
                  }`}
                  variants={fadeInUp}
                  onClick={() => setActiveFeature(index)}
                  onMouseEnter={() => setActiveFeature(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Learn more about ${feature.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveFeature(index);
                    }
                  }}
                >
                  <div className={`text-transparent bg-gradient-to-r ${feature.color} bg-clip-text mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-gray-900 font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                    Learn more <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Featured Preview */}
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: shouldReduceMotion ? 0.1 : 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-lg"
            >
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${coreFeatures[activeFeature].color} flex items-center justify-center`}>
                  <div className="text-white scale-150">
                    {coreFeatures[activeFeature].icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {coreFeatures[activeFeature].title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {coreFeatures[activeFeature].description}
                </p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <span className="text-xs text-gray-500">Easy Setup</span>
                  </div>
                  <div className="text-center">
                    <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <span className="text-xs text-gray-500">Premium Quality</span>
                  </div>
                  <div className="text-center">
                    <Shield className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <span className="text-xs text-gray-500">Secure</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Explore Feature
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose DevDesk Nexus Hub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for modern teams who demand performance, security, and seamless collaboration
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:bg-white transition-all duration-300 group text-center shadow-sm hover:shadow-md"
                variants={fadeInUp}
              >
                <div className="text-blue-500 mb-4 group-hover:text-purple-500 transition-colors mx-auto w-fit">
                  {benefit.icon}
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Responsive Design Showcase */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Works Everywhere You Do
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Responsive design that adapts to any device, ensuring a consistent experience across all platforms
            </p>
          </motion.div>

          <div className="flex items-center justify-center space-x-8 mb-12">
            <motion.div
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.1 }}
              className="text-center"
            >
              <Monitor className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <span className="text-gray-600 text-sm">Desktop</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.1 }}
              className="text-center"
            >
              <Tablet className="w-12 h-12 text-purple-500 mx-auto mb-2" />
              <span className="text-gray-600 text-sm">Tablet</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.1 }}
              className="text-center"
            >
              <Smartphone className="w-12 h-12 text-pink-500 mx-auto mb-2" />
              <span className="text-gray-600 text-sm">Mobile</span>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              {...fadeInUp}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join development teams worldwide who are building better software faster with DevDesk Nexus Hub.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold group min-w-[200px]"
                >
                  Start Building Today
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-gray-200">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 DevDesk Nexus Hub. All rights reserved.</p>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <a href="#" className="hover:text-gray-700 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
