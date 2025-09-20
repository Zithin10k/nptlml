/**
 * Error handling utilities
 * Provides helper functions for error handling and recovery
 */

import { DataLoadError, DataValidationError } from './dataLoader';

/**
 * Determines if an error is recoverable (user can retry)
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error is recoverable
 */
export function isRecoverableError(error) {
  if (!error) return false;

  // Network errors are usually recoverable
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }

  // Data load errors are often recoverable
  if (error instanceof DataLoadError) {
    // Server errors and network issues are recoverable
    if (error.message.includes('Server error') || 
        error.message.includes('Network error') ||
        error.message.includes('Failed to load')) {
      return true;
    }
    // File not found might be recoverable (temporary server issue)
    if (error.message.includes('not found')) {
      return true;
    }
  }

  // Most validation errors are not recoverable
  if (error instanceof DataValidationError) {
    // Empty data might be recoverable (temporary issue)
    if (error.message.includes('empty')) {
      return true;
    }
    return false;
  }

  // Unknown errors might be recoverable
  return true;
}

/**
 * Gets a user-friendly error message for display
 * @param {Error} error - The error to get a message for
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyErrorMessage(error) {
  if (!error) return 'An unknown error occurred.';

  // Use custom error messages if available
  if (error instanceof DataLoadError || error instanceof DataValidationError) {
    return error.message;
  }

  // Handle common error types
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    return 'The data received from the server is in an invalid format.';
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Logs an error with appropriate level and context
 * @param {Error} error - The error to log
 * @param {Object} context - Additional context information
 */
export function logError(error, context = {}) {
  const errorInfo = {
    name: error?.name || 'Unknown',
    message: error?.message || 'No message',
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    ...context
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }

  // In production, you might want to send to an error reporting service
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Example: Send to error reporting service
    // errorReportingService.report(errorInfo);
  }
}

/**
 * Creates a standardized error object for the application
 * @param {string} type - Error type ('load', 'validation', 'component', 'unknown')
 * @param {string} message - Error message
 * @param {Error} originalError - Original error that caused this
 * @param {Object} metadata - Additional error metadata
 * @returns {Error} Standardized error object
 */
export function createAppError(type, message, originalError = null, metadata = {}) {
  let error;

  switch (type) {
    case 'load':
      error = new DataLoadError(message, originalError);
      break;
    case 'validation':
      error = new DataValidationError(message, metadata);
      break;
    default:
      error = new Error(message);
      error.name = 'AppError';
      error.cause = originalError;
      break;
  }

  // Add metadata
  error.metadata = metadata;
  error.timestamp = new Date().toISOString();

  return error;
}

/**
 * Wraps an async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {Object} options - Error handling options
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, options = {}) {
  const {
    onError = null,
    retries = 0,
    retryDelay = 1000,
    context = {}
  } = options;

  return async (...args) => {
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
        // Log the error with context
        logError(error, { ...context, attempt, maxRetries: retries });
        
        // If this is the last attempt or error is not recoverable, throw
        if (attempt === retries || !isRecoverableError(error)) {
          if (onError) {
            onError(error, { attempt, maxRetries: retries });
          }
          throw error;
        }
        
        // Wait before retrying
        if (retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    throw lastError;
  };
}

/**
 * Validates that required data is present and properly formatted
 * @param {any} data - Data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
export function validateData(data, schema) {
  const errors = [];
  
  if (schema.required && (data === null || data === undefined)) {
    errors.push('Data is required but was not provided');
    return { isValid: false, errors };
  }
  
  if (schema.type && typeof data !== schema.type) {
    errors.push(`Expected ${schema.type} but got ${typeof data}`);
  }
  
  if (schema.isArray && !Array.isArray(data)) {
    errors.push('Expected array but got non-array value');
  }
  
  if (schema.minLength && data.length < schema.minLength) {
    errors.push(`Expected minimum length ${schema.minLength} but got ${data.length}`);
  }
  
  if (schema.maxLength && data.length > schema.maxLength) {
    errors.push(`Expected maximum length ${schema.maxLength} but got ${data.length}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}