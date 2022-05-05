import { NextPage } from "next";
import Layout from "../../components/Layout";
import Grid from "../../components/Grid";
import Text from "../../components/Text";
import ComposedGlobalLayout from "../../components/_composed/GlobalLayout";

const Play: NextPage = () => {
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
        <Grid>
          <div css={{ gridColumn: "1 / span 10" }}>
            <Text component="h1" css={{ margin: "1px", fontSize: "100px" }}>
              Start playing
            </Text>
          </div>
        </Grid>
      </Layout>
    </ComposedGlobalLayout>
  );
};

export default Play;
