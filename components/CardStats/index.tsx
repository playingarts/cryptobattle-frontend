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
        fontSize: 13,
        maxWidth: 120,
        color: color === 'light' ? '#fff' : '#000'
      })}
    >
    <Line />
      <Text variant="body" css={{ fontSize: 15, opacity: 0.9, margin: 0, display: 'flex', justifyContent: 'space-between'}}>
        <span>XP</span><span>{xp}</span>
      </Text>
      <Line />
      <Text variant="body" css={{fontSize: 15,  opacity: 0.9, margin: 0, display: 'flex', justifyContent: 'space-between' }}>
        <span>Power</span>{power} / 10
      </Text>
      <Line />
      <Text variant="body" css={{ fontSize: 15, opacity: 0.9, margin: 0, display: 'flex', justifyContent: 'space-between' }}>
        <span>Scoring</span>{scoring} / 10
      </Text>
      <Line />
    </div>
  );
};

export default CardStats;
