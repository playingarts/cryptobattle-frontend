import { FC, useState, useEffect, useCallback, HTMLAttributes } from "react";
import CardSmall from "../../components/CardSmall";
import { CardSuits } from "../../source/enums";
import Button from "../../components/Button";
import Skip from "../../components/Icons/Skip";
import { useWS } from "../WsProvider";

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
  onChange?: (cardId: string) => void;
}

const GameInventory: FC<Props> = ({ children,  isOpponentsCards, cards, ...props }) => {
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [cardsRegular, setCardsRegular] = useState<any>([]);
  const [cardsNft, setCardsNft] = useState<any>([]);

  // const [cardsSorted, setSortedCards] = useState<any>([]);

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

  useEffect(() => {
    const cardsNft = cards.filter(card => !card.id)
    const cardsRegular = cards.filter(card => card.id)
    setCardsNft(cardsNft)
    setCardsRegular(cardsRegular)
  }, [cards])

  const selectCard = useCallback(
    (card) => () => {
      if (selectedCard === card) {
        setSelectedCard(null);
        return;
      }
      props.onChange ? props.onChange(card) : null;
      setSelectedCard(card);
    },
    []
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        background: "transparent",
        zIndex: 400,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "15px 15px",
          height: "100%",
          marginBottom: "10px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {cardsRegular.length > 0 &&
          cardsRegular.map((card: any, index: number) => {
            return (
              <CardSmall
                onClick={selectCard(card)}
                key={`${index}`}
                isSelected={selectedCard ? selectedCard.id === card.id : false}
                style={{ marginRight: "10px", pointerEvents:  !isOpponentsCards ? 'auto' : 'none' }}
                cardValue={card.value}
                {...card}
              />
            );
          })}
        {cardsNft.length > 0 &&
          cardsNft.map((card: any, index: number) => {
            return (
              <CardSmall
                onClick={selectCard(card)}
                key={`${index}`}
                isSelected={selectedCard ? selectedCard.id === card.id : false}
                style={{ marginRight: "10px", pointerEvents:  !isOpponentsCards ? 'auto' : 'none',}}
                background="purple"
                cardValue={card.value}
                {...card}
              />
            );
          })}
      </div>
      {!isOpponentsCards && (
        <Button
          Icon={Skip}
          onClick={skip}
          css={{
            marginLeft: 20,
            borderRadius: 400,
            background: "#181818",
            width: 60,
            height: 60,
          }}
        ></Button>
      )}

      {children}
    </div>
  );
};

export default GameInventory;
