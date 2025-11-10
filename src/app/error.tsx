'use client';

/**
 * Error Boundary
 *
 * Catches errors in the application and displays a user-friendly error page.
 * Includes reset functionality to attempt recovery.
 */

import { useEffect } from 'react';
import { ErrorCard } from '@/components/ui/ErrorMessage';
import { Container } from '@/components/layout';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Container centerY className="py-12">
      <ErrorCard
        title="Something went wrong"
        description="An unexpected error occurred. Please try again or go back to the previous page."
        details={
          isDevelopment
            ? `${error.name}: ${error.message}\n\nDigest: ${error.digest || 'N/A'}\n\nStack:\n${error.stack}`
            : undefined
        }
        onRetry={reset}
        onGoBack={() => window.history.back()}
      />
    </Container>
  );
}
