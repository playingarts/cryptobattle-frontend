import { NextPage } from "next";
import Layout from "../../components/Layout";
import Text from "../../components/Text";
import { useWS } from "../../components/WsProvider/index";
import { useRouter } from "next/router";
import StatBlock from "../../components/StatBlock";

import ComposedGlobalLayout from "../../components/_composed/GlobalLayout";

import Arrowed from "../../components/Arrowed";
import Button from "../../components/Button";

import Link from "../../components/Link";
import { useEffect, useState } from "react";

import Line from "../../components/Line";
import Lobby from "../../components/Lobby";

const JoinGame: NextPage = () => {
  const WSProvider = useWS();
  const router = useRouter();
  const { roomid } = router.query;
  const [players, setPlayers] = useState([]);

  const [isReady, setReady] = useState(false);

  const toggleReady = () => {
    const ready = isReady ? false : true;
    console.log(ready, "ready");
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
    WSProvider.onmessage = function ({ data }) {
      const event = JSON.parse(data);
      console.log(event)

      if (event.event === "room-changed") {
        console.log(event.data.roomUsers, "room-changed");
        setPlayers(event.data.roomUsers);
      }
      
      if (event.data.error && event.data.error.message) {
        alert(event.data.error.message);
      } 

    };

    if (!roomid) {
      return;
    }

    WSProvider.onopen = function () {
      WSProvider.send(
        JSON.stringify({
          event: "join-room",
          data: {
            roomId: roomid,
          },
        })
      );
    };
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

          <StatBlock
            //   {...props}
            css={(theme) => ({
              background: `#181818`,
              backgroundSize: "85%",
              color: theme.colors.text_title_light,
              position: "relative",
              margin: "20px 0",
            })}
            title="choose up to 2 nfts (optional)"
          ></StatBlock>

          <Lobby players={players} />

          <Line />
          <div style={{ display: "flex", justifyItems: "center" }}>
            <Button
              onClick={toggleReady}
              css={() => ({
                background: "#7B61FF",
                color: "#fff",
                margin: "20px auto",
              })}
            >
              {isReady ? "I'M NOT READY" : "I'M READY"}
            </Button>
          </div>
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default JoinGame;
