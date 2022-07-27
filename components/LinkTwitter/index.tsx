import { FC, Fragment } from "react";
import Button from "../Button";
import Line from "../Line";
import Text from "../Text";
import Link from "../Link";

import Twitter from "../../components/Icons/Twitter";

const LinkTwitter: FC = () => {
  return (
    <Fragment>
      <div css={{ padding: "20px 34px" }}>
        <Text
          component="p"
          css={{
            margin: 0,
            marginTop: "20px",
            marginBottom: 30,
            color: "rgba(234, 234, 234, 0.5)",
            fontSize: 20,
          }}
        >
          Link your twitter so other players could follow you.
        </Text>

        <div css={{ display: "flex", marginTop: "20px", marginBottom: 40 }}>
          <Button
            component={Link}
            href={`https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/auth/twitter?accesstoken=${localStorage.getItem(
              "accessToken"
            )}`}
            Icon={Twitter}
            css={(theme) => ({
              background: "rgba(255, 255, 255, 0.05)",
              marginRight: theme.spacing(1),
              color: "#407FDB",
            })}
          >
            Link Twitter
          </Button>
        </div>
        <Line css={{ marginBottom: 80 }}></Line>
      </div>
    </Fragment>
  );
};

export default LinkTwitter;
