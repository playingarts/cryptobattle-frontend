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
import Text from "../components/Text";
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
    console.log("roomid happens", roomId);

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

  return (
    <ComposedGlobalLayout headerTitle="NEW GAME" headerMiddle={headerMiddle}>
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
