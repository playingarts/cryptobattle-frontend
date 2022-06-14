import { FC, HTMLAttributes } from "react";
import { CardSuits } from "../../source/enums";
import Text from "../Text";
import QuestionMark from "../Icons/QuestionMark";

interface Props extends HTMLAttributes<HTMLElement> {
  Icon: FC<HTMLAttributes<SVGElement>>;
  cardValue: string;
  suit?: CardSuits;
  isSelected: boolean;
  background?: string;
  color?: string;
  powerLevel?: string;
  scoringLevel?: string;
}

const CardSmall: FC<Props> = ({
  Icon,
  cardValue,
  color,
  isSelected,
  background,
  powerLevel,
scoringLevel,
  ...props
}) => (
  <div
    css={{
      display: "inline-block",
      position: "relative",
    }}
    powerlevel={powerLevel}
    scroinglevel={scoringLevel}
    {...props}
  >
    <div
      css={(theme) => ({
        color: color ? color : "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.5),
        borderRadius: theme.spacing(1),
        background: background ? background : "#0C0E11",
        height: theme.spacing(9),
        width: theme.spacing(6.5),
        position: "relative",
        zIndex: 1,
        transition: "transform 400ms",

        "&:hover": {
     
          transform: "translate(0, -10px)",
          cursor: "grab",
        },
        transform: isSelected ? "translate(0, -10px)" : "",
      })}
    >
      {cardValue !== "joker" && cardValue !== "unknown" && (
        <Text component="div" variant="h4" css={{ textTransform: "uppercase" }}>
          {Number(cardValue) || cardValue[0]}
        </Text>
      )}

      {cardValue === "unknown" ? (
        <QuestionMark css={{ margin: "auto", transform: 'scale(1.2, 1.2)' }} />
      ) : (
        <Icon css={{ margin: "auto"}} />
      )}
    </div>
  </div>
);

export default CardSmall;
