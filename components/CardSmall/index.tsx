import { FC, HTMLAttributes } from "react";
import { CardSuits } from "../../source/enums";
import QuestionMark from "../Icons/QuestionMark";
import Spades from "../Icons/Spades";
import Hearts from "../Icons/Hearts";
import Clubs from "../Icons/Clubs";
import Diamonds from "../Icons/Diamonds";
import { keyframes, Interpolation, Theme } from "@emotion/react";

interface Props extends HTMLAttributes<HTMLElement> {
  Icon?: FC<HTMLAttributes<SVGElement>>;
  cardValue: string;
  suit?: CardSuits | string;
  isSelected: boolean;
  background?: string;
  color?: string;
  powerLevel?: string;
  scoringLevel?: string;
  disableHover?: boolean;
  css?: Interpolation<Theme>;
}

// Get SVG suit icon component
const getSuitIcon = (suit?: CardSuits | string): FC<HTMLAttributes<SVGElement>> | null => {
  if (!suit) {
    return null;
  }
  switch (suit) {
    case "spades":
    case CardSuits.s:
      return Spades;
    case "hearts":
    case CardSuits.h:
      return Hearts;
    case "clubs":
    case CardSuits.c:
      return Clubs;
    case "diamonds":
    case CardSuits.d:
      return Diamonds;
    default:
      return null;
  }
};


// Joker glow animation
const jokerGlow = keyframes`
  0% {
    background-position: 0% 50%;
    box-shadow: 0 4px 20px rgba(167, 139, 250, 0.5), 0 0 30px rgba(236, 72, 153, 0.3);
  }
  25% {
    background-position: 50% 50%;
    box-shadow: 0 4px 20px rgba(236, 72, 153, 0.6), 0 0 35px rgba(245, 158, 11, 0.4);
  }
  50% {
    background-position: 100% 50%;
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.5), 0 0 30px rgba(236, 72, 153, 0.3);
  }
  75% {
    background-position: 50% 50%;
    box-shadow: 0 4px 20px rgba(236, 72, 153, 0.6), 0 0 35px rgba(167, 139, 250, 0.4);
  }
  100% {
    background-position: 0% 50%;
    box-shadow: 0 4px 20px rgba(167, 139, 250, 0.5), 0 0 30px rgba(236, 72, 153, 0.3);
  }
`;

// Helper to get the display value for a card
const getDisplayValue = (value: string): string => {
  if (!value) {
    return "";
  }
  if (value === "joker") {
    return "JOKER";
  }
  if (value === "unknown") {
    return "";
  }
  const num = Number(value);
  if (!isNaN(num)) {
    return String(num);
  }
  return value[0].toUpperCase();
};

// Get background style based on card value
const getCardBackground = (value: string): string => {
  if (value === "joker") {
    return "linear-gradient(270deg, #a78bfa, #ec4899, #f59e0b, #ec4899, #a78bfa)";
  }
  return "#1a1a1a";
};

// Get box-shadow based on card value
const getCardShadow = (): string => {
  return "0 2px 8px rgba(0, 0, 0, 0.3)";
};

const CardSmall: FC<Props> = ({
  cardValue,
  suit,
  isSelected,
  disableHover,
  className,
  css: cssProp,
  ...props
}) => {
  const displayValue = getDisplayValue(cardValue);
  const isJoker = cardValue === "joker";
  const isUnknown = cardValue === "unknown";
  const SuitIcon = getSuitIcon(suit);

  return (
    <div
      className={className}
      css={[
        {
          width: 60,
          height: 87,
          borderRadius: 8,
          cursor: "grab",
          marginRight: 7,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: getCardBackground(cardValue),
          backgroundSize: isJoker ? "400% 400%" : undefined,
          animation: isJoker ? `${jokerGlow} 8s ease-in-out infinite` : undefined,
          border: "none",
          boxShadow: isSelected
            ? "0 8px 20px rgba(0, 0, 0, 0.5)"
            : isJoker
              ? "0 4px 20px rgba(167, 139, 250, 0.5), 0 0 30px rgba(236, 72, 153, 0.3)"
              : getCardShadow(),
          flexShrink: 0,
          transform: isSelected ? "translateY(-8px)" : "translateY(0)",
          transition: "box-shadow 0.2s ease",
          "&:not(:active)": {
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          },
          "&:active": {
            cursor: disableHover ? "default" : "grabbing",
          },
          "&:hover": disableHover
            ? {}
            : {
                transform: "translateY(-8px)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.5)",
              },
        },
        cssProp,
      ]}
      {...props}
    >
      {isUnknown ? (
        <QuestionMark css={{ transform: "scale(1.2)" }} />
      ) : (
        <>
          <span
            css={{
              fontSize: isJoker ? 12 : 28,
              fontWeight: "bold",
              color: "white",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            {displayValue}
          </span>
          {!isJoker && SuitIcon && (
            <SuitIcon
              css={{
                width: 22,
                height: 20,
                color: "white",
                marginTop: 5,
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CardSmall;
