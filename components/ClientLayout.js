/**
 * ClientLayout Component
 * Client-side layout wrapper that includes global error boundary
 * Provides error handling for the entire application
 */

'use client';

import { useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { initializeScrollUtils } from '../utils/scrollUtils';

export default function ClientLayout({ children }) {
  useEffect(() => {
    // Initialize scroll utilities when the app starts
    initializeScrollUtils();
  }, []);

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}