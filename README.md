# DevDesk Nexus Hub

> **🚀 Now Deployment Ready!** Deploy instantly to Render or Vercel - see [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions.

A comprehensive development workspace that unifies design, development, and collaboration tools in one powerful platform. Built with React, TypeScript, and modern web technologies.

## ✨ Features

### 🎨 **Figma Integration**
- Real-time design synchronization
- Asset extraction and management
- Comment system integration
- Multi-format export (PNG, JPG, SVG, PDF)

### 🛠 **Dev Mode**
- Advanced development environment
- Live preview and debugging
- GitHub CI/CD integration
- Real-time workflow monitoring

### 📁 **Document Management**
- Secure file storage and sharing
- Advanced permission controls
- Real-time collaboration
- Version history tracking

### 💬 **Communications**
- Integrated team messaging
- Video conferencing
- Real-time notifications
- Team collaboration tools

### 📊 **Analytics Dashboard**
- Performance metrics and insights
- Project analytics
- Team productivity tracking
- Custom reporting

## 🚀 Quick Deploy

Choose your preferred platform:

### Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/devdesk-nexus-hub)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🛠 Local Development

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/devdesk-nexus-hub.git
cd devdesk-nexus-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Environment Variables

Create an `env.production` file or set environment variables in your deployment platform:

```bash
# Optional OAuth Configuration
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Optional Figma Integration
VITE_FIGMA_ACCESS_TOKEN=your_figma_access_token
VITE_FIGMA_FILE_KEY=your_figma_file_key
VITE_FIGMA_TEAM_ID=your_figma_team_id

# API Configuration
VITE_API_BASE_URL=/api/v1
```

> **Note:** The application works perfectly without these credentials in demo mode.

## 🏗 Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Framer Motion** for animations
- **TanStack Query** for data fetching

### Features
- **Responsive Design** - Works on all devices
- **Mac Gesture Support** - Two-finger swipe navigation
- **Professional UI/UX** - Modern, clean interface
- **Performance Optimized** - Fast loading and smooth interactions
- **Security Headers** - Production-ready security configuration

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- 🖥 **Desktop** - Full feature set with advanced interactions
- 📱 **Tablet** - Touch-optimized interface
- 📱 **Mobile** - Streamlined mobile experience

## 🔐 Security

- **OAuth 2.0** authentication (GitHub, Google)
- **Security headers** configured for production
- **HTTPS enforcement** in production environments
- **Input validation** and sanitization
- **XSS protection** enabled

## 🤝 Development Mode

When OAuth credentials are not configured, the application runs in development mode with:
- ✅ Fully functional UI and interactions
- ✅ Demo signin functionality
- ✅ All features accessible
- ✅ Professional appearance
- ✅ No fake or misleading content

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙋‍♂️ Support

- 📖 [Deployment Guide](./DEPLOYMENT.md)
- 🐛 [Report Issues](https://github.com/yourusername/devdesk-nexus-hub/issues)
- 💬 [Discussions](https://github.com/yourusername/devdesk-nexus-hub/discussions)

---

**Ready to transform your development workflow?** Deploy now and start building better software faster! 🚀
