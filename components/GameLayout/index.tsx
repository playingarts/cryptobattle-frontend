import { FC, useEffect, useRef, useState } from "react";
import GameHeader, { Props as HeaderProps } from "../../components/GameHeader";
import ScrollContainer from "react-indiana-drag-scroll";
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
          router.push("/").catch(() => {
            window.location.href = "/";
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
    <div style={{ background: "#151515", minHeight: "100vh" }}>
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

    </div>
  );
};

export default GameLayout;
