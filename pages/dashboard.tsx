import { NextPage } from "next";
import Layout from "../components/Layout";
import Text from "../components/Text";
import Button from "../components/Button";
import Link from "../components/Link";
import Stats from "../components/Stats";
import LeaderboardDashboard from "../components/LeaderboardDashboard";
import NFTInventory from "../components/NFTInventory";
import PromoSection from "../components/PromoSection";
import Grid from "../components/Grid/";
import Twitter from "../components/Icons/Twitter";
import Line from "../components/Line/";

import { useWS } from "../components/WsProvider/index";
import { useAuth } from "../components/AuthProvider";

import ComposedGlobalLayout from "../components/_composed/GlobalLayout";

// import MetamaskLogin from "../components/MetamaskLogin/";

import { useMetaMask } from "metamask-react";
import { useEffect } from "react";

function truncateMiddle(word: string) {
  if (!word) {
    return ""
  }
  const tooLongChars = 19; // arbitrary

  if (word.length < tooLongChars) {
    return word;
  }

  const ellipsis = "...";
  const charsOnEitherSide = Math.floor(tooLongChars / 2) - ellipsis.length;

  return (
    word.slice(0, charsOnEitherSide) + ellipsis + word.slice(-charsOnEitherSide)
  );
}

const Home: NextPage = () => {
  const { account } = useMetaMask();
  const WSProvider = useWS();

  const { user } = useAuth();

  useEffect(() => {
    WSProvider.onmessage = function (event) {
      console.log(event.data);
    };
  });

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
          backgroundSize: "cover",
        })}
      >
        <div>


        <div
            css={{
  
              padding: "0 42px",
            }}
          >

          <div
            css={{
              display: "flex",
              justifyContent: "space-between",
              alignItems:"center",
              padding: "20px 40px",
            }}
          >
            <Text component="h1" css={{ margin: "0", marginTop:"10px", fontSize: "60px", verticalAlign: "bottom" }}>
              GM, {truncateMiddle(user.username)}
            </Text>

            <Button
              component={Link}
              href={`https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/twitter?accesstoken=${localStorage.getItem(
                "accessToken"
              )}`}
              Icon={Twitter}
              css={(theme) => ({
                background: "rgba(255, 255, 255, 0.05)",
                marginRight: theme.spacing(1),
                color: "#489BE9",
              })}
            >
              {(user.metamask && Object.keys(user.metamask).length > 0) ||
              user.profilePictureUrl
                ? "Connect"
                : "Connected"}
            </Button>
          </div>
          <Line></Line>
          </div>

          <Grid
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
          </Grid>

          <NFTInventory></NFTInventory>

          <PromoSection></PromoSection>
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Home;
