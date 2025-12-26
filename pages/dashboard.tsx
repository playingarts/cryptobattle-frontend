import { NextPage } from "next";
import Layout from "../components/Layout";
// import Text from "../components/Text";
import Button from "../components/Button";
// import Link from "../components/Link";
import GameRules from "../components/GameRules/";

// import Stats from "../components/Stats";
// import LeaderboardDashboard from "../components/LeaderboardDashboard";
import NFTInventory from "../components/NFTInventory";
// import PromoSection from "../components/PromoSection";
// import Grid from "../components/Grid/";
// import Twitter from "../components/Icons/Twitter";
// import { formatUsername } from "../utils/helpers";

import { useAuth } from "../components/AuthProvider";
import NavProfile from "../components/NavProfile";

import ComposedGlobalLayout from "../components/_composed/GlobalLayout";
import DashboardHeader from "../components/DashboardHeader";

import LinkTwitter from "../components/LinkTwitter";

const Home: NextPage = () => {
  const { user } = useAuth();

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

  const headerMiddle = <NavProfile user={user} />;

  return (
    <ComposedGlobalLayout
      headerTitle="DASHBOARD"
      headerMiddle={headerMiddle}
      headerRight={headerRight}
    >
      <Layout
        css={(theme) => ({
          background: "theme.colors.dark_gray",
          color: theme.colors.text_title_light,
          overflow: "hidden",
          paddingTop: theme.spacing(10),
          paddingBottom: theme.spacing(6.5),
          backgroundColor: "#0A0A0A",
          backgroundSize: "cover",
        })}
      >
        <div>
          <div
            css={{
              padding: "0",
              marginTop: 40,
            }}
          >
            <DashboardHeader />

            <div
              css={{
                backgroundColor: "#181818",
                color: "rgba(255, 255, 255, 0.3)",
                maxWidth: 1040,
                margin: "30px auto 0",
                padding: "0 70px",
                lineHeight: "70px",
                fontSize: "16px",
                borderRadius: "10px",
              }}
            >
              We need your feedback!
              <a
                css={{
                  color: "rgba(255, 255, 255, 0.5)",
                  textDecoration: "none",
                  margin: "0 7px",
                  transition: "all 300ms",
                  "&:hover": {
                    color: "rgba(255, 255, 255, 0.9)",
                  },
                }}
                href="https://discord.gg/bJUDBsj977"
                target={"_blank"}
                rel="noreferrer"
              >
                Join our Discord
              </a>
              and let us know what you think about this game!
            </div>

            {user && !user.isTwitterConnected && <LinkTwitter />}
            {/* <div
              css={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 40px",
              }}
            >
              <Text
                component="h1"
                css={{
                  margin: "0",
                  marginTop: "0",
                  fontSize: "50px",
                  verticalAlign: "bottom",
                }}
              >
                GM, {formatUsername(user.username)}
              </Text>

              {!user.isTwitterConnected && (
                <Button
                  component={Link}
                  href={`${process.env.NEXT_PUBLIC_API_URL}/auth/twitter?accesstoken=${localStorage.getItem(
                    "accessToken"
                  )}`}
                  Icon={Twitter}
                  css={(theme) => ({
                    background: "rgba(255, 255, 255, 0.05)",
                    marginRight: theme.spacing(1),
                    color: "#489BE9",
                    pointerEvents: user.isTwitterConnected ? "none" : "unset",
                  })}
                >
                  Connect
                </Button>
              )}
            </div> */}
            {/* <Line css={{marginBottom: 80}}></Line> */}
          </div>
          {/* <Grid
            css={(theme) => ({
              marginTop: theme.spacing(4),
              marginBottom: theme.spacing(3),
            })}
          >
            <Stats
              css={(theme) => ({
                gridColumn: "span 9",
                background: theme.colors.dark_gray,
                color: theme.colors.text_title_light,
              })}
            ></Stats>
            <LeaderboardDashboard
              css={(theme) => ({
                gridColumn: "span 3",
                background: theme.colors.dark_gray,
                color: theme.colors.text_title_light,
              })}
            ></LeaderboardDashboard>
          </Grid> */}
          <NFTInventory></NFTInventory>
          {/* <PlayingArtsinfo></PlayingArtsinfo> */}
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Home;
