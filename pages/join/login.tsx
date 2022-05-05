import { NextPage } from "next";
import Layout from "../../components/Layout";
import Grid from "../../components/Grid";
import Text from "../../components/Text";
import Link from "../../components/Link";
import Button from "../../components/Button";
import Twitter from "../../components/Icons/Twitter";

import ComposedGlobalLayout from "../../components/_composed/GlobalLayout";
import { useAuth } from "../../components/AuthProvider";
import MetamaskLogin from "../../components/MetamaskLogin/";
import { useRouter } from "next/router";
import { useEffect } from "react";
const Home: NextPage = () => {
  const { loggedIn } = useAuth();

  const router = useRouter();

  const { roomid } = router.query;

  useEffect(() => {
    if (!roomid) {
      return;
    }
    localStorage.setItem("roomid", roomid as string);
  }, [roomid]);

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
        })}
      >
        <Grid>
          <div css={{ gridColumn: "2 / span 10" }}>
            <Text component="h1" css={{ margin: "1px", fontSize: "60px" }}>
              Hey there!
            </Text>

            <Text variant="body3">
              USERNAME invited you to play a free and fun card game featuring
              cards from Crypto Edition NFT deck!
            </Text>

            {!loggedIn && (
              <div>
                <Text variant="h6">ready to play? log in with: </Text>
                <div style={{ display: "flex", justifyContent: "start" }}>
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
        </Grid>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Home;
