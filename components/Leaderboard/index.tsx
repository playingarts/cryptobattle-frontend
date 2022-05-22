import { FC, HTMLAttributes } from "react";

import {Modal} from "../Modal";

export type Props = HTMLAttributes<HTMLDivElement>;

const Leaderboard: FC<Props> = ({ children, ...props }) => {
  return (
    <div
      {...props}
      css={(theme) => ({
        minWidth: "200px",
        color: theme.colors.text_title_light,
      })}
    >
      <Modal
        trigger={children}
        description="Share your game link, wait for players to connect and click “Start”!
        Choose the NFTs you want to level up (optional)."
        title="Leaderboard"
      ></Modal>
    </div>
  );
};

export default Leaderboard;
