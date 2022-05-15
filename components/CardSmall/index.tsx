import { FC, HTMLAttributes } from "react";
import { CardSuits } from "../../source/enums";
import Text from "../Text";

interface Props extends HTMLAttributes<HTMLElement> {
  Icon: FC<HTMLAttributes<SVGElement>>;
  cardValue: string;
  suit?: CardSuits;
  isSelected: boolean;
}

const CardSmall: FC<Props> = ({
  Icon,
  cardValue,
  suit,
  isSelected,
  ...props
}) => (
  <div
    css={{
      display: "inline-block",
      position: "relative",
    }}
    {...props}
  >
    <div
      css={(theme) => ({
        color: new RegExp(`${CardSuits.s}|${CardSuits.c}|${CardSuits.b}`).test(
          suit as string
        )
          ? theme.colors.white
          : theme.colors.white,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.5),
        borderRadius: theme.spacing(1),
        background: "#0C0E11",
        height: theme.spacing(9),
        width: theme.spacing(6.5),
        position: "relative",
        zIndex: 1,
        "&:hover": {
          transform: "translate(0, -10px)",
          cursor: "grab"
        },
        transform: isSelected ? "translate(0, -10px)" : ''
      })}
    >
      {cardValue !== "joker" && (
        <Text component="div" variant="h4" css={{ textTransform: "uppercase" }}>
          {Number(cardValue) || cardValue[0]}
        </Text>
      )}

      <Icon css={{ margin: "auto" }} />
    </div>
  </div>
);

export default CardSmall;
