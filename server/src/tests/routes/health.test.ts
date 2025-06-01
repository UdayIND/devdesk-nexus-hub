/**
 * Health Route Tests
 * Comprehensive test suite for health check endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../server';

// Mock database connection
vi.mock('../../config/database', () => ({
  checkDatabaseConnection: vi.fn(),
  disconnectDatabase: vi.fn(),
}));

describe('Health Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 when all services are healthy', async () => {
      // Mock successful database connection
      const { checkDatabaseConnection } = await import('../../config/database');
      vi.mocked(checkDatabaseConnection).mockResolvedValue(true);

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        services: {
          database: {
            status: 'healthy',
          },
          redis: {
            status: 'healthy',
          },
        },
      });

      expect(response.body.timestamp).toBeDefined();
      expect(response.body.responseTime).toBeTypeOf('number');
      expect(response.body.uptime).toBeTypeOf('number');
      expect(response.body.memory).toBeDefined();
    });

    it('should return 503 when database is unhealthy', async () => {
      // Mock failed database connection
      const { checkDatabaseConnection } = await import('../../config/database');
      vi.mocked(checkDatabaseConnection).mockResolvedValue(false);

      const response = await request(app)
        .get('/health')
        .expect(503);

      expect(response.body).toMatchObject({
        status: 'unhealthy',
        services: {
          database: {
            status: 'unhealthy',
          },
        },
      });
    });

    it('should return 503 when health check throws an error', async () => {
      // Mock database connection throwing an error
      const { checkDatabaseConnection } = await import('../../config/database');
      vi.mocked(checkDatabaseConnection).mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/health')
        .expect(503);

      expect(response.body).toMatchObject({
        status: 'unhealthy',
        error: 'Health check failed',
      });
    });

    it('should include performance metrics', async () => {
      const { checkDatabaseConnection } = await import('../../config/database');
      vi.mocked(checkDatabaseConnection).mockResolvedValue(true);

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.responseTime).toBeGreaterThan(0);
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 when service is ready', async () => {
      const { checkDatabaseConnection } = await import('../../config/database');
      vi.mocked(checkDatabaseConnection).mockResolvedValue(true);

      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ready',
      });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return 503 when database is not ready', async () => {
      const { checkDatabaseConnection } = await import('../../config/database');
      vi.mocked(checkDatabaseConnection).mockResolvedValue(false);

      const response = await request(app)
        .get('/health/ready')
        .expect(503);

      expect(response.body).toMatchObject({
        status: 'not ready',
        reason: 'Database not available',
      });
    });

    it('should return 503 when readiness check fails', async () => {
      const { checkDatabaseConnection } = await import('../../config/database');
      vi.mocked(checkDatabaseConnection).mockRejectedValue(new Error('Connection error'));

      const response = await request(app)
        .get('/health/ready')
        .expect(503);

      expect(response.body).toMatchObject({
        status: 'not ready',
        error: 'Readiness check failed',
      });
    });
  });

  describe('GET /health/live', () => {
    it('should always return 200 for liveness check', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'alive',
      });
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeTypeOf('number');
    });

    it('should include uptime in response', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /health/metrics', () => {
    it('should return performance metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('cpu');
      expect(response.body).toHaveProperty('process');

      // Validate memory metrics
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('external');

      // Validate CPU metrics
      expect(response.body.cpu).toHaveProperty('user');
      expect(response.body.cpu).toHaveProperty('system');

      // Validate process metrics
      expect(response.body.process).toHaveProperty('pid');
      expect(response.body.process).toHaveProperty('version');
      expect(response.body.process).toHaveProperty('platform');
      expect(response.body.process).toHaveProperty('arch');
    });

    it('should return numeric values for metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(typeof response.body.memory.heapUsed).toBe('number');
      expect(typeof response.body.memory.heapTotal).toBe('number');
      expect(typeof response.body.cpu.user).toBe('number');
      expect(typeof response.body.cpu.system).toBe('number');
      expect(typeof response.body.process.pid).toBe('number');
    });
  });

  describe('API Versioned Routes', () => {
    it('should work with versioned health endpoint', async () => {
      const { checkDatabaseConnection } = await import('../../config/database');
      vi.mocked(checkDatabaseConnection).mockResolvedValue(true);

      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });

    it('should work with versioned ready endpoint', async () => {
      const { checkDatabaseConnection } = await import('../../config/database');
      vi.mocked(checkDatabaseConnection).mockResolvedValue(true);

      const response = await request(app)
        .get('/api/v1/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
    });
  });

  describe('Response Headers', () => {
    it('should include proper content-type header', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // These headers should be set by helmet middleware
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health/live')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/health/live').expect(200)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body.status).toBe('alive');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      const { checkDatabaseConnection } = await import('../../config/database');
      vi.mocked(checkDatabaseConnection).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .get('/health')
        .expect(503);

      expect(response.body).toHaveProperty('status', 'unhealthy');
      expect(response.body).toHaveProperty('error');
    });
  });
}); 