import { createContext, useContext, useMemo, ReactNode, useState, useEffect } from "react";
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'

import Text from "../Text";

type NotificationProviderProps = { children: ReactNode };

export type INotificationProviderContext = {
  notification: any;
  openNotification: any;
  closeNotification: any;
};

const NotificationProviderContext =
  createContext<INotificationProviderContext | null>(null);

function NotificationProvider({
  children,
}: NotificationProviderProps): JSX.Element {
  const [notification, openNotification] = useState<any>({
    title: null,
    description: null,
    footer: null,
  });

  const closeNotification = () => {
    openNotification({
      title: null,
      description: null,
      footer: null,
    });
    document.body.style.overflow = "auto";

  };


  const { width, height } = useWindowSize()


useEffect(() => {



  if (notification && Object.keys(notification).some((key) => notification[key])) {
    document.body.style.overflow = "hidden";
  }

}, [notification])


  // useEffect(())
 
  const memoedValue = useMemo(
    () => ({
      notification,
      openNotification,
      closeNotification,
    }),
    [notification, openNotification, closeNotification]
  );

  return (
    <NotificationProviderContext.Provider value={memoedValue}>
      {notification &&
        Object.keys(notification).some((key) => notification[key]) && (
          <div
            css={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'auto',
              background: notification.dark ? notification.isWinner? "rgba(255, 255, 255, .3)" : 'rgba(255, 255, 255, .3)' :  "rgba(0, 0, 0, .9)",
              zIndex: 99900009,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
     
            }}
          >
            <div
              css={{
                borderRadius: 20,
                boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.1)",
                opacity: 1,
                zIndex: 99900009,
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
                background: notification.dark ? "black" : "white",
                color: notification.dark ? "white" : "black",
                width: 600,
                minHeight: 200,
                position: "relative",
                paddingBottom: 50,

              }}
            >
              {(notification.iconColor || notification.icon) && <div
                css={{
                  borderRadius: 900,
                  background: notification.iconColor ?  notification.iconColor : 'purple',
                  color: "#fff",
                  height: 60,
                  top: 0,
                  width: 60,
                  marginTop: -30,
                  position: "absolute",
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {notification.icon && notification.icon}
              </div>}
              {notification.title && (
                <Text variant="h4">{notification.title}</Text>
              )}
              {notification.description && (
                <div css={{maxWidth: '90%',}}>
                  <Text variant="body" css={{ fontSize: '22px', textAlign: 'center'}}>{notification.description}</Text>
                </div>
              )}
              {notification.footer && <div>{notification.footer}</div>}
            </div>
          </div>
        )}
      {children}
      {notification.isWinner && <Confetti
      width={width}
      height={height}
      css={{zIndex: '9990009!important', background: 'rgba(255, 255, 255, .1)'}}
      numberOfPieces={150}
      recycle={false}
      confettiSource={{x: 100, y: 100, w: width, h: height}}
    />}
    </NotificationProviderContext.Provider>
  );
}

function useNotifications(): INotificationProviderContext {
  const context = useContext(NotificationProviderContext);

  if (context == undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }

  return context;
}

export { NotificationProvider, useNotifications };
