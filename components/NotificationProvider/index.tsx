import { createContext, useContext, useMemo, ReactNode, useState } from "react";
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
    footer: null
  });

  const closeNotification = () => {
      openNotification({
        title: null,
        description: null,
        footer: null
      })
  }

  const memoedValue = useMemo(
    () => ({
      notification,
      openNotification,
      closeNotification
    }),
    [notification, openNotification, closeNotification]
  );

  return (
    <NotificationProviderContext.Provider value={memoedValue}>
      {notification && (
        <div
          css={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, .5)",
            zIndex: 9999,
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
              zIndex: 99999,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
              background: "white",
              width: 600,
              minHeight: 200,
              position: "relative",
            }}
          >
            <div
              css={{
                borderRadius: 900,
                background: "red",
                height: 60,
                top: 0,
                width: 60,
                marginTop: -30,
                position: "absolute",
              }}
            ></div>
            {notification.title && (
              <Text variant="h4">{notification.title}</Text>
            )}
            {notification.description && (
              <div>
                <Text variant="body">{notification.description}</Text>
              </div>
            )}
            {notification.footer && <div>{notification.footer}</div>}
          </div>
        </div>
      )}
      {children}
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
