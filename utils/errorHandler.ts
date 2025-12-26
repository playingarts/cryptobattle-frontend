/**
 * Centralized error handling utility
 * Provides consistent error logging and user notification
 */

import { createLogger } from "./logger";

export interface AppError {
  message: string;
  code?: string;
  originalError?: unknown;
}

// Error logger instance
const errorLogger = createLogger({ context: "Error" });

/**
 * Extracts a user-friendly message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unexpected error occurred";
}

/**
 * Logs error using the centralized logger
 * In production, only user-friendly messages are logged
 */
export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  errorLogger.error(`[${context}] ${message}`, error);
}

/**
 * Creates a standardized error handler for API calls
 * Can be used with .catch() or in try/catch blocks
 */
export function createErrorHandler(
  context: string,
  onError?: (message: string) => void
) {
  return (error: unknown): void => {
    const message = getErrorMessage(error);
    logError(context, error);

    if (onError) {
      onError(message);
    }
  };
}

/**
 * Wraps an async function with consistent error handling
 */
export async function withErrorHandling<T>(
  context: string,
  fn: () => Promise<T>,
  onError?: (message: string) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    createErrorHandler(context, onError)(error);
    return null;
  }
}
