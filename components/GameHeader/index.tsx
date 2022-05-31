import { FC, HTMLAttributes, useEffect, useState } from "react";

import { useAuth } from "../AuthProvider";
import { useGame } from "../GameProvider";

import Text from "../Text";
import LogoMenu from "../LogoMenu";
import UserAvatar from "../UserAvatar";
import GameInventory from "../GameInventory";
import { getCard } from "../../components/Cards";

export interface Props extends HTMLAttributes<HTMLElement> {
  palette?: "gradient";
  altNav?: JSX.Element;
  showAltNav?: boolean;
  noNav?: boolean;
  isCardPage?: boolean;
}

const GameHeader: FC<Props> = ({
  palette,

  ...props
}) => {


  const { loggedIn, user } = useAuth();
  const { gameState, players } = useGame();
  const [playersWithPoints, setPlayersWithPoints] = useState<Array<any>>([]);
  const [currentPlayer, setCurrentPlayer] = useState<any>("");
  const [opponentsCards, setOpponentsCards] = useState<Array<any>>([]);

  useEffect(() => {

    if (!gameState ) {
      console.log('!gameState')

      return;
    }

    const playersWithPoints = [...players].map((player: any) => {
      player.points = gameState.playersCurrentPoints[player.userId]
        ? gameState.playersCurrentPoints[player.userId]
        : 0;

      return { ...player };
    });

    const playersSorted = playersWithPoints.sort(
      (a: any, b: any) => b.points - a.points
    );

    setPlayersWithPoints(playersSorted);

    setCurrentPlayer(
      players.find((player: any) => player.userId === gameState.turnForPlayer)
    );
  }, [gameState, players]);

  useEffect(() => {
    if (!gameState || !user || !user.userId) {
      return;
    }

    // Show opponents cards if 2 players
    if (gameState.opponentPlayers.length === 1) {
      const cardsOpponents = gameState.gameUsersWithCards.filter(
        (userCards: any) => userCards.userId !== user.userId
      )[0].cards;

      const cardsOpponentsFormatted = cardsOpponents.map((card: any) => {
        return getCard(card.suit, card.value);
      });
      setOpponentsCards(cardsOpponentsFormatted);
    }
  }, [gameState, user]);

  return (
    <header {...props}>
      <div
        css={(theme) => [
          {
            borderRadius: theme.spacing(1),
            display: "flex",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
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
          }}
        >
          <LogoMenu
            logo={
              <div
                css={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minWidth: 180,
                }}
              >
                <Text
                  component="div"
                  css={{
                    opacity: 0.9,
                    marginRight: 14,
                    fontSize: 23,
                    color: "#fff",
                  }}
                >
                  {currentPlayer ? currentPlayer.username : ""}
                </Text>
                <svg
                  width="16"
                  height="14"
                  viewBox="0 0 16 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.95645e-08 7.15C8.61504e-08 6.59772 0.447715 6.15 1 6.15L12.2357 6.15L8.29278 2.20709C7.90225 1.81657 7.90225 1.1834 8.29278 0.792878C8.6833 0.402354 9.31647 0.402353 9.70699 0.792878L15.3638 6.44973C15.5562 6.64205 15.6538 6.89321 15.6567 7.14525C15.6619 7.40781 15.5643 7.67204 15.364 7.8724L9.70712 13.5293C9.3166 13.9198 8.68343 13.9198 8.29291 13.5293C7.90239 13.1387 7.90239 12.5056 8.29291 12.115L12.2579 8.15L1 8.15C0.447715 8.15 7.29786e-08 7.70229 7.95645e-08 7.15Z"
                    fill="#DDDDDD"
                  />
                </svg>
              </div>
            }
          ></LogoMenu>
        </div>

        <div
          css={(theme) => ({
            transition: theme.transitions.normal("top"),
            textAlign: "center",
            position: "absolute",
            left: "50%",
            top: "120%",
            transform: "translate(-50%, -50%) scale(0.8)",
          })}
        >
          <GameInventory isOpponentsCards={true} cards={opponentsCards} />
        </div>

        {loggedIn &&
          user &&
          playersWithPoints.map((player: any) => {
            return (
              <div
                key={player.userId}
                css={{
                  position: "relative",
                  transition: "opacity 800ms",
                  border: "10px solid" + player.color,
                  "&:hover": {
                    opacity: 0.9,
                    "&::before": {
                      content: `'${player.points}'`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      position: "absolute",
                      background: "#ffff",
                      borderRadius: 10,
                      zIndex: 9999,
                      bottom: -20,
                      width: 70,
                      height: 30,
                    },
                  },
                }}
              >
                <UserAvatar
                  profilePictureUrl={
                    player.profilePictureUrl
                      ? player.profilePictureUrl
                      : player.profileImageUrl
                  }
                />
              </div>
            );
          })}
      </div>
    </header>
  );
};

export default GameHeader;
