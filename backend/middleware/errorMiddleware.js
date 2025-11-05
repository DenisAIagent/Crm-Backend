// Not found middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  // Set default error status
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    user: req.user?.email || 'anonymous'
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource not found';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(val => val.message);
    message = errors.join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Rate limit error
  if (err.message && err.message.includes('Too many requests')) {
    statusCode = 429;
    message = 'Too many requests, please try again later';
  }

  // CORS error
  if (err.message && err.message.includes('Not allowed by CORS')) {
    statusCode = 403;
    message = 'CORS policy violation';
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large';
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  }

  // Database connection errors
  if (err.message && err.message.includes('ECONNREFUSED')) {
    statusCode = 503;
    message = 'Database connection failed';
  }

  // Build error response
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  };

  // Add error code if available
  if (err.code) {
    errorResponse.code = err.code;
  }

  // Add validation errors if available
  if (err.name === 'ValidationError') {
    errorResponse.errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Async error handler wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error factory functions
export const createError = (message, statusCode = 500, code = null) => {
  return new AppError(message, statusCode, code);
};

export const createValidationError = (message) => {
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

export const createNotFoundError = (resource = 'Resource') => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

export const createUnauthorizedError = (message = 'Unauthorized') => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

export const createForbiddenError = (message = 'Forbidden') => {
  return new AppError(message, 403, 'FORBIDDEN');
};

export const createConflictError = (message) => {
  return new AppError(message, 409, 'CONFLICT');
};

export const createTooManyRequestsError = (message = 'Too many requests') => {
  return new AppError(message, 429, 'TOO_MANY_REQUESTS');
};

export const createInternalServerError = (message = 'Internal server error') => {
  return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});