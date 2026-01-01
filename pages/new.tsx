import { NextPage } from "next";
import Layout from "../components/Layout";

import { useWS } from "../components/WsProvider/index";

import ComposedGlobalLayout from "../components/_composed/GlobalLayout";

import { useEffect, useState } from "react";
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

  // Check quickstart from URL immediately on mount (not from router.query which hydrates later)
  const [isQuickstart, setIsQuickstart] = useState(true); // Default to true to show simple loader initially

  useEffect(() => {
    // Set quickstart state immediately on client side
    setIsQuickstart(window.location.search.includes('quickstart=true'));
  }, []);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    // For quickstart, handleCreateRoom in wsEventHandlers redirects directly to /play
    // Check window.location.search directly to avoid any React state timing issues
    const isQuickstartUrl = window.location.search.includes('quickstart=true');
    if (isQuickstartUrl) {
      // Don't redirect here - handleCreateRoom already pushed to /play
      return;
    }

    // Non-quickstart: go to lobby
    router.push(`/game/${roomId}`);
    return () => setRoomId('');
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

    // Send create-room immediately after quit-game
    // The backend handles the sequence properly
    WSProvider.send(
      JSON.stringify({
        event: "create-room",
        data: {
          type: "private",
          maxPlayers: 10,
        },
      })
    );
  }, []);

  // For quickstart, show same loader style as /play page for seamless transition
  if (isQuickstart) {
    return (
      <div
        css={{
          height: "100vh",
          background: "#181818",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader
          css={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%) scale(2)",
            lineHeight: 1,
            color: "#fff",
          }}
        />
      </div>
    );
  }

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
