import { NextPage } from "next";
import Layout from "../components/Layout";

import { useWS } from "../components/WsProvider/index";

import ComposedGlobalLayout from "../components/_composed/GlobalLayout";

import { useEffect } from "react";
// import { useAuth } from "../components/AuthProvider";
import { useGame } from "../components/GameProvider";
import Loader from "../components/Loader";
import { useRouter } from "next/router";
import { useNotifications } from "../components/NotificationProvider";
// import Text from "../components/Text";
import Warning from "../components/Icons/Warning";
// import NFTInventory from "../components/NFTInventory";
// import NFTChoose from "../components/NFTChoose";

const NewGame: NextPage = () => {
  // const { user } = useAuth();
  // const { openNotification, closeNotification } = useNotifications();
  const { openNotification } = useNotifications();

  const { roomId, setRoomId, isAlreadyConnected } = useGame();
  const router = useRouter();
  useEffect(() => {
    if (!roomId) {
      return;
    }

    router.push(`/game/${roomId}`);

    return () => setRoomId(null);
  }, [roomId]);

  const WSProvider = useWS();

  const headerMiddle = <div></div>;

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

  useEffect(() => {
    // First, ensure any existing game is properly quit
    // This handles case where user navigates to /new while still in a game
    WSProvider.send(
      JSON.stringify({
        event: "quit-game",
        data: {},
      })
    );

    // Small delay to let server process quit before creating new room
    const timer = setTimeout(() => {
      WSProvider.send(
        JSON.stringify({
          event: "create-room",
          data: {
            type: "private",
            maxPlayers: 10,
          },
        })
      );
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ComposedGlobalLayout headerTitle="NEW GAME" headerMiddle={headerMiddle}>
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
