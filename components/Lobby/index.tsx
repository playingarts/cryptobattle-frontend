import { FC, HTMLAttributes, useState, useEffect } from "react";
import StatBlock from "../StatBlock";
import Text from "../Text";
import { CSSObject } from "@emotion/serialize";

export type Props = HTMLAttributes<HTMLDivElement>;
interface Stats extends Props {
  isAdmin: boolean;
  players: Array<PlayerType>;
  roomid?: string | string[];
}

interface PlayerType {
  userId: string;
  state?: string;
  color?: string;
}

import Player from "../Player";

const Lobby: FC<Stats> = ({ isAdmin, players, roomid }) => {
  const [isCopied, setCopied] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");
  const [hovered, setHover] = useState(false);

  useEffect(() => {
    if (roomid) {
      setRoomUrl(`https://play2.playingarts.com/join/${roomid}`);
    }
  }, [roomid]);

  useEffect(() => {
    if (!hovered) {
      setTimeout(() => {
        setCopied(false);
      }, 500);
    }
  }, [hovered]);

  const copy = () => {
    setCopied(true);
    navigator.clipboard.writeText(roomUrl);
  };

  return (
    <StatBlock
      css={() => ({
        background: `#181818`,
        backgroundSize: "85%",
        color: "rgba(255, 255, 255, 0.5)",
        position: "relative",
        margin: "20px 0",
      })}
      title=""
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {players &&
          players.map((player: PlayerType) => (
            <Player
              color={player.color}
              isAdmin={isAdmin}
              player={player}
              key={player.userId}
            />
          ))}

      </div>

      {/* Game link section */}
      {roomid && (
        <div css={{ marginTop: 30, position: 'relative' }}>
          <input
            disabled
            defaultValue={roomUrl}
            css={(theme) => ({
              ...(theme.typography.body2 as CSSObject),
              paddingLeft: theme.spacing(2),
              height: theme.spacing(8),
              flexGrow: 1,
              fontSize: 19.5,
              borderRadius: "10px",
              width: "100%",
              border: "3px solid rgba(255, 255, 255, 0.05)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "rgba(255, 255, 255, 0.5)",
            })}
          />
          <Text
            css={{
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.25)",
              fontSize: 15,
              marginTop: 15,
            }}
          >
            {isAdmin ? (
              <span>
                Share game link with your friends and wait for them to connect.
              </span>
            ) : (
              "Share this link if you want to invite more players!"
            )}
          </Text>
          {/* Copy button */}
          <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={copy}
            css={{
              position: "absolute",
              right: 10,
              top: 15,
              width: 50,
              height: 50,
              borderRadius: 5000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#E8E8E8",
              cursor: "pointer",
              transition: "all 400ms",
              "&::before": {
                opacity: 0,
                content: isCopied ? `"Copied"` : `"Copy"`,
                display: "flex",
                background: "#fff",
                justifyContent: "center",
                alignItems: "center",
                transition: "all  400ms",
                color: "#404040",
                position: "absolute",
                borderRadius: 20,
                fontSize: 14,
                zIndex: 9999,
                top: -62,
                left: "50%",
                transform: "translate(-50%, 0)",
                padding: "12px 15px 9px",
                height: 30,
                pointerEvents: "none",
                textTransform: "uppercase",
              },
              "&:hover": {
                color: "#7B61FF",
                background: "#cfcfcf",

                "&::before": {
                  opacity: 1,
                  pointerEvents: "none",
                  transform: "translate(-50%, 8px)",
                },
              },
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </StatBlock>
  );
};

export default Lobby;
