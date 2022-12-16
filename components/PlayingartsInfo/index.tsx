import { FC, Fragment } from "react";
import Line from "../Line";
import Text from "../Text";
import Arrowed from "../Arrowed";
import GameRules from "../GameRules";
const PlayingartsInfo: FC = () => {
  return (
    <Fragment>
      <Line spacing={3} />

      <div
        css={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "40px",
        }}
      >
        <div css={{ maxWidth: 550 }}>
          <Text
            variant="h2"
            css={{
              fontSize: 18,
              lineHeight: "30px",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            Game Rules
          </Text>

          <Text
            css={{
              fontSize: 16,
              lineHeight: "24px",
              color: "rgba(255, 255, 255, 0.25)",
            }}
          >
            The game starts with one random card placed on the table. Players
            take it in turns, with each player choosing a card from their
            inventory and placing it on the table.
          </Text>
          <GameRules>
            <Text
              css={{
                color: "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                "&:hover": {
                  color: "rgba(255, 255, 255, 0.8)",
                  transition: "all 400ms",
                },
              }}
            >
              <Arrowed>Read More</Arrowed>
            </Text>
          </GameRules>
        </div>

        <div css={{ maxWidth: 550 }}>
          <Text
            variant="h2"
            css={{
              fontSize: 18,
              lineHeight: "30px",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            ABOUT CRYPTO EDITION
          </Text>

          <Text
            css={{
              fontSize: 16,
              lineHeight: "24px",
              color: "rgba(255, 255, 255, 0.25)",
            }}
          >
            Playing Arts Crypto Edition (PACE) is a deck of playing cards
            featuring works of 55 leading artists. Unique digital art
            collectibles living on the Ethereum blockchain.
          </Text>

          <Text
            css={{
              color: "rgba(255, 255, 255, 0.5)",
              cursor: "pointer",
              "&:hover": {
                color: "rgba(255, 255, 255, 0.8)",
                transition: "all 400ms",
              },
            }}
          >
            {" "}
            <Arrowed>Read More</Arrowed>
          </Text>
        </div>
      </div>
    </Fragment>
  );
};

export default PlayingartsInfo;
