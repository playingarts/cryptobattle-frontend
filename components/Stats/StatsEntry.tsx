import { FC, HTMLAttributes } from "react";

import Line from "../Line";
import Text from "../Text";


export type Props = HTMLAttributes<HTMLDivElement>;
interface Stats extends Props {
    number:  number,
    title: string
  }

const StatsEntry: FC<Stats> = ({number, title, ...props }) => {
  return (
    <div
      {...props}
      css={(theme) => ({
        minWidth: "200px",
        color: theme.colors.text_title_light,
      })}
    >
      <Text variant="h2" css={{ opacity: 0.9, margin: 0}}>
        {number}
      </Text>
      <Text variant="h6" css={{ opacity: 0.5, margin: 0 }}>
        {title}
      </Text>{" "}
      <Line />
    </div>
  );
};

export default StatsEntry;
