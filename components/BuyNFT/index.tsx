import { FC, Fragment } from "react";
import Button from "../Button";
import Line from "../Line";
import Link from "../Link";
import Opensea from "../../components/Icons/Opensea";

const BuyNFT: FC = () => {
  return (
    <Fragment>
      <Line spacing={5} />

      {/*
      <Text
        component="p"
        css={{
          margin: 0,
          marginTop: 30,
          marginBottom: 30,
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: 1020,
          color: "rgba(234, 234, 234, 0.3)",
        }}
      >
        Get more cards to have the most fun from the game!
      </Text>
      */}

      <div
        css={{
          display: "flex",
          marginTop: 20,
          marginBottom: 40,
        }}
      >
        <Link
          target="_blank"
          href="https://opensea.io/collection/cryptoedition"
        >
          <Button
            Icon={Opensea}
            css={(theme) => ({
              background: "rgba(255, 255, 255, 0.05)",
              marginRight: theme.spacing(1),
              color: "#407FDB",
            })}
          >
            Buy more cards
          </Button>
        </Link>
      </div>
    </Fragment>
  );
};

export default BuyNFT;
