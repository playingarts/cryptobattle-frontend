import { NextPage } from "next";
import Layout from "../../components/Layout";
import Text from "../../components/Text";
import { useWS } from "../../components/WsProvider/index";
import { useRouter } from "next/router";
import { useGame } from "../../components/GameProvider";

import ComposedGlobalLayout from "../../components/_composed/GlobalLayout";

import Arrowed from "../../components/Arrowed";
import Button from "../../components/Button";

import Link from "../../components/Link";
import { useEffect, useState } from "react";

import Line from "../../components/Line";
import Lobby from "../../components/Lobby";
import NFTChoose from "../../components/NFTChoose";

import { useNotifications } from "../../components/NotificationProvider";
import { useAuth } from "../../components/AuthProvider";

const JoinGame: NextPage = () => {
  const WSProvider = useWS();
  const router = useRouter();
  const { roomid } = router.query;
  const { players } = useGame();
  const { user } = useAuth();

  const [isReady, setReady] = useState(false);
  const { openNotification } = useNotifications();

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
      openNotification(null);

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
    if (players.find((player: any) => player.userId === user.userId)) {
      return;
    }
    WSProvider.send(
      JSON.stringify({
        event: "join-room",
        data: {
          roomId: roomid,
        },
      })
    );

    WSProvider.send(
      JSON.stringify({
        event: "room-info",
        data: {},
      })
    );
  }, [players]);

  useEffect(() => {
    console.log(roomid);
    if (!roomid) {
      return;
    }

    WSProvider.send(
      JSON.stringify({
        event: "join-room",
        data: {
          roomId: roomid,
        },
      })
    );

    setTimeout(() => {
      WSProvider.send(
        JSON.stringify({
          event: "room-info",
          data: {},
        })
      );
    }, 1000);
  }, [roomid]);

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
            Join The Game
          </Text>

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
          <Lobby players={players} />
          <NFTChoose />
          <Line />
          <div style={{ display: "flex", justifyItems: "center" }}>
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
          </div>
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default JoinGame;
