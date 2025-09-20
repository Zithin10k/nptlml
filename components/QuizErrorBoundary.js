/**
 * QuizErrorBoundary Component
 * Specialized error boundary for quiz-related components
 * Provides quiz-specific error handling and recovery options
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Container from './Container';
import Button from './Button';

function QuizErrorFallback({ error, errorInfo, onRetry, assignment, mode }) {
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
  const getErrorMessage = () => {
    if (error?.name === 'DataLoadError') {
      return {
        title: 'Failed to Load Quiz Data',
        message: 'We couldn\'t load the quiz questions. This might be due to a network issue or missing data files.',
        showRetry: true
      };
    }
    
    if (error?.name === 'DataValidationError') {
      return {
        title: 'Invalid Quiz Data',
        message: 'The quiz data appears to be corrupted or in an invalid format. Please try a different assignment or contact support.',
        showRetry: false
      };
    }

    return {
      title: 'Quiz Error',
      message: 'An unexpected error occurred while running the quiz. This might be a temporary issue.',
      showRetry: true
    };
  };

  const errorDetails = getErrorMessage();

  return (
    <Container>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-6">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {errorDetails.title}
            </h1>
            <p className="text-gray-600 mb-6">
              {errorDetails.message}
            </p>
            
            {assignment && mode && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Assignment:</strong> {assignment} | <strong>Mode:</strong> {mode}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {errorDetails.showRetry && (
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
                Back to Mode Selection
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

          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show technical details (development only)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
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
                    <strong>Invalid Data:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {JSON.stringify(error.invalidData, null, 2)}
                    </pre>
                  </div>
                )}
                {errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">
                      {errorInfo.componentStack}
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

class QuizErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('QuizErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report quiz-specific errors
    if (typeof window !== 'undefined' && window.reportError) {
      window.reportError(error, { context: 'quiz', ...this.props });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <QuizErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          assignment={this.props.assignment}
          mode={this.props.mode}
        />
      );
    }

    return this.props.children;
  }
}

export default QuizErrorBoundary;