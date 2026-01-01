import { FC, useState, useEffect, useCallback, HTMLAttributes } from "react";
import CardSmall from "../../components/CardSmall";
import { CardSuits } from "../../source/enums";
import Button from "../../components/Button";
import Skip from "../../components/Icons/Skip";
import { useWS } from "../WsProvider";
import { useGame } from "../GameProvider";
import { useAuth } from "../AuthProvider";

interface Card {
  id?: string;
  Icon: FC<HTMLAttributes<SVGElement>>;
  value: string;
  suit?: CardSuits;
}

interface Props {
  selectedCard?: string;
  cards: Card[];
  isOpponentsCards?: boolean;
  loading?: boolean;
  onChange?: (cardId: string) => void;
}

const GameInventory: FC<Props> = ({
  children,
  loading,
  isOpponentsCards,
  cards,
}) => {
  const [cardsRegular, setCardsRegular] = useState<any>([]);
  const [cardsNft, setCardsNft] = useState<any>([]);
  const [loadingDelayed, setLoadingDelayed] = useState(true);

  const { state, selectedCard, setSelectedCard } = useGame();
  const { user } = useAuth();

  const isMyTurn = state.serverState.turnForPlayer === user?.userId;

  const WSProvider = useWS();

  const skip = () => {
    WSProvider.send(
      JSON.stringify({
        event: "play-card",
        data: {
          action: "pass",
        },
      })
    );
  };

  const cardPriority: any = {
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 4,
    "6": 5,
    "7": 6,
    "8": 7,
    "9": 8,
    "10": 9,
    jack: 10,
    queen: 11,
    king: 12,
    ace: 13,
    joker: 14,
  };
  const suitPriority: any = { spades: 1, hearts: 2, clubs: 3, diamonds: 4 };

  const sortCards = (cards: any) => {
    cards.sort(
      (a: any, b: any) =>
        cardPriority[b.value] - cardPriority[a.value] ||
        suitPriority[a.suit] - suitPriority[b.suit]
    );

    return cards;
  };

  useEffect(() => {
    setTimeout(() => {
      setLoadingDelayed(false);
    }, 0);
  }, [loading]);

  useEffect(() => {
    const cardsNft = sortCards(
      cards.filter((card) => card.id || card.value === "unknown")
    );
    const cardsRegular = sortCards(
      cards.filter((card) => !card.id && card.value !== "unknown")
    );
    setCardsNft(cardsNft);
    setCardsRegular(cardsRegular);
  }, [cards]);

  const selectCard = useCallback(
    (card) => () => {
      setSelectedCard(card);
    },
    [setSelectedCard]
  );

  // Combine all cards for display
  const allCards = [...cardsRegular, ...cardsNft];

  return (
    <div
      className="game-inventory"
      css={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
        opacity: loadingDelayed ? 0 : 1,
        transform: loadingDelayed
          ? isOpponentsCards
            ? "translate(0, -200px)"
            : "translate(0, 200px)"
          : "translate(0, 0)",
        transition: "opacity 2s, transform 1s",
      }}
    >
      {/* Hand container */}
      <div
        css={{
          background: isMyTurn ? "#f5f5f5" : "#3a3a3a",
          borderRadius: 20,
          padding: "13px 7px 13px 13px",
          display: "inline-block",
          margin: "0 auto 20px auto",
          overflow: "visible",
          transition: "background 0.3s ease",
        }}
      >
        {/* Cards row */}
        <div
          css={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "nowrap",
            overflow: "visible",
          }}
        >
          {allCards.map((card: any, index: number) => (
            <CardSmall
              {...card}
              key={`${index}-${card.uid || card.value}`}
              className={isMyTurn && !isOpponentsCards ? "draggable" : undefined}
              onMouseDown={isMyTurn ? selectCard(card) : undefined}
              isSelected={selectedCard ? selectedCard.uid === card.uid : false}
              cardValue={isOpponentsCards && card.value === "unknown" ? "unknown" : card.value}
              disableHover={!isMyTurn || isOpponentsCards}
              css={{
                pointerEvents: isOpponentsCards ? "none" : "auto",
                cursor: !isOpponentsCards && isMyTurn ? "grab" : "default",
              }}
            />
          ))}
        </div>
      </div>

      {!isOpponentsCards && (
        <Button
          Icon={Skip}
          onClick={skip}
          css={{
            position: "fixed",
            bottom: 40,
            right: 40,
            borderRadius: 400,
            background: "#181818",
            color: !isMyTurn ? "#282828" : "white",
            height: 60,
            width: 60,
            transition: "all 400ms",
            pointerEvents: !isMyTurn ? "none" : "auto",
            "&::before": {
              opacity: 0,
              content: `"skip"`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transition: "all 400ms",
              color: "black",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              position: "absolute",
              background: "#ffff",
              borderRadius: 6,
              fontSize: 18,
              zIndex: 9999,
              top: -50,
              left: "50%",
              transform: "translate(-50%, 0)",
              padding: "12px 14px",
              paddingTop: 16,
              minWidth: 70,
              height: 30,
              pointerEvents: "none",
              textTransform: "uppercase",
            },
            "&:hover": {
              color: "#7B61FF",
              "&::before": {
                opacity: 1,
                pointerEvents: "none",
                transform: "translate(-50%, 8px)",
              },
            },
          }}
        />
      )}

      {children}
    </div>
  );
};

export default GameInventory;
