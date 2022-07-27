import { FC, Fragment } from "react";
import Button from "../Button";
import Line from "../Line";
import Text from "../Text";
import Opensea from "../../components/Icons/Opensea";

const BuyNFT: FC = () => {
  return (
    <Fragment>
      <Line spacing={5} />

      <Text component="p" css={{ margin: 0, marginTop: "30px",  marginBottom: 30, color:"rgba(234, 234, 234, 0.5)"}}>
            Get more cards to have the most fun from the game!
      </Text>

      <div css={{ display: "flex", marginTop: "20px", marginBottom: 40 }}>
        <Button
          Icon={Opensea}
          css={(theme) => ({
            background: "rgba(255, 255, 255, 0.05)",
            marginRight: theme.spacing(1),
            color: "#407FDB",
          })}
        >
          opensea collection
        </Button>

      </div>

    </Fragment>
  );
};

export default BuyNFT;
