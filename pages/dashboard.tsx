import { NextPage } from "next";
import Layout from "../components/Layout";
import Button from "../components/Button";
import GameRules from "../components/GameRules/";

import NFTInventory from "../components/NFTInventory";

import { useAuth } from "../components/AuthProvider";
import NavProfile from "../components/NavProfile";

import ComposedGlobalLayout from "../components/_composed/GlobalLayout";
import DashboardHeader from "../components/DashboardHeader";

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
                  href={`https://cryptobattle-backend-production.up.railway.app/auth/twitter?accesstoken=${localStorage.getItem(
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
          {!user.isGuest ? (
            <NFTInventory></NFTInventory>
          ) : (
            <div
              css={{
                backgroundColor: "#181818",
                color: "rgba(255, 255, 255, 0.5)",
                maxWidth: 1040,
                margin: "30px auto 0",
                padding: "40px 70px",
                fontSize: "16px",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              <p css={{ margin: 0, marginBottom: 10 }}>
                You are playing as a guest. Stats and NFT cards are not available.
              </p>
              <p css={{ margin: 0, color: "rgba(255, 255, 255, 0.3)" }}>
                Connect with Metamask to track your progress and use NFT cards.
              </p>
            </div>
          )}
          {/* <PlayingArtsinfo></PlayingArtsinfo> */}
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Home;
