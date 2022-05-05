import { NextPage } from "next";
import Layout from "../components/Layout";
import Grid from "../components/Grid";
import Text from "../components/Text";
import Link from "../components/Link";
import Button from "../components/Button";
import Twitter from "../components/Icons/Twitter";

import Line from "../components/Line";
import ComposedGlobalLayout from "../components/_composed/GlobalLayout";
import Arrowed from "../components/Arrowed";
import { useAuth } from "../components/AuthProvider";
import MetamaskLogin from "../components/MetamaskLogin/";

const Home: NextPage = () => {
  const { loggedIn } = useAuth();

  return (
    <ComposedGlobalLayout>
      <Layout
        css={(theme) => ({
          background: theme.colors.dark_gray,
          color: theme.colors.text_title_light,
          overflow: "hidden",
          paddingTop: theme.spacing(26),
          paddingBottom: theme.spacing(6.5),
          backgroundColor: "#0A0A0A",
          // backgroundImage:
          //   "url(https://s3.amazonaws.com/img.playingarts.com/www/static/home_bg.jpg)",
          backgroundSize: "cover",
        })}
      >
        <Grid>
          <div css={{ gridColumn: "0 / span 6" }}>
            <div css={{ width: "400px", height: "400px" }}></div>
          </div>

          <div css={{ gridColumn: "8 / span 5" }}>
            <Text component="h1" css={{ margin: "1px", fontSize: "40px" }}>
              Go head to head with opponents in turn-based play-2-earn card
              battle.
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
              <Arrowed>About the game</Arrowed>
            </Text>

            <Line spacing={2} />

            {!loggedIn ? (
              <div>
                <Text variant="body2">ready to play? log in with: </Text>
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
            ) : (
              <Button component={Link} href="/dashboard">
                Go to dashboard
              </Button>
            )}
          </div>
          {/* <Hero css={{ gridColumn: "8 / span 5" }} /> */}
        </Grid>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Home;
