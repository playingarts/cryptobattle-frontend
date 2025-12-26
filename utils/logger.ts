/**
 * Centralized logging utility for the frontend
 * Provides consistent logging with context, levels, and environment awareness
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerOptions {
  context: string;
  enabled?: boolean;
}

interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  timestamp: string;
  data?: unknown;
}

const isDevelopment = process.env.NODE_ENV === "development";

// Log level priority (lower = more verbose)
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level for each environment
const MIN_LOG_LEVEL: LogLevel = isDevelopment ? "debug" : "warn";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL];
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatLogEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context}]`;
  return `${prefix} ${entry.message}`;
}

/**
 * Creates a logger instance with a specific context
 *
 * @example
 * const logger = createLogger({ context: "GameBoard" });
 * logger.debug("Rendering game board", { players: 4 });
 * logger.info("Game started");
 * logger.warn("Player timeout approaching");
 * logger.error("Failed to load cards", error);
 */
export function createLogger(options: LoggerOptions) {
  const { context, enabled = true } = options;

  const log = (level: LogLevel, message: string, data?: unknown) => {
    if (!enabled || !shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      context,
      message,
      timestamp: formatTimestamp(),
      data,
    };

    const formattedMessage = formatLogEntry(entry);

    switch (level) {
      case "debug":
        if (data !== undefined) {
          console.debug(formattedMessage, data);
        } else {
          console.debug(formattedMessage);
        }
        break;
      case "info":
        if (data !== undefined) {
          console.info(formattedMessage, data);
        } else {
          console.info(formattedMessage);
        }
        break;
      case "warn":
        if (data !== undefined) {
          console.warn(formattedMessage, data);
        } else {
          console.warn(formattedMessage);
        }
        break;
      case "error":
        if (data !== undefined) {
          console.error(formattedMessage, data);
        } else {
          console.error(formattedMessage);
        }
        // In production, could send to error tracking service
        if (!isDevelopment && typeof window !== "undefined") {
          // Example: sendToErrorTracking(entry);
        }
        break;
    }
  };

  return {
    debug: (message: string, data?: unknown) => log("debug", message, data),
    info: (message: string, data?: unknown) => log("info", message, data),
    warn: (message: string, data?: unknown) => log("warn", message, data),
    error: (message: string, data?: unknown) => log("error", message, data),
  };
}

/**
 * Default application logger
 * Use this for general application logging
 */
export const appLogger = createLogger({ context: "App" });

/**
 * WebSocket logger
 */
export const wsLogger = createLogger({ context: "WebSocket" });

/**
 * Game logger
 */
export const gameLogger = createLogger({ context: "Game" });

/**
 * Auth logger
 */
export const authLogger = createLogger({ context: "Auth" });
