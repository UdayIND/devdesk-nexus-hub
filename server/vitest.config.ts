/**
 * Vitest Configuration
 * Test framework configuration for the DevDesk Nexus Hub API
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        'vitest.config.ts',
        'coverage/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        'src/routes/health.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/routes/auth.ts': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
    setupFiles: ['./src/tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './src/tests'),
      '@config': path.resolve(__dirname, './src/config'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@middleware': path.resolve(__dirname, './src/middleware'),
      '@controllers': path.resolve(__dirname, './src/controllers'),
      '@services': path.resolve(__dirname, './src/services'),
      '@models': path.resolve(__dirname, './src/models'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@validators': path.resolve(__dirname, './src/validators'),
    },
  },
  esbuild: {
    target: 'node18',
  },
});

// Test environment setup
export const setupTestEnvironment = () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  process.env.JWT_SECRET = 'test_secret_key';
  process.env.BCRYPT_ROUNDS = '4'; // Faster for tests
  process.env.DATABASE_URL = 'sqlite://test.db';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
  process.env.LOG_LEVEL = 'silent';
  
  // Mock external services
  process.env.GITHUB_TOKEN = 'test_github_token';
  process.env.FIGMA_CLIENT_ID = 'test_figma_client_id';
  process.env.FIGMA_CLIENT_SECRET = 'test_figma_client_secret';
  process.env.RENDER_API_KEY = 'test_render_api_key';
  process.env.UPTIMEROBOT_API_KEY = 'test_uptime_api_key';
  process.env.MALWARE_SCAN_API_KEY = 'test_malware_scan_key';
  
  // AWS S3 Mock
  process.env.AWS_ACCESS_KEY_ID = 'test_aws_access_key';
  process.env.AWS_SECRET_ACCESS_KEY = 'test_aws_secret_key';
  process.env.AWS_S3_BUCKET = 'test-bucket';
  process.env.AWS_REGION = 'us-east-1';
  
  // CORS
  process.env.FRONTEND_URL = 'http://localhost:5173';
  process.env.ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:3000';
  
  console.log('🧪 Test environment configured');
};

// Mock implementations for testing
export const mockServices = {
  database: {
    connect: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
    isConnected: () => true,
  },
  redis: {
    connect: () => Promise.resolve(),
    disconnect: () => Promise.resolve(),
    isConnected: () => true,
  },
  s3: {
    upload: () => Promise.resolve({ Location: 'https://test-bucket.s3.amazonaws.com/test-file' }),
    delete: () => Promise.resolve(),
    getSignedUrl: () => 'https://test-signed-url.com',
  },
  malwareScanner: {
    scan: () => Promise.resolve({ clean: true, threats: [] }),
  },
  github: {
    getRepo: () => Promise.resolve({ name: 'test-repo', stars: 100 }),
    getCommits: () => Promise.resolve([{ sha: 'abc123', message: 'Test commit' }]),
  },
  figma: {
    getFile: () => Promise.resolve({ name: 'Test File', lastModified: new Date() }),
    getComments: () => Promise.resolve([{ id: '1', message: 'Test comment' }]),
  },
};

// Performance testing utilities
export const performanceHelpers = {
  measureResponseTime: async (fn: () => Promise<any>) => {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    return Number(end - start) / 1_000_000; // Convert to milliseconds
  },
  
  loadTest: async (fn: () => Promise<any>, concurrency: number = 10, iterations: number = 100) => {
    const promises = Array.from({ length: concurrency }, async () => {
      const results = [];
      for (let i = 0; i < iterations / concurrency; i++) {
        const time = await performanceHelpers.measureResponseTime(fn);
        results.push(time);
      }
      return results;
    });
    
    const allResults = (await Promise.all(promises)).flat();
    return {
      avg: allResults.reduce((a, b) => a + b, 0) / allResults.length,
      min: Math.min(...allResults),
      max: Math.max(...allResults),
      count: allResults.length,
    };
  },
}; 