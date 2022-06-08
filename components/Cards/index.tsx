import Spades from "../Icons/Spades";
import Clubs from "../Icons/Clubs";
import Diamonds from "../Icons/Diamonds";
import Hearts from "../Icons/Hearts";
import Joker from "../Icons/Joker";
import QuestionMark from "../Icons/QuestionMark";

import { v4 as uuid } from 'uuid';

import cards from "./cards.json";

const getSuit = (value: string, suit: string) => {

  if (value === "joker") {
    return Joker;
  }

  if (value === "unknown") {
    return QuestionMark;
  }

  if (suit === "hearts") {
    return Hearts;
  }
  if (suit === "spades") {
    return Spades;
  }
  if (suit === "diamonds") {
    return Diamonds;
  }
  if (suit === "clubs") {
    return Clubs;
  }
  return QuestionMark;
};

const getCard = (suit: string, value: string, card:any) => {
  if (!suit) {
    throw Error ('no suit = getCard')
  }
  if (!value) {
    throw Error ('no value = getCard')
  }
  const foundCard: any = cards.find(card => {
    if (!value) {
      return false
    }

    const isSuitFound =  suit ? suit?.toLowerCase() === card.suit?.toLowerCase() : true;
    const isValueFound =  value == card.value 
    return isSuitFound && isValueFound
  })

  if (!foundCard) {
    return null

  }
  foundCard.Icon = getSuit(value, suit);
  foundCard.uid = uuid()


  return {...foundCard, ...card}

};



export {
  getCard
};
