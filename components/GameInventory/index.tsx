import { FC, useState, useCallback, HTMLAttributes } from "react";
import CardSmall from "../../components/CardSmall";
import { CardSuits } from "../../source/enums";

interface Card {
  id?: string;
  Icon: FC<HTMLAttributes<SVGElement>>;
  cardValue: string;
  suit?: CardSuits;
}



interface Props {
  selectedCard?: string;
  cards: Card[];
  onChange: (cardId: string) => void;
}

const GameInventory: FC<Props> = ({ children, cards, ...props }) => {
  const [selectedCardId, setSelectedCardId] = useState(null);

  // const selectCard = useCallback((cardId) =>  setSelectedCardId(cardId), []);

  const selectCard = useCallback(
    (cardId) => () => {
      if (selectedCardId === cardId) {
        console.log("happens");
        setSelectedCardId(null);
        return;
      }
      props.onChange ? props.onChange(cardId) : null;
      setSelectedCardId(cardId);
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
        {cards.map((card) => {
          return (
            <CardSmall
              onClick={selectCard(card.id)}
              key={card.id}
              isSelected={selectedCardId ? selectedCardId === card.id : false}
              style={{ marginRight: "10px" }}
              {...card}
            />
          );
        })}
      </div>

      {children}
    </div>
  );
};

export default GameInventory;
