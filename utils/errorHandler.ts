/**
 * Centralized error handling utilities
 */

/**
 * Format any error value into a readable string
 */
export function formatError(error: unknown): string {
  if (error === null || error === undefined) {
    return 'Unknown error';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Log an error with optional context
 */
export function logError(error: unknown, context?: string): void {
  const formattedError = formatError(error);

  if (context) {
    console.error(`[${context}]`, formattedError);
  } else {
    console.error(formattedError);
  }
}

/**
 * Check if an error is likely a network-related error
 */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const networkPatterns = [
    'fetch',
    'network',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
  ];

  const message = error.message.toLowerCase();
  return networkPatterns.some(pattern => message.includes(pattern.toLowerCase()));
}
