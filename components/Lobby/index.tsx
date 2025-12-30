import { FC, HTMLAttributes } from "react";
import StatBlock from "../StatBlock";

export type Props = HTMLAttributes<HTMLDivElement>;
interface Stats extends Props {
  isAdmin: boolean;
  players: Array<PlayerType>;
}

interface PlayerType {
  userId: string;
  state?: string;
  color?: string;
}

import Player from "../Player";

import PlayerEmpty from "../PlayerEmpty";

const Lobby: FC<Stats> = ({ isAdmin, players }) => {
  return (
    <StatBlock
      css={() => ({
        background: `#181818`,
        backgroundSize: "85%",
        color: "rgba(255, 255, 255, 0.5)",
        position: "relative",
        margin: "20px 0",
      })}
      title="players (min 2 / max 10)"
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

        {players  && players.length < 4 && 
          Array(4 - players.length)
            .fill(0)
            .map((_, i) => <PlayerEmpty key={i} />)}
      </div>
    </StatBlock>
  );
};

export default Lobby;
