import { ElementType } from "react";
import StatBlock from "../StatBlock";

interface PlayerType {
  userId: string;
  state: string;
}

import Player from "../Player";

import PlayerEmpty from "../PlayerEmpty";

const Lobby: ElementType = ({ ...props }) => {
  const { players } = props;


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
        {players.map((player: PlayerType) => (
          <Player player={player} key={player.userId} />
        ))}

        {Array(10 - players.length)
          .fill(0)
          .map((_, i) => (
            <PlayerEmpty key={i} />
          ))}
      </div>
    </StatBlock>
  );
};

export default Lobby;
