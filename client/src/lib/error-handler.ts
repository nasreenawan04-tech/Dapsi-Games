/**
 * Comprehensive error handling utilities
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Firebase error codes to user-friendly messages
 */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered. Please login instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
  'auth/weak-password': 'Password must be at least 6 characters long.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/too-many-requests': 'Too many login attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
  'auth/requires-recent-login': 'This action requires recent authentication. Please login again.',
  'permission-denied': 'You don\'t have permission to perform this action.',
  'not-found': 'The requested resource was not found.',
  'already-exists': 'This item already exists.',
  'invalid-argument': 'Invalid data provided. Please check your input.',
  'unauthenticated': 'You must be logged in to perform this action.',
};

/**
 * Convert Firebase or API errors to user-friendly messages
 */
export function getErrorMessage(error: any): string {
  if (!error) {
    return 'An unknown error occurred. Please try again.';
  }

  // Firebase error
  if (error.code && error.code.startsWith('auth/')) {
    return FIREBASE_ERROR_MESSAGES[error.code] || error.message;
  }

  // Firestore error
  if (error.code) {
    return FIREBASE_ERROR_MESSAGES[error.code] || error.message;
  }

  // API error with response
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Standard error message
  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log errors to console in development, could be extended to send to monitoring service
 */
export function logError(error: any, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }

  // In production, you could send to error monitoring service
  // Example: Sentry.captureException(error);
}

/**
 * Handle async errors with try-catch wrapper
 */
export async function handleAsync<T>(
  promise: Promise<T>,
  context?: string
): Promise<[T | null, any | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    logError(error, context);
    return [null, error];
  }
}

/**
 * Retry logic for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Network error detection
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.code === 'auth/network-request-failed' ||
    error?.message?.includes('network') ||
    error?.message?.includes('fetch failed') ||
    !navigator.onLine
  );
}

/**
 * Global error boundary helper
 */
export function createErrorReport(error: Error, errorInfo?: any): object {
  return {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    errorInfo,
  };
}
