import { FC, Fragment } from "react";
import Button from "../Button";
import Line from "../Line";
import Text from "../Text";
import Opensea from "../../components/Icons/Opensea";
import Looksrare from "../../components/Icons/Looksrare";

const PromoSection: FC = () => {
  return (
    <Fragment>
      <Line spacing={3} />

      <Text component="p" css={{ margin: 0, marginTop: "px", opacity: 0.5 }}>
        Playing Arts Crypto Edition (PACE) is a deck of playing cards featuring
        works of 55 leading artists.
        <br className="hidden md:block" /> Unique digital art collectibles
        living on the Ethereum blockchain.
      </Text>

      <div css={{ display: "flex", marginTop: "40px" }}>
        <Button
          Icon={Opensea}
          css={(theme) => ({
            background: "rgba(255, 255, 255, 0.05)",
            marginRight: theme.spacing(1),
            color: "#407FDB",
          })}
        >
          Opensea
        </Button>
        <Button
          css={(theme) => ({
            background: "rgba(255, 255, 255, 0.05)",
            marginRight: theme.spacing(1),
            color: "#04CD58 ",
          })}
          Icon={Looksrare}
        >
          Looksrare
        </Button>
      </div>

    </Fragment>
  );
};

export default PromoSection;
