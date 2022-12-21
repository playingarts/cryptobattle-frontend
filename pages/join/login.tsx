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
import { useNotifications } from "../../components/NotificationProvider";

import Warning from "../../components/Icons/Warning";

const Home: any = () => {
  const { loggedIn } = useAuth();

  const router = useRouter();
  const { openNotification, closeNotification } = useNotifications();

  const { roomid } = router.query;
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

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
        setLoaded(true);
      })
      .catch((err: any) => {
        console.log(err);
        openNotification({
          title: "Ooops",
          description: <span>The game you are trying to join has ended!</span>,
          dark: false,
          icon: <Warning />,
          iconColor: "#FF6F41",
          footer: (
            <div css={{ display: "flex" }}>
              <Button component={Link} onClick={closeNotification} href="/">
                Go to Homepage
              </Button>
            </div>
          ),
        });
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
    loaded && (
      <ComposedGlobalLayout>
        <Layout
          css={(theme) => ({
            backgroundColor: "#0A0A0A",
            backgroundImage:
              "url(https://s3.amazonaws.com/img.playingarts.com/crypto/game/cards_bg.jpg)",
            backgroundSize: "2200px",
            backgroundPosition: "center 0px",
            backgroundRepeat: "no-repeat",
            color: theme.colors.text_title_light,
            overflow: "hidden",
            paddingTop: theme.spacing(18),
            paddingBottom: theme.spacing(15),
            position: "relative",
          })}
        >
          <div css={{ position: "relative" }}>
            {/* <img
              css={{ position: "absolute", left: 100, zIndex: 2 }}
              src="/img/card.png"
            />
            <img
              css={{ position: "absolute", left: 750, zIndex: 2 }}
              src="/img/card2.png"
            /> */}
            <div
              css={{
                background: "#fff",
                color: "#333",
                borderRadius: 20,
                textAlign: "left",
                maxWidth: 600,
                margin: "0 100px",
                padding: "80px 60px",
                zIndex: 99,
                position: "relative",
              }}
            >
              <Text component="h1" css={{ margin: "1px", fontSize: "45px" }}>
                Hey there!
              </Text>

              <Text variant="body3" css={{ fontSize: 22, lineHeight: "33px" }}>
                {formatUsername(roomInfo.inviterUsername)} is inviting you to battle in a new card game by 
                 <Link
                  target="_blank"
                  href="https://playingarts.com/crypto"
                > Playing Arts</Link>!
              </Text>

              {!loggedIn && (
                <div>
                  <Line spacing={2}></Line>
                  <Text
                    // variant="h6"
                    css={{ textAlign: "left", fontSize: "22px", color: "rgba(0, 0, 0, 0.4)" }}
                  >
                    To proceed, log in with{" "}
                  </Text>
                  <div
                    style={{ display: "flex", justifyContent: "left" }}
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

                    <MetamaskLogin roomId={roomid}/>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Layout>
      </ComposedGlobalLayout>
    )
  );
};

export default Home;
