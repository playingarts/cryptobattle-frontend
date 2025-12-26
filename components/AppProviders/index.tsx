import { FC, ReactNode, useMemo } from "react";
import { ThemeProvider, Theme } from "@emotion/react";
import { MetaMaskProvider } from "metamask-react";
import { AuthProvider } from "../AuthProvider/";
import { GameProvider } from "../GameProvider/";
import { NotificationProvider } from "../NotificationProvider/";
import { WSProvider } from "../WsProvider/index";
import { ComposeProviders } from "../../utils/composeProviders";

interface AppProvidersProps {
  theme: Theme;
  children: ReactNode;
}

/**
 * Consolidates all application providers into a single component
 * This reduces visual nesting in _app.tsx while maintaining the same behavior
 *
 * Provider order matters due to dependencies:
 * - NotificationProvider: used by AuthProvider for error notifications
 * - AuthProvider: provides user context needed by WSProvider and GameProvider
 * - WSProvider: provides WebSocket connection used by GameProvider
 * - GameProvider: uses Auth and WS contexts
 */
export const AppProviders: FC<AppProvidersProps> = ({ theme, children }) => {
  const providers = useMemo(
    () =>
      [
        [ThemeProvider, { theme }],
        [MetaMaskProvider],
        [NotificationProvider],
        [AuthProvider],
        [WSProvider],
        [GameProvider],
      ] as const,
    [theme]
  );

  return (
    <ComposeProviders providers={providers as any}>
      {children}
    </ComposeProviders>
  );
};
