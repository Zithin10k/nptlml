/**
 * ClientLayout Component
 * Client-side layout wrapper that includes global error boundary
 * Provides error handling for the entire application
 */

'use client';

import { useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import AdminDashboard from './AdminDashboard';
import { initializeScrollUtils } from '../utils/scrollUtils';

export default function ClientLayout({ children }) {
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Initialize scroll utilities when the app starts
    initializeScrollUtils();
    
    // Check for admin parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    setShowAdmin(urlParams.get('admin') === 'true');
  }, []);

  // Show admin dashboard if admin parameter is present
  if (showAdmin) {
    return (
      <ErrorBoundary>
        <AdminDashboard />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}