/**
 * AppProviders
 *
 * Consolidates all React context providers into a single component
 * to simplify the _app.tsx and make provider management easier.
 */

import { ReactNode } from 'react';
import { ThemeProvider, Theme } from '@emotion/react';
import { MetaMaskProvider } from 'metamask-react';
import { AuthProvider } from '../AuthProvider';
import { GameProvider } from '../GameProvider';
import { NotificationProvider } from '../NotificationProvider';
import { WSProvider } from '../WsProvider';

interface AppProvidersProps {
  children: ReactNode;
  theme: Theme;
}

/**
 * Get WebSocket URL from environment or use default
 */
const getWebSocketUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_WS_URL ||
    'cryptobattle-backend-production.up.railway.app'
  );
};

/**
 * AppProviders wraps all application context providers in the correct order.
 *
 * Provider order (outermost to innermost):
 * 1. ThemeProvider - Emotion theming
 * 2. MetaMaskProvider - Web3 wallet connection
 * 3. NotificationProvider - Toast notifications
 * 4. AuthProvider - User authentication
 * 5. WSProvider - WebSocket connection
 * 6. GameProvider - Game state management
 */
function AppProviders({ children, theme }: AppProvidersProps): JSX.Element {
  const wsUrl = getWebSocketUrl();

  return (
    <ThemeProvider theme={theme}>
      <MetaMaskProvider>
        <NotificationProvider>
          <AuthProvider>
            <WSProvider url={wsUrl}>
              <GameProvider>{children}</GameProvider>
            </WSProvider>
          </AuthProvider>
        </NotificationProvider>
      </MetaMaskProvider>
    </ThemeProvider>
  );
}

export { AppProviders };
export default AppProviders;
