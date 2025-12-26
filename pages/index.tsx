import { NextPage } from "next";
import Layout from "../components/Layout";
import Grid from "../components/Grid";
import Text from "../components/Text";
import Link from "../components/Link";
import Button from "../components/Button";
// import PromoSection from "../components/PromoSection";

import Twitter from "../components/Icons/Twitter";

import Line from "../components/Line";
import ComposedGlobalLayout from "../components/_composed/GlobalLayout";
// import Arrowed from "../components/Arrowed";
import { useAuth } from "../components/AuthProvider";
import MetamaskLogin from "../components/MetamaskLogin/";
import GameRules from "../components/GameRules";

const Home: NextPage = () => {
  const { loggedIn } = useAuth();

  const headerRight = (
    <GameRules>
      <Button
        css={{
          color: "#7a7a7a",
          background: "rgba(255, 255, 255, 0.05)",
          transition: "color 500ms",
          "&:hover": {
            color: "#fff",
          },
        }}
      >
        Game Rules
      </Button>
    </GameRules>
  );

  return (
    <ComposedGlobalLayout headerRight={headerRight}>
      <Layout
        css={(theme) => ({
          background: theme.colors.dark_gray,
          color: theme.colors.text_title_light,
          overflow: "hidden",
          paddingTop: theme.spacing(26),
          paddingBottom: "50px",
          backgroundColor: "#0A0A0A",
          backgroundImage:
            "url(https://s3.amazonaws.com/img.playingarts.com/crypto/game/cards_bg.jpg)",
          backgroundSize: "2200px",
          backgroundPosition: "center 0px",
          backgroundRepeat: "no-repeat",
        })}
      >
        <Grid css={{ marginBottom: 200 }}>
          {/* <div css={{ gridColumn: "0 / span 5" }}>
            <div css={{ width: "400px", height: "400px" }}></div>
          </div> */}

          <div css={{ gridColumn: "2 / span 6" }}>
            <Text
              component="h1"
              css={{ margin: "1px", fontSize: "50px", lineHeight: "65px" }}
            >
              Go head to head with opponents in turn-based card battle
            </Text>

            <Line spacing={2} />

            {!loggedIn ? (
              <div>
                <Text
                  variant="body2"
                  css={{
                    color: "#7a7a7a",
                  }}
                >
                  Log in with
                </Text>
                <div style={{ display: "flex", justifyContent: "start" }}>
                  <Button
                    component={Link}
                    href={`${process.env.NEXT_PUBLIC_API_URL}/auth/twitter`}
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
              <Button
                css={{
                  marginTop: "10px",
                  backgroundColor: "rgb(123, 97, 255)",
                  color: "#fff",
                }}
                component={Link}
                href="/dashboard"
              >
                Start playing
              </Button>
            )}
          </div>
        </Grid>
        {/* <PromoSection /> */}
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Home;
