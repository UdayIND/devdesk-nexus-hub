/**
 * Error Handler Middleware
 * Centralized error handling for the Express application
 */

import { Request, Response, NextFunction } from 'express';

// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    // Use Object.defineProperty to set readonly property
    if (code) {
      Object.defineProperty(this, 'code', {
        value: code,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  path?: string;
  stack?: string;
}

// Handle different types of errors
const handleDatabaseError = (error: any): AppError => {
  let message = 'Database operation failed';
  let code = 'DATABASE_ERROR';

  if (error.code === '23505') {
    // Unique constraint violation
    const field = error.detail?.match(/Key \((.+)\)/)?.[1] || 'field';
    message = `Duplicate value for ${field}`;
    code = 'DUPLICATE_ENTRY';
    return new ConflictError(message);
  }

  if (error.code === '23503') {
    // Foreign key constraint violation
    message = 'Referenced resource does not exist';
    code = 'FOREIGN_KEY_VIOLATION';
    return new ValidationError(message);
  }

  if (error.code === '23502') {
    // Not null constraint violation
    const field = error.column || 'required field';
    message = `Missing required field: ${field}`;
    code = 'MISSING_REQUIRED_FIELD';
    return new ValidationError(message);
  }

  return new AppError(message, 500, code);
};

const handleValidationError = (error: any): AppError => {
  if (error.name === 'ZodError') {
    const messages = error.errors?.map((err: any) => {
      const path = err.path?.join('.') || 'field';
      return `${path}: ${err.message}`;
    }).join(', ');
    return new ValidationError(`Validation failed: ${messages}`);
  }

  return new ValidationError(error.message);
};

const handleJWTError = (error: any): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('Token not active');
  }
  return new AuthenticationError('Authentication failed');
};

const handleMulterError = (error: any): AppError => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new ValidationError('File too large');
  }
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new ValidationError('Too many files');
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ValidationError('Unexpected file field');
  }
  return new ValidationError('File upload error');
};

// Main error handler middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // Handle known error types
  if (error instanceof AppError) {
    appError = error;
  } else if (error.name === 'ValidationError' || error.name === 'ZodError') {
    appError = handleValidationError(error);
  } else if (error.name?.includes('JWT') || error.name?.includes('Token')) {
    appError = handleJWTError(error);
  } else if (error.name === 'MulterError') {
    appError = handleMulterError(error);
  } else if (error.code && typeof error.code === 'string') {
    // Database or other coded errors
    appError = handleDatabaseError(error);
  } else {
    // Generic server error
    appError = new AppError(
      process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message || 'Something went wrong',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    message: appError.message,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Add optional fields
  if (appError.code) {
    errorResponse.code = appError.code;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    errorResponse.stack = error.stack;
  }

  // Log error (exclude validation errors from error logs)
  if (appError.statusCode >= 500) {
    console.error('Server Error:', {
      message: appError.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: errorResponse.timestamp,
    });
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('Client Error:', {
      message: appError.message,
      path: req.path,
      method: req.method,
      statusCode: appError.statusCode,
    });
  }

  // Send error response
  res.status(appError.statusCode).json(errorResponse);
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create standardized API responses
 */
export const createResponse = {
  success: (data: any, message: string = 'Success', meta?: any) => ({
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  }),

  error: (message: string, code: string = 'ERROR', details?: any) => ({
    success: false,
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
  }),

  paginated: (
    data: any[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Success'
  ) => ({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  }),
}; 