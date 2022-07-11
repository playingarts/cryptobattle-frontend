import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
} from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';

type WSProviderProps = { children: ReactNode; url: string };

const WSStateContext = createContext<any | null>(null);

function WSProvider({ children }: WSProviderProps): JSX.Element {
  const accessToken = localStorage.getItem("accessToken");
  const wsInstance = useMemo(
    () => {
     return typeof window != "undefined"
      ? new ReconnectingWebSocket(
          `wss://playing-arts-game-backend-test-7pogl.ondigitalocean.app/api/socket?accesstoken=${accessToken}`
        )
      : null

    },
 
    [accessToken]
  );


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
