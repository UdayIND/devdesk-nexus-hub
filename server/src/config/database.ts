// Mock Prisma client for initial setup - replace with real Prisma when installed
interface MockPrismaClient {
  $queryRaw: (query: TemplateStringsArray) => Promise<unknown>;
  $disconnect: () => Promise<void>;
  $on: (event: string, callback: (e: any) => void) => void;
}

// Logger mock for initial setup
const logger = {
  debug: (message: string, meta?: any) => console.debug(message, meta),
  info: (message: string, meta?: any) => console.info(message, meta),
  error: (message: string, error?: any) => console.error(message, error),
};

declare global {
  var __prisma: MockPrismaClient | undefined;
}

// Mock Prisma client - replace with real implementation
const createMockPrisma = (): MockPrismaClient => ({
  $queryRaw: async (query: TemplateStringsArray) => {
    logger.debug('Mock Database Query', { query: query.join('') });
    return Promise.resolve([{ result: 1 }]);
  },
  $disconnect: async () => {
    logger.info('Mock Database disconnected');
  },
  $on: (event: string, callback: (e: any) => void) => {
    logger.debug(`Mock database event listener registered: ${event}`);
  },
});

// Prevent multiple instances in development
const prisma = globalThis.__prisma || createMockPrisma();

// Log database events in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug('Database Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });

  prisma.$on('error', (e: any) => {
    logger.error('Database Error', e);
  });
}

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

export { prisma };

// Database connection health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed', error);
    return false;
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database', error);
  }
}; 