/**
 * DevDesk Nexus Hub API Server
 * Main server entry point with Express.js, security middleware, and route configuration
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors'; // Handle async errors automatically
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

// Import configurations and middleware
import { checkDatabaseConnection, disconnectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateEnv } from './config/environment';
import { setupSwagger } from './config/swagger';

// Import routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import documentsRoutes from './routes/documents';
import meetingsRoutes from './routes/meetings';
import projectsRoutes from './routes/projects';
import webhooksRoutes from './routes/webhooks';
import healthRoutes from './routes/health';
import analyticsRoutes from './routes/analytics';

// Initialize Express app
const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Validate environment variables
validateEnv();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "ws:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [process.env.FRONTEND_URL || 'http://localhost:5173'];
    
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/api/v1/health' || req.path === '/health';
  }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use(requestLogger);

// API versioning
const API_VERSION = process.env.API_VERSION || 'v1';
const apiPrefix = `/api/${API_VERSION}`;

// Health check route (before authentication)
app.use('/health', healthRoutes);
app.use(`${apiPrefix}/health`, healthRoutes);

// API Documentation (Swagger)
if (process.env.SWAGGER_ENABLED === 'true' || process.env.NODE_ENV === 'development') {
  setupSwagger(app, apiPrefix);
}

// API Routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use(`${apiPrefix}/documents`, documentsRoutes);
app.use(`${apiPrefix}/meetings`, meetingsRoutes);
app.use(`${apiPrefix}/projects`, projectsRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/webhooks`, webhooksRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'DevDesk Nexus Hub API',
    version: API_VERSION,
    status: 'running',
    documentation: process.env.SWAGGER_ENABLED === 'true' ? `${req.protocol}://${req.get('host')}${process.env.API_DOCS_PATH || '/api-docs'}` : undefined,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Join user-specific room for real-time updates
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  // Join meeting room
  socket.on('join-meeting', (meetingId: string) => {
    socket.join(`meeting:${meetingId}`);
    console.log(`Socket ${socket.id} joined meeting ${meetingId}`);
  });
  
  // Leave meeting room
  socket.on('leave-meeting', (meetingId: string) => {
    socket.leave(`meeting:${meetingId}`);
    console.log(`Socket ${socket.id} left meeting ${meetingId}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Export io for use in other modules
export { io };

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Server startup
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    // Check database connection
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Server will continue but may have limited functionality.');
    }
    
    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 DevDesk Nexus Hub API Server running on ${HOST}:${PORT}`);
      console.log(`📚 API Documentation: http://${HOST}:${PORT}${process.env.API_DOCS_PATH || '/api-docs'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`⚡ Socket.IO enabled on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  httpServer.close(async () => {
    console.log('HTTP server closed');
    
    // Close database connection
    await disconnectDatabase();
    
    // Close Socket.IO server
    io.close(() => {
      console.log('Socket.IO server closed');
      process.exit(0);
    });
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
if (require.main === module) {
  startServer();
}

export default app; 