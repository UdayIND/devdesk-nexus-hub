/**
 * Environment Configuration Validation
 * Validates required environment variables and provides defaults
 */

import { z } from 'zod';

// Environment schema (removing JWT_REFRESH_SECRET as requested)
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('0.0.0.0'),
  
  // Database
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  
  // Authentication (simplified - no refresh tokens)
  JWT_SECRET: z.string().default('dev_secret_key_change_in_production'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  
  // CORS and Security
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  
  // API Configuration
  API_VERSION: z.string().default('v1'),
  API_DOCS_PATH: z.string().default('/api-docs'),
  SWAGGER_ENABLED: z.string().default('true'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // File Storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  
  // External Services
  GITHUB_TOKEN: z.string().optional(),
  FIGMA_CLIENT_ID: z.string().optional(),
  FIGMA_CLIENT_SECRET: z.string().optional(),
  RENDER_API_KEY: z.string().optional(),
  UPTIMEROBOT_API_KEY: z.string().optional(),
  
  // Security
  MALWARE_SCAN_API_KEY: z.string().optional(),
  
  // Socket.IO
  SOCKET_IO_CORS_ORIGIN: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.string().default('info'),
  LOG_FILE: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
});

type Environment = z.infer<typeof envSchema>;

let env: Environment;

export const validateEnv = (): Environment => {
  try {
    env = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    
    // In development, use defaults and warn
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Using default values for missing environment variables');
      env = envSchema.parse({
        NODE_ENV: 'development',
        ...process.env,
      });
      return env;
    }
    
    // In production, fail hard
    process.exit(1);
  }
};

// Export validated environment
export const getEnv = (): Environment => {
  if (!env) {
    return validateEnv();
  }
  return env;
};

// Helper functions for common environment checks
export const isDevelopment = (): boolean => getEnv().NODE_ENV === 'development';
export const isProduction = (): boolean => getEnv().NODE_ENV === 'production';
export const isTest = (): boolean => getEnv().NODE_ENV === 'test';

// Get CORS origins as array
export const getCorsOrigins = (): string[] => {
  const env = getEnv();
  const origins = env.ALLOWED_ORIGINS || env.CORS_ORIGIN || env.FRONTEND_URL;
  return origins.split(',').map(origin => origin.trim());
};

export default getEnv; 