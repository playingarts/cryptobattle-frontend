import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // TODO: Send to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 40,
            background: '#0A0A0A',
            color: '#FFFFFF',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            css={{
              maxWidth: 500,
              textAlign: 'center',
            }}
          >
            {/* Error Icon */}
            <div
              css={{
                fontSize: 64,
                marginBottom: 24,
              }}
            >
              ⚠️
            </div>

            <h1
              css={{
                fontSize: 28,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              Something went wrong
            </h1>

            <p
              css={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: 32,
                lineHeight: 1.5,
              }}
            >
              The game encountered an unexpected error. This has been logged and we&apos;ll look into it.
            </p>

            {/* Show error message in development */}
            {process.env.NODE_ENV === 'development' && error && (
              <div
                css={{
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 32,
                  textAlign: 'left',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  wordBreak: 'break-word',
                }}
              >
                <strong>Error:</strong> {error.message}
              </div>
            )}

            {/* Action Buttons */}
            <div
              css={{
                display: 'flex',
                gap: 16,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={this.handleRetry}
                css={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: 'linear-gradient(90deg, #58CDFF 0%, #C77BFF 100%)',
                  color: '#0A0A0A',
                  transition: 'transform 0.2s, opacity 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                css={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 500,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#FFFFFF',
                  transition: 'transform 0.2s, border-color 0.2s',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                css={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 500,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: '#FFFFFF',
                  transition: 'transform 0.2s, border-color 0.2s',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
