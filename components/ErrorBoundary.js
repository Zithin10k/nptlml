/**
 * ErrorBoundary Component
 * React Error Boundary to catch and handle component rendering errors gracefully
 * Provides fallback UI when components fail to render
 */

'use client';

import React from 'react';
import Container from './Container';
import Button from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Track error with Google Analytics
    if (typeof window !== 'undefined') {
      // Import analytics dynamically to avoid SSR issues
      import('../utils/analytics').then(({ trackError }) => {
        import('../utils/storageUtils').then(({ getUserName }) => {
          const userName = getUserName();
          trackError(
            'component_error',
            error.message || error.toString(),
            userName,
            {
              componentStack: errorInfo.componentStack,
              errorBoundary: 'ErrorBoundary'
            }
          );
        });
      });

      // Report error to monitoring service if available
      if (window.reportError) {
        window.reportError(error);
      }
    }
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleGoHome = () => {
    // Navigate to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      const { fallback: CustomFallback } = this.props;
      
      if (CustomFallback) {
        return (
          <CustomFallback 
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onGoHome={this.handleGoHome}
          />
        );
      }

      // Default fallback UI
      return (
        <Container>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-red-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-600 mb-6">
                  We encountered an unexpected error while loading this page. 
                  This might be a temporary issue.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={this.handleRetry}
                  variant="primary"
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  Go to Home Page
                </Button>
              </div>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Show error details (development only)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
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

    return this.props.children;
  }
}

export default ErrorBoundary;