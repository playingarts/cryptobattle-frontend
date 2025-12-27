/**
 * Simple logging utility with log levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

let currentLogLevel: LogLevel = LogLevel.DEBUG;

export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

function formatMessage(context?: string): string {
  const timestamp = new Date().toISOString();
  if (context) {
    return `[${timestamp}] [${context}]`;
  }
  return `[${timestamp}]`;
}

export const logger = {
  debug(message: string, context?: string): void {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.debug(formatMessage(context), message);
    }
  },

  info(message: string, context?: string): void {
    if (currentLogLevel <= LogLevel.INFO) {
      console.info(formatMessage(context), message);
    }
  },

  warn(message: string, context?: string): void {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn(formatMessage(context), message);
    }
  },

  error(message: string, context?: string): void {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error(formatMessage(context), message);
    }
  },
};
