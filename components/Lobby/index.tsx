import { FC, HTMLAttributes } from "react";
import StatBlock from "../StatBlock";

export type Props = HTMLAttributes<HTMLDivElement>;
interface Stats extends Props {
    isAdmin:  boolean,
    players: Array<PlayerType>
  }


interface PlayerType {
  userId: string;
  state: string;
  color: string;
}

import Player from "../Player";



import PlayerEmpty from "../PlayerEmpty";

const Lobby: FC<Stats> = ({ isAdmin, players}) => {
  // const { players } = props;


  return (
    <StatBlock
      css={(theme) => ({
        background: `#181818`,
        backgroundSize: "85%",
        color: theme.colors.text_title_light,
        position: "relative",
        margin: "20px 0",
      })}
      title="players (min 2 / max 10)"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 1fr",
          gap: "20px",
        }}
      >
        {players.map((player: PlayerType, index) => (
          <Player color={player.color} isAdmin={isAdmin} player={player} key={player.userId} />
        ))}

        {Array(4 - players.length)
          .fill(0)
          .map((_, i) => (
            <PlayerEmpty key={i} />
          ))}
      </div>
    </StatBlock>
  );
};

export default Lobby;
