import { ZodError } from 'zod';
import { ApiResponseBuilder } from './api-response';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    // .issues is the correct array of ZodIssue
    const errors = error.issues.map((issue) => ({
      // handle empty path / numeric path segments
      field:
        issue.path && issue.path.length
          ? issue.path.map((p) => String(p)).join('.')
          : '(root)',
      message: issue.message,
    }));
    return ApiResponseBuilder.badRequest('Validation failed', errors);
  }

  // Custom App errors
  if (error instanceof AppError) {
    return ApiResponseBuilder.error(error.message, error.statusCode);
  }

  // The following checks expect an object shape like Mongoose errors or JWT errors.
  // Narrow `error` to any for those specific checks.
  const errAny = error as any;

  // Mongoose validation errors
  if (errAny && errAny.name === 'ValidationError' && errAny.errors) {
    const errors = Object.keys(errAny.errors).map((key) => ({
      field: key,
      message: errAny.errors[key].message,
    }));
    return ApiResponseBuilder.badRequest('Validation failed', errors);
  }

  // Mongoose duplicate key error
  if (errAny && errAny.code === 11000) {
    const field = errAny.keyPattern
      ? Object.keys(errAny.keyPattern)[0]
      : Object.keys(errAny.keyValue ?? {})[0] ?? 'field';
    return ApiResponseBuilder.badRequest(`${field} already exists`);
  }

  // Mongoose CastError
  if (errAny && errAny.name === 'CastError') {
    return ApiResponseBuilder.badRequest('Invalid ID format');
  }

  // JWT errors
  if (errAny && errAny.name === 'JsonWebTokenError') {
    return ApiResponseBuilder.unauthorized('Invalid token');
  }

  if (errAny && errAny.name === 'TokenExpiredError') {
    return ApiResponseBuilder.unauthorized('Token expired');
  }

  // Default error
  return ApiResponseBuilder.error(
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (errAny && errAny.message) || 'Internal server error',
    500
  );
}
