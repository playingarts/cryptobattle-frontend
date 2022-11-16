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


  
  const wsInstance = useMemo(() => {
    if (localStorage.getItem("adding-metamask")) {
      localStorage.removeItem("adding-metamask")
      return null
    }
    if (typeof window != "undefined" && accessToken) {
      return new ReconnectingWebSocket(
        // eslint-disable-next-line
        // @ts-ignore: Unreachable code error
        `wss://playing-arts-game-backend-test-7pogl.ondigitalocean.app/api/socket?accesstoken=${accessToken}`, null, {debug: false, timeoutInterval: 12000 }
      );
    }
    return null;
  }, [accessToken]);


  if (!wsInstance) {
    return <div>{children}</div>
  }



  return (
    <WSStateContext.Provider value={wsInstance}>
      {children}
    </WSStateContext.Provider>
  );
}
function useWS(): WebSocket {
  const context = useContext(WSStateContext);

  if (context == undefined) {
    // throw new Error("useWS must be used within a WSProvider");
  }

  return context;
}

export { WSProvider, useWS };
