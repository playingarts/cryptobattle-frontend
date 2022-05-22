import { FC, HTMLAttributes} from "react";

import Card from "../../components/CardNew";
import CardStats from "../CardStats";

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
  addCard?: any
}



const MostPlayedCards: FC<Props> = ({ topCards, addCard, ...props }) => {

  const handleClick = (card: CardType) => addCard && addCard(card)
  return (
    <div css={{ display: "flex", justifyContent: "start" }} {...props}>
      {topCards.map((card) => (
        <div
          onClick={handleClick(card)}
          style={{ width: "50%", display: "flex", alignItems: "center" }}
          key={card.id}
        >
          <Card
            css={{ marginRight: "20px", column: "span 3" }}
            animated={false}
            noInfo={true}
            card={{ img: card.imageUrl }}
          ></Card>

          <CardStats xp={card.xp} power={card.power} scoring={card.scoring} />

        </div>
      ))}
    </div>
  );
};

export default MostPlayedCards;
