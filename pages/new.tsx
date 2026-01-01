import { NextPage } from "next";
import Layout from "../components/Layout";

import { useWS } from "../components/WsProvider/index";

import ComposedGlobalLayout from "../components/_composed/GlobalLayout";

import { useEffect } from "react";
import { useGame } from "../components/GameProvider";
import Loader from "../components/Loader";
import { useRouter } from "next/router";
import { useNotifications } from "../components/NotificationProvider";
import Warning from "../components/Icons/Warning";

/**
 * New Game page - creates a room and redirects to the lobby
 * For quickstart (Play Now), use /quickstart instead
 */
const NewGame: NextPage = () => {
  const { openNotification } = useNotifications();
  const { roomId, setRoomId, isAlreadyConnected } = useGame();
  const router = useRouter();
  const WSProvider = useWS();

  // When room is created, redirect to lobby
  useEffect(() => {
    if (!roomId) {
      return;
    }
    router.push(`/game/${roomId}`);
    return () => setRoomId('');
  }, [roomId]);

  // Handle already connected warning
  useEffect(() => {
    if (!isAlreadyConnected) {
      return;
    }
    openNotification({
      title: "Already connected!",
      description: (
        <span>
          You are already in a lobby or a game in an another browser or tab.
        </span>
      ),
      dark: false,
      icon: <Warning />,
      iconColor: "#FF6F41",
    });
  }, [isAlreadyConnected]);

  // Create room on mount
  useEffect(() => {
    // First, ensure any existing game is properly quit
    WSProvider.send(JSON.stringify({ event: "quit-game", data: {} }));

    // Create room - the backend will auto-add a bot
    WSProvider.send(JSON.stringify({
      event: "create-room",
      data: { type: "private", maxPlayers: 10 },
    }));
  }, []);

  return (
    <ComposedGlobalLayout headerTitle="NEW GAME" headerMiddle={<div></div>}>
      <Layout
        css={(theme) => ({
          color: theme.colors.text_title_light,
          overflow: "hidden",
          paddingTop: theme.spacing(12),
          paddingBottom: theme.spacing(6.5),
          backgroundSize: "cover",
          maxWidth: "810px",
          margin: "0 auto",
        })}
      >
        <div
          css={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <Loader css={{ transform: "scale(2, 2)" }} />
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default NewGame;
