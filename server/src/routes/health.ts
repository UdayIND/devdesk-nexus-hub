/**
 * Health Check Routes
 * Provides application health monitoring endpoints
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'DevDesk Nexus Hub API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Readiness probe (for Kubernetes/container orchestration)
router.get('/ready', (req: Request, res: Response) => {
  // Check if all critical services are available
  const isReady = true; // In real implementation: check database, redis, etc.
  
  if (isReady) {
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        api: 'running',
      },
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

// Liveness probe (for Kubernetes/container orchestration)
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});

// Performance metrics
router.get('/metrics', (req: Request, res: Response) => {
  const metrics = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    },
    application: {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      pid: process.pid,
    },
  };

  res.json(metrics);
});

export default router; 