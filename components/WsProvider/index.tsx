import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import ReconnectingWebSocket from 'reconnecting-websocket';

type WSProviderProps = { children: ReactNode; url: string };

const WSStateContext = createContext<WebSocket | null>(null);

function WSProvider({ children }: WSProviderProps): JSX.Element {
  const accessToken = localStorage.getItem("accessToken");

  const wsInstance = useMemo(
    () =>
      typeof window != "undefined"
        ? new ReconnectingWebSocket(
            `wss://playing-arts-game-backend-test-7pogl.ondigitalocean.app/api/socket?accesstoken=${accessToken}`
          )
        : null,
    [accessToken]
  );

  useEffect(() => {
    setInterval(() => {
      if (!wsInstance) {
        return
      }
      if (wsInstance.readyState === 2 || wsInstance.readyState === 3) {
        console.log('CLOSING OR CLOSED')
      }

      console.log("ping")
    }, 5000)

  }, [wsInstance]);


  useEffect(() => {
    // wsInstance?.onclose(() => {

    // })
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
