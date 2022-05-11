import Spades from "../Icons/Spades";
import Clubs from "../Icons/Clubs";
import Diamonds from "../Icons/Diamonds";
import Hearts from "../Icons/Hearts";
import { CardSuits } from "../../source/enums";

const CardKH = {
  id: "CardKH",
  cardValue: "k",
  suit: CardSuits.h,
  Icon: Hearts,
};

const CardQC = {
  id: "CardQC",
  cardValue: "q",
  suit: CardSuits.c,
  Icon: Clubs,
};

const Card2H = {
  id: "Card2H",
  cardValue: "2",
  suit: CardSuits.h,
  Icon: Hearts,
};

const Card10S = {
  id: "Card10S",
  cardValue: "10",
  suit: CardSuits.s,
  Icon: Spades,
};

const CardJD = {
  id: "CardJD",
  cardValue: "J",
  suit: CardSuits.s,
  Icon: Diamonds,
};


const Card8H = {
  id: "Card8H",
  cardValue: "8",
  suit: CardSuits.h,
  Icon: Hearts,
};

const CardAS = {
  id: "CardAS",
  cardValue: "A",
  suit: CardSuits.s,
  Icon: Spades,
};

const CardKD = {
  id: "CardKD",
  cardValue: "K",
  suit: CardSuits.d,
  Icon: Diamonds,
};

const Card6D = {
  id: "Card6D",
  cardValue: "6",
  suit: CardSuits.d,
  Icon: Diamonds,
};

const Card4C = {
  id: "Card4C",
  cardValue: "4",
  suit: CardSuits.c,
  Icon: Clubs,
};


export {CardKH, CardQC, Card2H, Card10S, CardJD, Card8H, CardAS, CardKD, Card4C, Card6D}
