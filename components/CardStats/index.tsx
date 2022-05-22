import { FC, HTMLAttributes } from "react";

import Line from "../Line";
import Text from "../Text";

export type Props = HTMLAttributes<HTMLDivElement>;
interface CardStats extends Props {
  xp: number |undefined,
  power: number |undefined,
  scoring: number |undefined,
  color: "light" | "dark"
}

const CardStats: FC<CardStats> = ({ color, xp, power, scoring, ...props }) => {
  return (
    <div
      {...props}
      css={() => ({
        minWidth: 120,
        maxWidth: 120,
        color: color === 'light' ? '#fff' : '#000'
      })}
    >
    <Line />
      <Text variant="body" css={{ opacity: 0.9, margin: 0 }}>
        {xp}
      </Text>
      <Line />
      <Text variant="body" css={{ opacity: 0.9, margin: 0 }}>
        {power}
      </Text>
      <Line />
      <Text variant="body" css={{ opacity: 0.5, margin: 0 }}>
        {scoring}
      </Text>{" "}
      <Line />
    </div>
  );
};

export default CardStats;
