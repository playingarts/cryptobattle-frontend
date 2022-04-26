import { NextPage } from "next";
import Layout from "../components/Layout";
import Text from "../components/Text";

import ComposedGlobalLayout from "../components/_composed/GlobalLayout";
 
import MetamaskLogin from "../components/MetamaskLogin/";

import { useMetaMask } from 'metamask-react';

function truncateMiddle(word: string) {
  const tooLongChars = 19; // arbitrary

  if (word.length < tooLongChars) {
      return word;
  }

  const ellipsis = '...';
  const charsOnEitherSide = Math.floor(tooLongChars / 2) - ellipsis.length;

  return word.slice(0, charsOnEitherSide) + ellipsis + word.slice(-charsOnEitherSide);
}

const Home: NextPage = () => {

    const {  account } = useMetaMask();


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
            GM, {account ? truncateMiddle(account) : "@twitterhandle"}

          </Text>
          <br></br>
          <MetamaskLogin />

        </div>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Home;
