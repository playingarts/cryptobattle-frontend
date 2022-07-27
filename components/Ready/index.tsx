import { FC, HTMLAttributes } from "react";
import StatBlock from "../StatBlock";

import Text from "../Text";

export type Props = HTMLAttributes<HTMLDivElement>;
interface Ready extends Props {
  readyButton?: any;
}

const Ready: FC<Ready> = ({ readyButton }) => {
  return (
    <div>
      <StatBlock
        css={(theme) => ({
          background: `#181818`,
          backgroundSize: "85%",
          color: theme.colors.text_title_light,
          position: "relative",
          margin: "20px 0",
          textAlign: "center",
        })}
      >
        <Text css={{ fontSize: 22, color: "rgba(255, 255, 255, 0.5)", marginBottom: -1}}>
          Are you ready to play?
        </Text>

        {readyButton}
      </StatBlock>
    </div>
  );
};

export default Ready;
