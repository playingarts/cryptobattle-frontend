import { NextPage } from "next";
import Layout from "../components/Layout";

import { useWS } from "../components/WsProvider/index";

import ComposedGlobalLayout from "../components/_composed/GlobalLayout";

import { useEffect } from "react";
// import { useAuth } from "../components/AuthProvider";
import { useGame } from "../components/GameProvider";
import Loader from "../components/Loader";
import { useRouter } from "next/router";

// import NFTInventory from "../components/NFTInventory";
// import NFTChoose from "../components/NFTChoose";

const NewGame: NextPage = () => {
  // const { user } = useAuth();
  // const { openNotification, closeNotification } = useNotifications();

  const { roomId, setRoomId} = useGame();
  const router = useRouter();
  useEffect(() => {
    console.log('roomid happens', roomId)

    if (!roomId) {
      return;
    }


    router.push(`/game/${roomId}`);

    return () => setRoomId(null)
  }, [roomId]);

  const WSProvider = useWS();

  const headerMiddle = <div></div>


  useEffect(() => {
    console.log(WSProvider.readyState);
    if (WSProvider.readyState === 1) {
      WSProvider.send(
        JSON.stringify({
          event: "create-room",
          data: {
            type: "private",
            maxPlayers: 10,
          },
        })
      );
    }
  }, [WSProvider.readyState]);
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
