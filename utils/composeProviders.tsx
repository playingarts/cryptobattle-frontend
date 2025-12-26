import { ReactNode, ComponentType, ReactElement } from "react";

type ProviderWithProps = [ComponentType<{ children: ReactNode }>, Record<string, unknown>?];

interface ComposeProvidersProps {
  providers: ProviderWithProps[];
  children: ReactNode;
}

/**
 * Composes multiple providers into a single component to reduce nesting
 *
 * @example
 * const providers: ProviderWithProps[] = [
 *   [ThemeProvider, { theme }],
 *   [AuthProvider],
 *   [WSProvider],
 * ];
 *
 * <ComposeProviders providers={providers}>
 *   <App />
 * </ComposeProviders>
 */
export function ComposeProviders({ providers, children }: ComposeProvidersProps): ReactElement {
  return providers.reduceRight<ReactElement>(
    (acc, [Provider, props = {}]) => {
      return <Provider {...props}>{acc}</Provider>;
    },
    <>{children}</>
  );
}
