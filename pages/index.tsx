import { NextPage } from "next";
import Layout from "../components/Layout";
import Grid from "../components/Grid";
import Text from "../components/Text";
import Link from "../components/Link";
import Button from "../components/Button";

import Line from "../components/Line";
import ComposedGlobalLayout from "../components/_composed/GlobalLayout";
import { useAuth } from "../components/AuthProvider";
import MetamaskLogin from "../components/MetamaskLogin/";
import GuestLogin from "../components/GuestLogin/";

const Home: NextPage = () => {
  const { loggedIn } = useAuth();

  return (
    <ComposedGlobalLayout>
      <Layout
        css={(theme) => ({
          background: "transparent",
          color: theme.colors.text_title_light,
          overflow: "hidden",
          paddingTop: 200,
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
                <div style={{ display: "flex", justifyContent: "start", alignItems: "center" }}>
                  {/* MetamaskLogin hidden but functionality preserved */}
                  <div style={{ display: "none" }}>
                    <MetamaskLogin />
                  </div>
                  <GuestLogin />
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
