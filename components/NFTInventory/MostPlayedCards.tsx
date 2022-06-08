import { FC, HTMLAttributes} from "react";

import Card from "../../components/CardNew";
import CardStats from "../CardStats";

// type Props = HTMLAttributes<HTMLElement>;
interface CardType {
  id: string;
  uid: string;
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
  addCard?: any,
  color: "light" | "dark"
}



const MostPlayedCards: FC<Props> = ({color, topCards, addCard, ...props }) => {

  const handleClick = (card: CardType) => addCard && addCard(card)
  return (
    <div css={{ display: "flex", justifyContent: "start" }} {...props}>
      {topCards.map((card, index) => (
        <div
          onClick={handleClick(card)}
          style={{ width: "50%", display: "flex", alignItems: "center" }}
          key={index}
        >
          <Card
            css={{ marginRight: "20px" }}
            animated={false}
            card={{ img: card.imageUrl }}
          ></Card>

          <CardStats color={color} xp={card.xp} power={card.power} scoring={card.scoring} />

        </div>
      ))}
    </div>
  );
};

export default MostPlayedCards;
