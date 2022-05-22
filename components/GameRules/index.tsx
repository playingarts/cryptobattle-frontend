import { FC, HTMLAttributes } from "react";

import { Modal } from "../Modal";

export type Props = HTMLAttributes<HTMLDivElement>;

const GameRules: FC<Props> = ({ children, ...props }) => {
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
        title="Game Rules"
        css={() => ({
          minHeight: "4000px",
        })}
      ></Modal>
    </div>
  );
};

export default GameRules;
