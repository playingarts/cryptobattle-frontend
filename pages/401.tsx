import { NextPage } from "next";
import Layout from "../components/Layout";
import Text from "../components/Text";
import Button from "../components/Button";
import Link from "../components/Link";

import ComposedGlobalLayout from "../components/_composed/GlobalLayout";

const Home: NextPage = () => {
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
        <Text component="h1" css={{ margin: "1px", fontSize: "80px" }}>
          401 UNAUTHORIZED
        </Text>
        <br></br>
        <Button component={Link} href="/">
          Return to Home
        </Button>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Home;
