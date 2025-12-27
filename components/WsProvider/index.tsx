import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';

type WSProviderProps = { children: ReactNode; url: string };

const WSStateContext = createContext<ReconnectingWebSocket | null>(null);

function WSProvider({ children, url }: WSProviderProps): JSX.Element {
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const wsInstance = useMemo(() => {
    if (typeof window === "undefined" || !accessToken) {
      return null;
    }
    if (localStorage.getItem("adding-metamask")) {
      localStorage.removeItem("adding-metamask");
      return null;
    }
    const options = {
      connectionTimeout: 12000
    };
    const wsUrl = `wss://${url}/api/socket?accesstoken=${accessToken}`;
    return new ReconnectingWebSocket(wsUrl, [], options);
  }, [accessToken, url]);


  if (!wsInstance) {
    return <div>{children}</div>
  }



  return (
    <WSStateContext.Provider value={wsInstance}>
      {children}
    </WSStateContext.Provider>
  );
}
function useWS(): ReconnectingWebSocket {
  const context = useContext(WSStateContext);

  if (context === null) {
    throw new Error("useWS must be used within a WSProvider with a valid connection");
  }

  return context;
}

export { WSProvider, useWS };
