import { FC, useEffect, useRef, useState } from "react";
import GameHeader, { Props as HeaderProps } from "../../components/GameHeader";
import ScrollContainer from "react-indiana-drag-scroll";
import GameRules from "../../components/GameRules/";
import { useRouter } from "next/router";
import { useNotifications } from "../../components/NotificationProvider";
import { useWS } from "../../components/WsProvider";
import { useGame } from "../../components/GameProvider";
import { useAuth } from "../../components/AuthProvider";
import Text from "../../components/Text";
import Warning from "../../components/Icons/Warning";
import Button from "../../components/Button";
import { hasResults, setGameStarted } from "../../utils/gameState";

const GameLayout: FC<
  Pick<
    HeaderProps,
    "altNav" | "showAltNav" | "noNav" | "palette" | "isCardPage" | "loading"
  >
> = ({ palette, loading, children }) => {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { openNotification, closeNotification } = useNotifications();
  const WSProvider = useWS(false);
  const { roomInfo, setPlayers } = useGame();
  const { user } = useAuth();

  const [isConfirmedLeave, setIsConfirmedLeave] = useState(false);

  // Determine if current user is the room owner
  const isOwner = roomInfo?.ownderId === user?.userId;

  // Ref to store beforeunload handler so we can remove it when intentionally leaving
  const beforeUnloadHandlerRef = useRef<((e: BeforeUnloadEvent) => void) | null>(null);

  // Setup beforeunload handler to warn users about leaving
  useEffect(() => {
    const handleTabClose = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      return;
    };

    beforeUnloadHandlerRef.current = handleTabClose;
    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
      beforeUnloadHandlerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const backToGame = () => {
        setIsConfirmedLeave(false);
        closeNotification();
      };
      const leave = () => {
        // Set flag to prevent redirect back to game (persists across navigation)
        localStorage.setItem("intentional-leave", "true");

        // Clear local state first
        setPlayers([]);
        localStorage.setItem("chosen-nfts", "");
        setGameStarted(false);

        // Send quit-game event to clear server's inGameId
        if (WSProvider) {
          WSProvider.send(
            JSON.stringify({
              event: "quit-game",
              data: {},
            })
          );
        }

        setIsConfirmedLeave(true);
        closeNotification();

        // Remove beforeunload handler to prevent browser "Leave site?" dialog
        if (beforeUnloadHandlerRef.current) {
          window.removeEventListener("beforeunload", beforeUnloadHandlerRef.current);
        }

        // Give time for WebSocket message to be sent and processed
        setTimeout(() => {
          // Use router.push for smoother navigation, with window.location as fallback
          router.push("/dashboard").catch(() => {
            window.location.href = "/dashboard";
          });
        }, 500);
      };

      if (
        !hasResults() &&
        !isConfirmedLeave &&
        url !== "/play" &&
        !localStorage.getItem("play-again")
      ) {
        router.events.emit("routeChangeError");
        openNotification({
          dark: false,
          icon: <Warning />,
          iconColor: "#FF6F41",

          description: (
            <div>
              <Text
                variant="h1"
                css={{
                  fontSize: 35,
                  lineHeight: "45.5px",
                  marginBottom: 0,
                  marginTop: 60,
                }}
              >
                Are you sure?
              </Text>
              <Text
                variant="body3"
                css={{ fontSize: 22, lineHeight: "33px", marginBottom: 0 }}
              >
                You are about to leave the game. <br />
                The game will continue without you.
              </Text>
            </div>
          ),
          footer: (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Button
                onClick={backToGame}
                css={() => ({
                  background: "#7B61FF",
                  color: "#fff",
                  margin: "10px auto",
                })}
              >
                Back to the game
              </Button>
              <Button
                onClick={leave}
                css={() => ({
                  margin: "10px auto",
                })}
              >
                Leave
              </Button>
            </div>
          ),
        });
        throw `routeChange aborted. This error can be safely ignored - https://github.com/zeit/next.js/issues/2476.`;
      }
    };

    // if (url !== "/play" && !url.startsWith("/game/")) {
    //   leave();
    // }

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [isConfirmedLeave, WSProvider, isOwner, setPlayers]);

  useEffect(() => {
    if (container.current) {
      container.current.scrollTo(
        (container.current.scrollWidth - container.current.clientWidth) / 2,
        container.current.scrollHeight / 2 - container.current.clientHeight / 2
      );
    }
  }, []);

  return (
    <div style={{ background: "#1A1A1A", minHeight: "100vh" }}>
      <ScrollContainer
        className="scroll-container"
        ignoreElements=".draggable"
        hideScrollbars={false}
        style={{ width: "100vw", height: "100vh", padding: 90 }}
        innerRef={container}
      >
        <GameHeader
          loading={loading}
          css={(theme) => ({
            position: "fixed",
            left: theme.spacing(1),
            right: theme.spacing(1),
            top: theme.spacing(1),
            zIndex: 10,

            "@media (min-width: 1440px)": {
              maxWidth: theme.spacing(170),
              left: "50%",
              transform: "translate(-50%, 0)",
              width: "100%",
            },
          })}
          palette={palette}
        />

        {children}
      </ScrollContainer>

      <GameRules>
        <div
          css={{
            position: "fixed",
            bottom: 20,
            left: 20,
            height: 60,
            width: 60,
            borderRadius: 4000,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "300ms all",
            background: "#181818",
            cursor: "pointer",
            color: "rgba(255, 255, 255, 0.3)",
            "&:hover": {
              color: "#fff",
            },
          }}
        >
          <svg
            width="16"
            height="25"
            viewBox="0 0 16 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.13208 13.105C5.13208 12.6259 5.17943 12.1982 5.27414 11.8218C5.38069 11.4455 5.53459 11.109 5.73585 10.8125C5.93711 10.5159 6.19756 10.2479 6.5172 10.0084C6.84869 9.75745 7.23344 9.52934 7.67148 9.32404L12.3596 7.15128V3.50721H3.6404V6.67225H0V3.50721C0 3.02817 0.0947096 2.57765 0.284129 2.15565C0.473548 1.72224 0.733999 1.35156 1.06548 1.04361C1.39697 0.724252 1.78172 0.47333 2.21976 0.290841C2.66963 0.0969472 3.14317 0 3.6404 0H12.3596C12.8568 0 13.3245 0.0969472 13.7625 0.290841C14.2124 0.47333 14.603 0.724252 14.9345 1.04361C15.266 1.35156 15.5265 1.72224 15.7159 2.15565C15.9053 2.57765 16 3.02817 16 3.50721V6.51827C16 6.9973 15.9526 7.42501 15.8579 7.80139C15.7632 8.17778 15.6152 8.51994 15.414 8.82789C15.2127 9.12444 14.9464 9.39247 14.6149 9.63198C14.2952 9.8715 13.9105 10.0996 13.4606 10.3163L8.75472 12.472V15.4317H5.13208V13.105ZM4.404 19.4179H9.71365V24.5333H4.404V19.4179Z"
              fill="currentColor"
              fillOpacity="1"
            />
          </svg>
        </div>
      </GameRules>
    </div>
  );
};

export default GameLayout;
