/**
 * Request Logger Middleware
 * Logs HTTP requests with relevant information
 */

import { Request, Response, NextFunction } from 'express';

// Mock logger for initial setup
const logger = {
  info: (message: string, meta?: any) => console.info(message, meta),
  warn: (message: string, meta?: any) => console.warn(message, meta),
  error: (message: string, error?: any) => console.error(message, error),
};

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const { method, url, ip, headers } = req;
  
  // Log request start
  logger.info('HTTP Request', {
    method,
    url,
    ip: ip || req.connection.remoteAddress,
    userAgent: headers['user-agent'],
    timestamp: new Date().toISOString(),
  });

  // Simple response logging on finish event
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const { statusCode } = res;
    
    // Log response
    const logLevel = statusCode >= 400 ? 'warn' : 'info';
    logger[logLevel]('HTTP Response', {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get('content-length'),
      timestamp: new Date().toISOString(),
    });
  });

  next();
}; 