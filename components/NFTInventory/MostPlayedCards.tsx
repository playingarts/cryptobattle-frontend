import { FC, HTMLAttributes } from "react";

import Card from "../../components/CardNew";

// type Props = HTMLAttributes<HTMLElement>;
interface CardType {
    id: string;
    name: string;
    onSale: boolean;
    power: number;
    scoring: number;
    xp: number;
    suit: string;
    value: string;
    imageUrl: string;
  }

interface Props extends HTMLAttributes<HTMLDivElement> {
  topCards: Array<CardType>;
  addCard?: ((card: CardType) => void) | undefined 
}


const MostPlayedCards: FC<Props> = ({ topCards, addCard, ...props }) => {
  return (
    <div css={{ display: "flex", justifyContent: "start" }} {...props}>
      {topCards.map((card) => (
        <div    
        onClick={() => addCard && addCard(card)}
          style={{ width: "50%", display: "flex", alignItems: "center" }}
          key={card.id}
        >
          <Card
            css={{ marginRight: "20px", column: "span 3" }}
            animated={false}
            noInfo={true}
            card={{ img: card.imageUrl }}
          ></Card>

          <div>
            <div>XP</div>
            <div>{card.xp}</div>
          </div>
          <div>
            <div>Power</div>
            <div>{card.power}</div>
          </div>
          <div>
            <div>Scoring</div>
            <div>{card.scoring}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MostPlayedCards;
