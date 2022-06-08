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
  loading?: boolean;
}

const GameHeader: FC<Props> = ({
  palette,
  loading,
  ...props
}) => {
  const { loggedIn, user } = useAuth();
  const { gameState, players } = useGame();
  const [playersWithPoints, setPlayersWithPoints] = useState<Array<any>>([]);
  const [currentPlayer, setCurrentPlayer] = useState<any>("");
  const [opponentsCards, setOpponentsCards] = useState<Array<any>>([]);
  const [loadingDelayed, setLoadingDelayed] = useState(true);
  
  useEffect(() => {
    setTimeout(() => {
      setLoadingDelayed(false)

    }, 0);
  }, [loading]);


  useEffect(() => {
    if (!gameState) {
      return;
    }

    const currentPlayer =  players.find((player: any) => player.userId === gameState.turnForPlayer)

    const shiftArray = (arr: any, target: any) => {
      return arr.concat(arr.splice(0, arr.indexOf(target)));
    }

    const playersWithPoints = [...players].map((player: any) => {
      player.points = gameState.playersCurrentPoints[player.userId]
        ? gameState.playersCurrentPoints[player.userId]
        : 0;

      return { ...player };
    });

    const currentPlayerWithPoints = playersWithPoints.find((player: any) => player.userId === gameState.turnForPlayer)

    const playersSorted = shiftArray(playersWithPoints, currentPlayerWithPoints)


    setPlayersWithPoints(playersSorted);

    setCurrentPlayer(
      currentPlayer
    );
  }, [gameState, players]);

  useEffect(() => {
    if (!gameState || !user || !user.userId) {
      return;
    }

    // Show opponents cards if 2 players
    if (gameState.allGamePlayers.length === 2) {
      const cardsOpponents = gameState.gameUsersWithCards.filter(
        (userCards: any) => userCards.userId !== user.userId
      )[0].cards;

      const cardsOpponentsFormatted = cardsOpponents.map((card: any) => {
        return getCard(card.suit, card.value, card);
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
        

        <div css={{display: 'flex', justifyContent: 'space-between', minWidth: 180}}>
        {loggedIn &&
          user &&
          playersWithPoints.map((player: any) => {
            return (
              <div
                className="game-player"
                key={player.userId}
                css={{
                  position: "relative",
                  borderRadius: 9999,
                  cursor: 'default',
                  opacity: loadingDelayed ? '0' : '1',
                  transform: loadingDelayed ?  'translate(1500px, 0)' : 'translate(0, 0)' ,
                  "&::after": {
                    opacity: 0,
                    content: `'${player.points}'`,
                    display: "flex",
                    lineHeight: 3,
                    transition: 'all 400ms',
                    borderRadius: 9999,
                    outline: "6px solid" + player.color,
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 60,
                    fontFamily: 'Aldrich',
                    position: "absolute",
                    color: "#fff",
                    background: player.color,
                    zIndex: 9999,
                    bottom: 0,
                
                    top: 0,
                    left: 0,
                    right: 0,
                    pointerEvents: 'none',

                  },
                  "&::before": {
                    opacity: 0,
                    content: `'${player.username}'`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: 'all 400ms',
                    color: "black",
                    fontFamily: 'Aldrich',
                    position: "absolute",
                    background: "#ffff",
                    borderRadius: 6,
                    lineHeight: 3,

          
                    fontSize: 18,
                    zIndex: 9999,
                    bottom: -40,
                    left: "50%",
                    transform: "translate(-50%, 0)",
                    padding: "12px 14px",
                    paddingTop: 16,
                    minWidth: 70,
                    height: 30,
                    pointerEvents: 'none',
                    textTransform: 'uppercase'
                  },
                  "&:hover": {
                    "&::after": {
                      opacity: 1,
                      fontSize: 42,
                      pointerEvents: 'none',
                      paddingTop: 10,
                    },
                    "&::before": {
                      opacity: 1,
                      pointerEvents: 'none',
                      transform: "translate(-50%, 8px)",

                    },
                  },
                }}
              >
                <UserAvatar
                  css={{
                    outline: "6px solid" + player.color,
                    zIndex: 999999,
                    "&:hover": {
                      background: player.color,
        
                    },
                  }}
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
      </div>
    </header>
  );
};

export default GameHeader;
