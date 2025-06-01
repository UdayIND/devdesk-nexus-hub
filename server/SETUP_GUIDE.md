# DevDesk Nexus Hub API - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- AWS S3 Account (for file storage)
- VirusTotal API Key (for malware scanning)

### 1. Install Dependencies

```bash
# Navigate to server directory
cd server

# Install all dependencies
npm install

# Or using yarn
yarn install

# Or using bun (faster)
bun install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Required environment variables:
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/devdesk_nexus_hub
REDIS_URL=redis://localhost:6379

# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Authentication & Security
JWT_SECRET=your_super_secure_jwt_secret_minimum_256_bits_long
BCRYPT_ROUNDS=12

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=devdesk-nexus-files
AWS_REGION=us-east-1

# Malware Scanning
MALWARE_SCAN_API_KEY=your_virustotal_api_key

# External Services
GITHUB_TOKEN=your_github_personal_access_token
FIGMA_CLIENT_ID=your_figma_client_id
RENDER_API_KEY=your_render_api_key
UPTIMEROBOT_API_KEY=your_uptimerobot_api_key
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Start Development Server

```bash
# Start with hot reload
npm run dev

# Or start production server
npm run build
npm start
```

## 🧪 Running Tests

### Unit Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run specific test file
npm test -- health.test.ts
```

### Test Results
- View coverage report: `./coverage/index.html`
- View test results: `./test-results/report.html`

## 📚 API Documentation

### Swagger/OpenAPI Docs
- **Development**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

### Available Endpoints

#### Health & Monitoring
- `GET /health` - System health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe  
- `GET /health/metrics` - Performance metrics

#### Authentication (Planned)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

#### Documents (Planned)
- `GET /api/v1/documents` - List documents
- `POST /api/v1/documents` - Create document
- `POST /api/v1/documents/upload` - Upload file
- `GET /api/v1/documents/:id/download` - Download file

## 🔧 Development Commands

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Generate API documentation
npm run docs

# Database operations
npm run migrate
npm run db:generate
npm run db:studio
```

## 🚀 Deployment

### Production Build
```bash
# Install production dependencies only
npm ci --production

# Build the application
npm run build

# Start production server
npm start
```

### Docker Setup (Optional)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your_production_jwt_secret_very_long_and_secure
AWS_ACCESS_KEY_ID=prod_key
AWS_SECRET_ACCESS_KEY=prod_secret
```

## 🔍 Monitoring & Debugging

### Health Checks
- **Liveness**: `GET /health/live`
- **Readiness**: `GET /health/ready`
- **Metrics**: `GET /health/metrics`

### Logging
- Logs are written to `./logs/app.log`
- Error logs: `./logs/error.log`
- Console output in development

### Performance Monitoring
- Response times logged automatically
- Memory usage tracked
- Database connection monitoring

## 🛠 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
psql $DATABASE_URL
```

#### Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping

# Should return "PONG"
```

#### File Upload Issues
```bash
# Check AWS credentials
aws s3 ls s3://your-bucket-name

# Verify CORS settings on S3 bucket
```

#### Test Failures
```bash
# Clear test cache
npm run test -- --clearCache

# Run tests verbosely
npm test -- --verbose

# Run specific test
npm test -- --grep "health check"
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Or specific modules
DEBUG=express:* npm run dev
```

## 📊 Performance Optimization

### Production Optimizations
1. Enable compression middleware ✅
2. Use connection pooling
3. Implement Redis caching
4. Configure CDN for static files
5. Enable gzip compression

### Database Optimization
1. Add proper indexes
2. Optimize queries
3. Use connection pooling
4. Regular maintenance tasks

### Security Hardening
1. Update dependencies regularly
2. Use security headers ✅
3. Implement rate limiting ✅
4. Enable CORS properly ✅
5. Validate all inputs

## 🔐 Security Checklist

- [ ] Environment variables secured
- [x] HTTPS enabled in production
- [x] Security headers configured
- [x] CORS properly configured
- [x] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] File upload restrictions
- [ ] Malware scanning enabled
- [ ] Authentication implemented
- [ ] Authorization checks
- [ ] Audit logging enabled

## 📞 Support

### Getting Help
- Check the [API Audit Report](./API_AUDIT_REPORT.md)
- Review test files for examples
- Check logs for error details

### Contributing
1. Follow TypeScript conventions
2. Add tests for new features
3. Update documentation
4. Run linter before commits

### Reporting Issues
Include:
- Node.js version
- Environment (dev/prod)
- Error logs
- Steps to reproduce

---

**Last Updated**: ${new Date().toISOString()}
**API Version**: v1.0.0
**Node.js**: 18+
**TypeScript**: 5.3+ 