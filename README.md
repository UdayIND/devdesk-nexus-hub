# 🚀 DevDesk Nexus Hub

A comprehensive development workspace platform that unifies project management, team collaboration, design integration, and deployment tools in one powerful dashboard.

![DevDesk Nexus Hub](https://img.shields.io/badge/DevDesk-Nexus%20Hub-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

## ✨ Features

### 🎯 **Core Platform**
- **Modern Dashboard** - Intuitive, responsive interface with real-time updates
- **User Authentication** - Secure JWT-based authentication with role management
- **Team Management** - Comprehensive user and permission management
- **Project Tracking** - Advanced project management with analytics

### 🎨 **Design & Collaboration**
- **Figma Integration** - Real-time design collaboration and asset management
- **Design Desk** - Centralized design tools and asset library
- **Video Conferencing** - Built-in meeting and collaboration tools
- **Real-time Communications** - Team chat and notification system

### 🛠️ **Development Tools**
- **DevMode (CI/CD)** - Complete pipeline management and monitoring
- **GitHub Integration** - Repository management and PR workflows
- **Deployment Dashboard** - Multi-platform deployment tracking
- **Build History** - Comprehensive build logs and analytics
- **Workflow Manager** - Automated development workflows

### 📊 **Analytics & Monitoring**
- **Real-time Analytics** - Project insights and team performance metrics
- **Security Settings** - Advanced security controls and monitoring
- **Organization Overview** - Company-wide insights and management
- **Notification Center** - Smart notifications and alerts

### 📁 **Content Management**
- **Document Management** - Collaborative document editing and versioning
- **File Manager** - Advanced file organization and sharing
- **Presentation Tools (Deck)** - Create and share presentations
- **Board Manager** - Kanban boards and task management

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** 8+
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/devdesk-nexus-hub.git
   cd devdesk-nexus-hub
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment examples
   cp .env.example .env
   cp server/.env.example server/.env
   
   # Edit environment files with your configuration
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Start backend server
   cd server && npm run dev
   
   # Terminal 2: Start frontend server  
   npm run dev
   ```

5. **Access the Application**
   - **Frontend**: http://localhost:8082
   - **Backend API**: http://localhost:3001
   - **API Documentation**: http://localhost:3001/api-docs

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_SOCKET_URL=http://localhost:3001
VITE_ENABLE_MOCK_AUTH=true

# Optional OAuth
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Optional Figma Integration
VITE_FIGMA_ACCESS_TOKEN=your_figma_token
VITE_FIGMA_FILE_KEY=your_figma_file_key
```

#### Backend (server/.env)
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your_jwt_secret_key

# Database (Optional)
DATABASE_URL=postgresql://username:password@localhost:5432/devdesk_db

# CORS
FRONTEND_URL=http://localhost:8082
ALLOWED_ORIGINS=http://localhost:8082,http://localhost:3000
```

## 🎮 Usage

### Authentication

The platform supports both real authentication and demo mode:

**Demo Authentication** (Development):
- Any valid email and password (6+ characters)
- Automatic user creation for testing

**Production Authentication**:
- Secure JWT-based authentication
- Email verification
- Password reset functionality
- OAuth integration (GitHub, Google)

### Key Features Usage

#### 1. **Project Management**
- Create and manage projects
- Track progress with visual analytics
- Assign team members and set permissions
- Monitor deadlines and milestones

#### 2. **Figma Integration**
- Connect Figma account via access token
- Browse and export design assets
- Real-time collaboration features
- Automatic asset synchronization

#### 3. **Development Workflow**
- Connect GitHub repositories
- Configure CI/CD pipelines
- Monitor build status and deployments
- Automated workflow management

#### 4. **Team Collaboration**
- Video conferencing with screen sharing
- Real-time messaging and notifications
- Document collaboration
- Meeting scheduling and management

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **TanStack Query** for data fetching
- **Socket.IO** for real-time features

### Backend Stack
- **Node.js** with Express
- **TypeScript** for type safety
- **JWT** for authentication
- **Zod** for validation
- **Socket.IO** for real-time communication
- **Swagger** for API documentation

### Key Design Patterns
- **Component-based architecture** with lazy loading
- **Custom hooks** for state management
- **Service layer** for API communication
- **Error boundaries** for graceful error handling
- **Responsive design** with mobile-first approach

## 📚 API Documentation

The API is fully documented with Swagger/OpenAPI 3.0 specification.

**Access Documentation**: http://localhost:3001/api-docs

### Key Endpoints

```
POST   /api/v1/auth/register     # User registration
POST   /api/v1/auth/login        # User login
POST   /api/v1/auth/logout       # User logout
GET    /api/v1/auth/profile      # Get user profile
PATCH  /api/v1/auth/profile      # Update user profile

GET    /api/v1/projects          # List projects
POST   /api/v1/projects          # Create project
GET    /api/v1/projects/:id      # Get project details

GET    /api/v1/analytics         # Get analytics data
GET    /api/v1/health            # Health check
```

## 🔐 Security

### Authentication & Authorization
- **JWT Tokens** with configurable expiration
- **Bcrypt** password hashing (12 rounds)
- **Rate limiting** (100 requests per 15 minutes)
- **CORS protection** with configurable origins
- **Input validation** with Zod schemas

### Best Practices
- Environment-based configuration
- Secure token storage
- SQL injection prevention
- XSS protection
- CSRF protection

## 🚀 Deployment

### Frontend Deployment

**Build for Production**:
```bash
npm run build
```

**Deploy to Vercel**:
```bash
npm install -g vercel
vercel --prod
```

**Deploy to Netlify**:
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Backend Deployment

**Docker Deployment**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

**Deploy to Railway/Render**:
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server && npm test

# Run E2E tests
npm run test:e2e

# Check test coverage
npm run test:coverage
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages
- Ensure responsive design

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Vercel** for the deployment platform
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Lucide React** for beautiful icons

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/devdesk-nexus-hub/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/devdesk-nexus-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/devdesk-nexus-hub/discussions)

---

<div align="center">
  <p>Built with ❤️ by the DevDesk Team</p>
  <p>
    <a href="#top">⬆️ Back to Top</a>
  </p>
</div>
