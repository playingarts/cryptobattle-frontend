import { NextPage } from "next";
import Layout from "../../components/Layout";
import { useWS } from "../../components/WsProvider/index";
import { useRouter } from "next/router";
import { useGame } from "../../components/GameProvider";
import Warning from "../../components/Icons/Warning";

import ComposedGlobalLayout from "../../components/_composed/GlobalLayout";

import Button from "../../components/Button";
import GameRules from "../../components/GameRules/";

import { useEffect, useState } from "react";

import Lobby from "../../components/Lobby";
import Ready from "../../components/Ready";

import NFTChoose from "../../components/NFTChoose";
import Text from "../../components/Text";
import { useNotifications } from "../../components/NotificationProvider";
import { useAuth } from "../../components/AuthProvider";
import NavProfile from "../../components/NavProfile";
import LobbyUrl from "../../components/LobbyUrl";

const JoinGame: NextPage = () => {
  const WSProvider = useWS();
  const router = useRouter();
  const { roomid, join } = router.query;
  const {
    players,
    setPlayers,
    roomInfo,
    isBackendReady,
    userSocketIdle,
    setUserSocketIdle,
    isAlreadyConnected,
  } = useGame();
  const { user } = useAuth();

  const [isReady, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isConfirmedLeave, setIsConfirmedLeave] = useState(false);

  const [isOwner, setIsOwner] = useState<any>(null);

  const { openNotification, closeNotification } = useNotifications();

  const startGame = () => {
    const startGameEvent = () => {
      WSProvider.send(
        JSON.stringify({
          event: "start-game",
          data: {},
        })
      );
    };
    if (!allReady) {
      openNotification({
        title: "Are You Sure?",
        description:
          "Some of the players are still not ready and will not play this round!",
        footer: (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Button
              onClick={closeNotification}
              css={() => ({
                background: "#7B61FF",
                color: "#fff",
                margin: "10px auto",
              })}
            >
              Wait for others
            </Button>

            <Button
              onClick={startGameEvent}
              css={() => ({
                background: "#7B61FF",
                color: "#fff",
                margin: "20px auto",
              })}
            >
              Start the game
            </Button>
          </div>
        ),
      });
    } else {
      startGameEvent();
    }
  };

  const [allReady, setAllReady] = useState(false);

  const [startGameDisabled, setStartGameDisabled] = useState(true);

  useEffect(() => {
    if (!userSocketIdle) {
      return;
    }
    if (userSocketIdle && userSocketIdle.userId !== user.userId && isOwner) {
      WSProvider.send(
        JSON.stringify({
          event: "kick-player",
          data: {
            userId: userSocketIdle.userId,
          },
        })
      );
    }
    setUserSocketIdle(null);
  }, [userSocketIdle, setUserSocketIdle, isOwner, user]);

  useEffect(() => {
    if (!players) {
      return;
    }
    const isEveryoneReady = players.every(
      (player: any) => player.state === "ready"
    );
    const startGameDisabled =
      players.filter((player: any) => player.state === "ready").length < 2;
    setAllReady(isEveryoneReady && players.length > 1);
    setStartGameDisabled(startGameDisabled);
  }, [players]);

  const toggleReady = () => {
    const ready = isReady ? false : true;
    console.log("Setting Ready: ", ready);
    WSProvider.send(
      JSON.stringify({
        event: "player-ready",
        data: {
          ready,
        },
      })
    );
    setReady(ready);
  };
  useEffect(() => {
    if (!isReady) {
      closeNotification();
      return;
    }

    openNotification({
      title: "You are ready!",
      description: (
        <span>
          Please wait for others to connect. <br></br>The game will start soon.
        </span>
      ),
      icon: <NavProfile color={"red"}></NavProfile>,
      footer: (
        <Button
          onClick={toggleReady}
          css={() => ({
            background: "#7B61FF",
            color: "#fff",
            margin: "20px auto",
          })}
        >
          {"I'M NOT READY"}
        </Button>
      ),
    });
  }, [isReady]);

  useEffect(() => {
    if (!isAlreadyConnected) {
      return;
    }
    openNotification({
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
            Already connected!
          </Text>
          <Text
            variant="body3"
            css={{ fontSize: 22, lineHeight: "33px", marginBottom: 0 }}
          >
            You are already in a lobby or a game in an another browser or tab.
          </Text>
        </div>
      ),
      dark: false,
      icon: <Warning />,
      iconColor: "#FF6F41",
    });
  }, [isAlreadyConnected]);

  useEffect(() => {
    const handleTabClose = (event: any) => {
      event.preventDefault();

      return;
    };

    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, []);

  useEffect(() => {
    if (isOwner === null) {
      return;
    }

    const leave = () => {
      const leave = () => {
        setPlayers(null);
        // eslint-disable-next-line
        localStorage.setItem("chosen-nft", JSON.stringify(null));
        WSProvider.send(
          JSON.stringify({
            event: isOwner ? "close-room" : "quit-room",
            data: {},
          })
        );
      };

      if (isOwner) {
        leave();
      } else {
        leave();
      }
    };

    const leaveAdmin = () => {
      closeNotification();
      leave();
      setIsConfirmedLeave(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 200);
    };

    const handleRouteChange = (url: string) => {
      console.log("handleRouteChange", url);

      if (isOwner && !isConfirmedLeave) {
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
                You are about to leave the lobby. The game will end for all
                players.
              </Text>
            </div>
          ),
          footer: (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Button
                onClick={leaveAdmin}
                css={() => ({
                  background: "#7B61FF",
                  color: "#fff",
                  margin: "10px auto",
                })}
              >
                Yes, Disconnect
              </Button>
              <Button
                onClick={closeNotification}
                css={() => ({
                  margin: "10px auto",
                })}
              >
                No, Stay
              </Button>
            </div>
          ),
        });
        throw `routeChange aborted. This error can be safely ignored - https://github.com/zeit/next.js/issues/2476.`;
      }
      if (isConfirmedLeave) {
        setIsConfirmedLeave(false);
      }
      if (url !== "/play" && !url.startsWith("/game/")) {
        leave();
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [isOwner, isConfirmedLeave]);

  useEffect(() => {
    if (!roomInfo) {
      return;
    }
    if (roomInfo.ownderId === user.userId) {
      setIsOwner(true);
      setLoaded(true);
    } else {
      setIsOwner(false);

      setLoaded(true);
    }
  }, [roomInfo, user]);

  useEffect(() => {
    setTimeout(() => {
      if (localStorage.getItem("show-rules-modal")) {
        document.getElementById("rules-button")?.click();
        localStorage.removeItem("show-rules-modal");
      }
    }, 0);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    // @ts-ignore: Unreachable code error
    window.gameStarted = false;
    // eslint-disable-next-line
    // @ts-ignore: Unreachable code error
    localStorage.removeItem("play-again");

    if (!isBackendReady) {
      return;
    }

    setTimeout(() => {
      WSProvider.send(
        JSON.stringify({
          event: "room-info",
          data: {},
        })
      );
    }, 0);
  }, [isBackendReady]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (join) {
      WSProvider.send(
        JSON.stringify({
          event: "join-room",
          data: { roomId: roomid },
        })
      );
    }
  }, [router.isReady, join]);

  const headerMiddle = <NavProfile />;

  const startGameButton = (
    <Button
      disabled={startGameDisabled}
      css={() => ({
        background: "#7B61FF",
        color: "#fff",
        margin: "20px auto",
      })}
      onClick={startGame}
    >
      Start the game
    </Button>
  );

  const readyButton = (
    <Button
      onClick={toggleReady}
      disabled={isReady}
      css={() => ({
        background: "#7B61FF",
        color: "#fff",
        margin: "20px auto",
      })}
    >
      {"LET'S GO"}
    </Button>
  );

  const headerRight = (
    <GameRules>
      <Button
        id="rules-button"
        css={{ color: "#fff", background: "rgba(255, 255, 255, 0.05)" }}
      >
        Game Rules
      </Button>
    </GameRules>
  );

  if (!loaded) {
    return <div>loading</div>;
  }

  return (
    <ComposedGlobalLayout
      headerTitle={isOwner ? "New Game" : "Join The Game"}
      headerMiddle={headerMiddle}
      headerRight={headerRight}
    >
      <Layout
        css={(theme) => ({
          background: theme.colors.dark_gray,
          color: theme.colors.text_title_light,
          overflow: "hidden",
          paddingTop: theme.spacing(12),
          paddingBottom: theme.spacing(6.5),
          backgroundColor: "#0A0A0A",
          backgroundSize: "cover",
          maxWidth: "810px",
          margin: "0 auto",
        })}
      >
        <div>
          {isOwner && (
            <LobbyUrl
              isOwner={isOwner}
              startGame={startGameButton}
              roomid={roomid}
            />
          )}

          {!isOwner && <Ready readyButton={readyButton} />}

          {/* // eslint-disable-next-line 
          // @ts-ignore: Unreachable code error */}
          <Lobby isAdmin={isOwner} players={players} />

          <NFTChoose />

          {!isOwner && <LobbyUrl isOwner={isOwner} roomid={roomid} />}
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default JoinGame;
