/**
 * DataErrorFallback Component
 * Fallback UI component for data loading and validation errors
 * Provides user-friendly error messages and recovery options
 */

'use client';

import { useRouter } from 'next/navigation';
import Container from './Container';
import Button from './Button';

export default function DataErrorFallback({ 
  error, 
  assignment, 
  mode, 
  onRetry,
  showRetry = true 
}) {
  const router = useRouter();

  const handleBackToModeSelection = () => {
    if (assignment) {
      router.push(`/assignment/${assignment}`);
    } else {
      router.push('/');
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Determine error type and provide appropriate message
  const getErrorDetails = () => {
    if (!error) {
      return {
        title: 'Unknown Error',
        message: 'An unexpected error occurred.',
        icon: 'exclamation',
        showRetry: true
      };
    }

    switch (error.name) {
      case 'DataLoadError':
        if (error.message.includes('not found')) {
          return {
            title: 'Quiz Data Not Found',
            message: 'The quiz questions file could not be found. This might be a temporary server issue.',
            icon: 'document-missing',
            showRetry: true
          };
        }
        if (error.message.includes('Network error')) {
          return {
            title: 'Connection Problem',
            message: 'Unable to load quiz data due to a network issue. Please check your internet connection and try again.',
            icon: 'wifi-off',
            showRetry: true
          };
        }
        if (error.message.includes('Server error')) {
          return {
            title: 'Server Error',
            message: 'The server is experiencing issues. Please try again in a few moments.',
            icon: 'server',
            showRetry: true
          };
        }
        return {
          title: 'Failed to Load Quiz Data',
          message: 'We couldn\'t load the quiz questions. This might be a temporary issue.',
          icon: 'exclamation',
          showRetry: true
        };

      case 'DataValidationError':
        if (error.message.includes('empty')) {
          return {
            title: 'No Quiz Data Available',
            message: 'The quiz data file appears to be empty. Please try a different assignment.',
            icon: 'document-empty',
            showRetry: false
          };
        }
        if (error.message.includes('No valid questions')) {
          return {
            title: 'Invalid Quiz Data',
            message: 'The quiz data contains errors and cannot be used. Please try a different assignment or contact support.',
            icon: 'document-error',
            showRetry: false
          };
        }
        return {
          title: 'Quiz Data Error',
          message: 'The quiz data is in an invalid format and cannot be loaded.',
          icon: 'document-error',
          showRetry: false
        };

      default:
        return {
          title: 'Quiz Loading Error',
          message: 'An unexpected error occurred while loading the quiz.',
          icon: 'exclamation',
          showRetry: true
        };
    }
  };

  const errorDetails = getErrorDetails();
  const canRetry = showRetry && errorDetails.showRetry;

  // Icon components
  const icons = {
    'exclamation': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
      />
    ),
    'document-missing': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
      />
    ),
    'document-empty': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562" 
      />
    ),
    'document-error': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    ),
    'wifi-off': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728A9 9 0 015.636 18.364m12.728-12.728L18.364 5.636" 
      />
    ),
    'server': (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" 
      />
    )
  };

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-6">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {icons[errorDetails.icon] || icons.exclamation}
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {errorDetails.title}
            </h1>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {errorDetails.message}
            </p>
            
            {assignment && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Assignment:</strong> {assignment}
                  {mode && <> | <strong>Mode:</strong> {mode}</>}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {canRetry && onRetry && (
              <Button 
                onClick={onRetry}
                variant="primary"
                className="w-full"
              >
                Try Again
              </Button>
            )}
            
            {assignment && (
              <Button 
                onClick={handleBackToModeSelection}
                variant="outline"
                className="w-full"
              >
                Choose Different Mode
              </Button>
            )}
            
            <Button 
              onClick={handleBackToHome}
              variant="outline"
              className="w-full"
            >
              Back to Home
            </Button>
          </div>

          {/* Additional help text */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              If this problem persists, try refreshing the page or selecting a different assignment. 
              All assignments should be available and working properly.
            </p>
          </div>

          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show error details (development only)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-60">
                <div className="mb-2">
                  <strong>Error Type:</strong> {error.name || 'Unknown'}
                </div>
                <div className="mb-2">
                  <strong>Message:</strong> {error.message}
                </div>
                {error.cause && (
                  <div className="mb-2">
                    <strong>Cause:</strong> {error.cause.toString()}
                  </div>
                )}
                {error.invalidData && (
                  <div className="mb-2">
                    <strong>Invalid Data Sample:</strong>
                    <pre className="whitespace-pre-wrap mt-1 max-h-32 overflow-auto">
                      {JSON.stringify(error.invalidData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </Container>
  );
}