import { FC, HTMLAttributes, useEffect, useState } from "react";

import { useAuth } from "../AuthProvider";
import { useGame } from "../GameProvider";

import LogoMenu from "../LogoMenu";
import GameInventory from "../GameInventory";
import { getCard } from "../../components/Cards";
import PlayerQueue from "../PlayerQueue";

export interface Props extends HTMLAttributes<HTMLElement> {
  palette?: "gradient";
  altNav?: JSX.Element;
  showAltNav?: boolean;
  noNav?: boolean;
  isCardPage?: boolean;
  loading?: boolean;
}

const GameHeader: FC<Props> = ({ palette, loading, ...props }) => {
  const { user } = useAuth();
  const { gameState, playersGame } = useGame();
  const [playersWithPoints, setPlayersWithPoints] = useState<Array<any>>([]);
  const [currentPlayerWithPoints, setCurrentPlayerWithPoints] =
    useState<any>("");

  const [opponentsCards, setOpponentsCards] = useState<Array<any>>([]);
  const [loadingDelayed, setLoadingDelayed] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoadingDelayed(false);
    }, 0);
  }, [loading]);

  useEffect(() => {
    if (!gameState || !playersGame) {
      return;
    }
    if (playersGame.length === 0) {
      return;
    }

    const playersWithPoints = [...playersGame].map((player: any) => {
      player.points = gameState?.playersCurrentPoints[player.userId]
        ? gameState.playersCurrentPoints[player.userId]
        : 0;

      return { ...player };
    });

    const currentPlayerWithPoints = playersWithPoints.find(
      (player: any) => player.userId === gameState.turnForPlayer
    );

    setCurrentPlayerWithPoints(currentPlayerWithPoints);
    setPlayersWithPoints(playersWithPoints);
  }, [gameState, playersGame]);

  useEffect(() => {
    if (!gameState || !user || !user.userId) {
      return;
    }

    // Show opponents cards if 2 players
    if (gameState.allGamePlayers.length === 2) {
      const cardsOpponents = gameState.gameUsersWithCards.filter(
        (userCards: any) => userCards.userId !== user.userId
      )[0]?.cards;

      if (!cardsOpponents) {
        return;
      }

      const cardsOpponentsFormatted = cardsOpponents.map((card: any) => {
        if (!card.suit) {
          return { value: "unknown", suit: "spades" };
        }
        return getCard(card.suit, card.value, card);
      });
      setOpponentsCards(cardsOpponentsFormatted);
    }
  }, [gameState, user]);

  return (
    <header {...props} style={{ zIndex: 3800, height: 70 }}>
      <div
        css={(theme) => [
          {
            borderRadius: theme.spacing(1),
            display: "flex",
            alignItems: "center",
            position: "relative",
            zIndex: 3800,
            marginLeft: 10,
          },
          palette === "gradient"
            ? {
                background: theme.colors.gradient,
              }
            : {
                background: "transparent",
                color: theme.colors.text_subtitle_light,
              },
        ]}
      >
        <div
          css={{
            flexGrow: 1,
            position: "relative",
            marginTop: "0px",
            fontSize: "30px",
            zIndex: 3800,
            height: 70,
          }}
        >
          <LogoMenu logo={null} />
        </div>

        <div
          css={(theme) => ({
            transition: theme.transitions.normal("top"),
            textAlign: "center",
            position: "absolute",
            left: "50%",
            top: "92%",
            transform: "translate(-50%, -50%) scale(0.68, 0.68)",
            transformOrigin: "top",
            height: 70,
            visibility: "hidden",
          })}
        >
          <GameInventory isOpponentsCards={true} cards={opponentsCards} />
        </div>

        <PlayerQueue
          currentPlayerWithPoints={currentPlayerWithPoints}
          loadingDelayed={loadingDelayed}
          playersWithPoints={playersWithPoints}
        />
      </div>
    </header>
  );
};

export default GameHeader;
