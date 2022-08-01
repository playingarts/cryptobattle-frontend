import { NextPage } from "next";
import Layout from "../../components/Layout";
import Text from "../../components/Text";
import Line from "../../components/Line";
import Link from "../../components/Link";
import Button from "../../components/Button";
import Twitter from "../../components/Icons/Twitter";
import ComposedGlobalLayout from "../../components/_composed/GlobalLayout";
import { useAuth } from "../../components/AuthProvider";
import MetamaskLogin from "../../components/MetamaskLogin/";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "../../api";
import { formatUsername } from "../../utils/helpers";
import Loader from "../../components/Loader";

const Home: NextPage = () => {
  const { loggedIn } = useAuth();

  const router = useRouter();

  const { roomid } = router.query;
  const [loading, setLoading] = useState(true);

  const [roomInfo, setRoomInfo] = useState<any>(null);
  const getRoomInfo = (roomId: any) => {
    return api.get("/api/rest/join-info/" + roomId);
  };

  useEffect(() => {
    if (!roomid) {
      return;
    }
    setLoading(true);
    getRoomInfo(roomid)
      .then((data: any) => {
        console.log(data);
        setRoomInfo(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
      });
    localStorage.setItem("roomid", roomid as string);
  }, [roomid]);

  if (loading) {
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
    <ComposedGlobalLayout>
      <Layout
        css={(theme) => ({
          background: theme.colors.dark_gray,
          color: theme.colors.text_title_light,
          overflow: "hidden",
          paddingTop: theme.spacing(18),
          paddingBottom: theme.spacing(6.5),
          backgroundColor: "#0A0A0A",
          backgroundSize: "cover",
          position: "relative",
        })}
      >
        <div css={{ position: "relative" }}>
          <img
            css={{ position: "absolute", left: 100, zIndex: 2 }}
            src="/img/card.png"
          />
          <img
            css={{ position: "absolute", left: 750, zIndex: 2 }}
            src="/img/card2.png"
          />
          <div
            css={{
              background: "#fff",
              color: "#333",
              borderRadius: 20,
              textAlign: "center",
              maxWidth: 600,
              margin: "0 auto",
              padding: "80px 60px",
              zIndex: 99,
              position: "relative",
            }}
          >
            <Text component="h1" css={{ margin: "1px", fontSize: "35px" }}>
              Hey there!
            </Text>

            <Text variant="body3" css={{ fontSize: 22, lineHeight: "33px" }}>
              {formatUsername(roomInfo.inviterUsername)} invited to play a free
              and fun card game featuring cards from Crypto Edition NFT deck!
            </Text>

            {!loggedIn && (
              <div>
                <Line></Line>
                <Text
                  variant="h6"
                  css={{ textAlign: "center", color: "rgba(0, 0, 0, 0.3)" }}
                >
                  to accept, log in with:{" "}
                </Text>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <Button
                    component={Link}
                    href="https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/twitter"
                    Icon={Twitter}
                    css={(theme) => ({
                      background: "rgb(72, 155, 233)",
                      marginRight: theme.spacing(1),
                      color: "#fff",
                    })}
                  >
                    Twitter
                  </Button>

                  <MetamaskLogin />
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Home;
