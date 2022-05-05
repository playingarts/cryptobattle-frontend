import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  ReactNode,
} from "react";

type WSProviderProps = { children: ReactNode; url: string };

const WSStateContext = createContext<WebSocket | null>(null);

function WSProvider({ children }: WSProviderProps): JSX.Element {
  const accessToken = localStorage.getItem("accessToken");

  const wsInstance = useMemo(
    () =>
      typeof window != "undefined"
        ? new WebSocket(
            `wss://playing-arts-game-backend-test-7pogl.ondigitalocean.app/api/socket?accesstoken=${accessToken}`
          )
        : null,
    [accessToken]
  );

  useEffect(() => {
    return () => {
      wsInstance?.close();
    };
  }, [wsInstance]);

  return (
    <WSStateContext.Provider value={wsInstance}>
      {children}
    </WSStateContext.Provider>
  );
}
function useWS(): WebSocket {
  const context = useContext(WSStateContext);

  if (context == undefined) {
    throw new Error("useWS must be used within a WSProvider");
  }

  return context;
}

export { WSProvider, useWS };
