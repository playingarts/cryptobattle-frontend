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

import Link from "../../components/Link";
import { useEffect, useState } from "react";

import Line from "../../components/Line";
import Lobby from "../../components/Lobby";
import NFTChoose from "../../components/NFTChoose";
import StatBlock from "../../components/StatBlock";

import { useNotifications } from "../../components/NotificationProvider";
import { useAuth } from "../../components/AuthProvider";

const JoinGame: NextPage = () => {
  const WSProvider = useWS();
  const router = useRouter();
  const { roomid } = router.query;
  const { players, roomInfo } = useGame();
  const { user } = useAuth();

  const [isReady, setReady] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

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

  // useEffect(() => {
  //   const confirmationMessage = 'Are you sure you want to quit the lobby?';
  //   const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
  //     (e || window.event).returnValue = confirmationMessage;
  //     return confirmationMessage; // Gecko + Webkit, Safari, Chrome etc.
  //   };
  //   const beforeRouteHandler = (url: string) => {
  //     // if (confirm(confirmationMessage)) {
  //     //   WSProvider.send(
  //     //     JSON.stringify({
  //     //       event: "quit-room",
  //     //     })
  //     //   );
  //     // }

  //     if (router.pathname !== url && !confirm(confirmationMessage)) {
  //       // to inform NProgress or something ...
  //       router.events.emit('routeChangeError');
  //       // tslint:disable-next-line: no-string-throw
  //       throw `Route change to "${url}" was aborted (this error can be safely ignored). See https://github.com/zeit/next.js/issues/2476.`;
  //     }
  //     else {
  //       WSProvider.send(
  //         JSON.stringify({
  //           event: "close-room",
  //         })
  //       );
  //     }
  //   };
  //   if (unsaved) {
  //     window.addEventListener('beforeunload', beforeUnloadHandler);
  //     router.events.on('routeChangeStart', beforeRouteHandler);
  //   } else {
  //     window.removeEventListener('beforeunload', beforeUnloadHandler);
  //     router.events.off('routeChangeStart', beforeRouteHandler);
  //   }
  //   return () => {
  //     window.removeEventListener('beforeunload', beforeUnloadHandler);
  //     router.events.off('routeChangeStart', beforeRouteHandler);
  //   };
  // }, [unsaved])

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
    const handleRouteChange = (url: string) => {
      if (url !== "/play") {
        WSProvider.send(
          JSON.stringify({
            event: "quit-room",
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
  }, []);

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

  return (
    <ComposedGlobalLayout>
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
          <Text component="h1" css={{ margin: "1px", fontSize: "80px" }}>
            {isOwner ? "New Game" : "Join The Game"}
          </Text>

          {isOwner && (
            <div>
              <Text variant="body2" css={{ margin: "20px 0", color: "#fff" }}>
                Share your unique link with friends, wait for them to connect
                and click “Start The Game”. Choose the NFTs you want to level up
                (optional).
              </Text>
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
                    height: theme.spacing(5),
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

          <Text
            component={Link}
            variant="label"
            href="/"
            css={(theme) => ({
              opacity: 0.7,
              marginTop: theme.spacing(6),
              paddingTop: theme.spacing(6),
            })}
          >
            <Arrowed>Game Rules</Arrowed>
          </Text>

          {/* // eslint-disable-next-line 
    // @ts-ignore: Unreachable code error */}
          <Lobby isAdmin={isOwner} players={players} />
          <NFTChoose />
          <Line />
          <div style={{ display: "flex", justifyItems: "center" }}>
            {isOwner ? (
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
            )}
          </div>
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default JoinGame;
