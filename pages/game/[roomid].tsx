import { NextPage } from "next";
import Layout from "../../components/Layout";
import Text from "../../components/Text";
import { useWS } from "../../components/WsProvider/index";
import { useRouter } from "next/router";
import { useGame } from "../../components/GameProvider";
import { CSSObject } from "@emotion/serialize";

import ComposedGlobalLayout from "../../components/_composed/GlobalLayout";

import Arrowed from "../../components/Arrowed";
import Button from "../../components/Button";
import GameRules from "../../components/GameRules/";

import { useEffect, useState } from "react";

import Line from "../../components/Line";
import Lobby from "../../components/Lobby";
import NFTChoose from "../../components/NFTChoose";
import StatBlock from "../../components/StatBlock";

import { useNotifications } from "../../components/NotificationProvider";
import { useAuth } from "../../components/AuthProvider";
import NavProfile from "../../components/NavProfile";

const JoinGame: NextPage = () => {
  const WSProvider = useWS();
  const router = useRouter();
  const { roomid } = router.query;
  const { players, roomInfo } = useGame();
  const { user } = useAuth();

  const [isReady, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
      description:
        "Please wait for others to connect. The game will start soon.",
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
  }, [isReady, openNotification]);

  useEffect(() => {
    console.log(isOwner, "handleRouteChange");

    if (isOwner === null) {
      return;
    }
    const handleRouteChange = (url: string) => {
      console.log("handleRouteChange");
      if (url !== "/play") {
        WSProvider.send(
          JSON.stringify({
            event: isOwner ? "close-room" : "quit-room",
            data: {},
          })
        );
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [isOwner]);

  //   useEffect(() => {
  //     if (!router.isReady) {
  //       return
  //     }
  //     const exitingFunction = () => {

  //         //  WSProvider.send(
  //         //     JSON.stringify({
  //         //       event: "close-room",
  //         //       data: {}
  //         // //     })
  // console.log("Exiting Function router", router)

  //     };

  //     router.events.on("routeChangeStart", exitingFunction);

  //     return () => {
  //       console.log("unmounting component...");
  //       router.events.off("routeChangeStart", exitingFunction);
  //     };
  //   }, [router.isReady, isOwner]);

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
    if (!router.isReady) {
      return;
    }
    if (players.find((player: any) => player.userId === user.userId)) {
      return;
    }

    WSProvider.send(
      JSON.stringify({
        event: "room-info",
        data: {},
      })
    );
  }, [players, router.isReady]);

  useEffect(() => {
    console.log(roomid, "game");

    // if (!router.isReady) {
    //   return;
    // }
    // WSProvider.send(
    //   JSON.stringify({
    //     event: "room-info",
    //     data: {},
    //   })
    // );

    if (!roomid) {
      return;
    }
    console.log(roomid, "game");

    // WSProvider.send(
    //   JSON.stringify({
    //     event: "room-info",
    //     data: {},
    //   })
    // );
    setTimeout(() => {
      // WSProvider.send(
      //   JSON.stringify({
      //     event: "room-info",
      //     data: {},
      //   })
      // );

      WSProvider.send(
        JSON.stringify({
          event: "join-room",
          data: {
            roomId: roomid,
          },
        })
      );
    }, 1000);
  }, [router.isReady]);

  const headerMiddle = <NavProfile />;
  const headerRight = isOwner ? (
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
  ) : (
    <Button
      onClick={toggleReady}
      disabled={isReady}
      css={() => ({
        background: "#7B61FF",
        color: "#fff",
        margin: "20px auto",
      })}
    >
      {"I'M READY"}
    </Button>
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
            <div>
              <StatBlock
                css={(theme) => ({
                  background: `#181818`,
                  backgroundSize: "85%",
                  color: theme.colors.text_title_light,
                  position: "relative",
                  margin: "20px 0",
                })}
              >
                <input
                  disabled
                  defaultValue={`https://play2.playingarts.com/join/${roomid}`}
                  css={(theme) => ({
                    ...(theme.typography.body2 as CSSObject),
                    paddingLeft: theme.spacing(2),
                    height: theme.spacing(8),
                    flexGrow: 1,
                    borderRadius: "10px",
                    width: "100%",
                    backgroundColor: "#fff",
                    color: "black",
                  })}
                />
              </StatBlock>
            </div>
          )}

          {/* // eslint-disable-next-line 
          // @ts-ignore: Unreachable code error */}
          <Lobby isAdmin={isOwner} players={players} />
          <NFTChoose />
          {isOwner && (
            <div>
              <Line />

              <Text
                variant="body2"
                css={{ margin: "20px 0", color: "#fff", opacity: 0.75 }}
              >
                Share your unique link with friends, wait for them to connect
                and click “Start The Game”. Choose the NFTs you want to level up
                (optional).
              </Text>
              <GameRules>
                <Text
                  component="div"
                  variant="label"
                  css={() => ({
                    opacity: 0.7,
                    cursor: "pointer",
                  })}
                >
                  <Arrowed>Game Rules</Arrowed>
                </Text>
              </GameRules>
            </div>
          )}
        </div>

        <GameRules>
          <div
            css={{
              position: "fixed",
              bottom: 60,
              right: 40,
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
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default JoinGame;
