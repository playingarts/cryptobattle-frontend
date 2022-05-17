import { NextPage } from "next";
import Layout from "../components/Layout";
import Text from "../components/Text";
import Button from "../components/Button";
import Link from "../components/Link";

import Twitter from "../components/Icons/Twitter";

import { useWS } from "../components/WsProvider/index";
import { useAuth } from "../components/AuthProvider";

import ComposedGlobalLayout from "../components/_composed/GlobalLayout";

import MetamaskLogin from "../components/MetamaskLogin/";

import { useMetaMask } from "metamask-react";
import { useEffect } from "react";

function truncateMiddle(word: string) {
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
          <Text component="h1" css={{ margin: "1px", fontSize: "80px" }}>
            GM, {account ? truncateMiddle(account) : user.name}
          </Text>

          <br></br>
          <MetamaskLogin
            isMetamaskConnected={
              user.metamask && Object.keys(user.metamask).length > 0
            }
          ></MetamaskLogin>

          <Button
            component={Link}
            href={`https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/twitter?accesstoken=${localStorage.getItem("accessToken")}`}
            Icon={Twitter}
            css={(theme) => ({
              background: "rgb(72, 155, 233)",
              marginRight: theme.spacing(1),
              color: "#fff",
            })}
          >
            {(user.metamask && Object.keys(user.metamask).length > 0 || user.profilePictureUrl) ? 'Connect' : 'Connected'}
          </Button>
        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Home;
