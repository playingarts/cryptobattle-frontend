import { NextPage } from "next";
import Layout from "../components/Layout";
import Text from "../components/Text";
import { CSSObject } from "@emotion/serialize";
import { useWS } from "../components/WsProvider/index";

import StatBlock from "../components/StatBlock";

import ComposedGlobalLayout from "../components/_composed/GlobalLayout";

import Arrowed from "../components/Arrowed";
import Button from "../components/Button";
import Line from "../components/Line";
import Lobby from "../components/Lobby";
import GameRules from "../components/GameRules";

import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
// import NFTInventory from "../components/NFTInventory";
import NFTChoose from "../components/NFTChoose";

const NewGame: NextPage = () => {
  const { user } = useAuth();

  const startGame = () => {
    WSProvider.send(
      JSON.stringify({
        event: "start-game",
        data: {}
      })
    );
    // router.push("/play");
  };

  const [roomUrl, setRoomUrl] = useState("");
  const [players, setPlayers] = useState([{ ...user, state: "ready" }]);
  const [allReady, setAllReady] = useState(false);

  useEffect(() => {
    const isEveryoneReady = players.every((player) => player.state === "ready");

    setAllReady(isEveryoneReady && players.length > 1);
  }, [players]);

  useEffect(() => {
    setPlayers([{ ...user, state: "ready" }]);
  }, [user]);

  const WSProvider = useWS();

  useEffect(() => {
    WSProvider.onmessage = function ({ data }) {
      const event = JSON.parse(data);

      console.log(event)

      if (event.event === "create-room") {
        setRoomUrl(`${process.env.customKey}/join/${event.data.roomId}`);
      }

      if (event.event === "room-changed") {
        console.log(event.data.roomUsers);
        setPlayers(event.data.roomUsers);
      }

      if (event.data.error && event.data.error.message) {
        alert(event.data.error.message);
      }

      console.log(JSON.parse(data));
    };

    WSProvider.addEventListener("create-room", (data) => {
      // I am expecting 'Hello specific client'
      console.log(data, "eventlistener");
    });

    WSProvider.onopen = function () {
      WSProvider.send(
        JSON.stringify({
          event: "create-room",
          data: {
            type: "public",
            maxPlayers: 10,
          },
        })
      );
    };
  });
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
          <Text component="h1" css={{ margin: "1px", fontSize: "45px" }}>
            New Game
          </Text>
          <Text variant="body2" css={{ margin: "20px 0", color: "#fff"}}>
            Share your unique link with friends, wait for them to connect and
            click “Start The Game”. Choose the NFTs you want to level up
            (optional).
          </Text>
         
          <GameRules>
      <Text variant="label" css={{ opacity: 0.5 }}>
        <Arrowed>Game Rules</Arrowed>
      </Text>
      </GameRules>
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
              defaultValue={roomUrl}
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
          <NFTChoose />
    {/* // eslint-disable-next-line 
    // @ts-ignore: Unreachable code error */}
          <Lobby players={players} />
          <Line />{" "}
          <div style={{ display: "flex", justifyItems: "center" }}>
            <Button
              disabled={!allReady}
              css={() => ({
                background: "#7B61FF",
                color: "#fff",
                margin: "20px auto",
              })}
              onClick={startGame}
            >
              Start the game
            </Button>{" "}
          </div>
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default NewGame;
