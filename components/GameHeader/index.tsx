import { FC, HTMLAttributes, useEffect, useState } from "react";

import { useAuth } from "../AuthProvider";
import { useGame } from "../GameProvider";

import Text from "../Text";
import LogoMenu from "../LogoMenu";
import UserAvatar from "../UserAvatar";

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
  // const { deck } = useDeck({ variables: { slug: deckId } });

  // const [expanded, setExpanded] = useState(true);
  // const [hovered, setHovered] = useState(false);
  // const mouseEnter = () => setHovered(true);
  // const mouseLeave = () => setHovered(false);
  //   const [players, setPlayers] = useState([user]);

  const { loggedIn, user } = useAuth();
  const { gameState } = useGame();
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("");

  useEffect(() => {
    if (!gameState) {
      return;
    }

    const players: any = [user, ...gameState.opponentPlayers];

    console.log(players, "players");
    setPlayers(players);

    setCurrentPlayer(gameState.turnForPlayer);
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
            overflow: "hidden",
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
                  {currentPlayer}
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
        {loggedIn &&
          user &&
          players.map((player: any) => {
            return (
              <UserAvatar
                key={player.username}
                css={{
                  transition: "opacity 800ms",
                  "&:hover": {
                    opacity: 0.4,
                  },
                }}
                profilePictureUrl={
                  player.profilePictureUrl
                    ? player.profilePictureUrl
                    : player.profileImageUrl
                }
              />
            );
          })}
      </div>
    </header>
  );
};

export default GameHeader;
