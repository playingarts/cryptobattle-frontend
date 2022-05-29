import Spades from "../Icons/Spades";
import Clubs from "../Icons/Clubs";
import Diamonds from "../Icons/Diamonds";
import Hearts from "../Icons/Hearts";
import Joker from "../Icons/Joker";
import { v4 as uuid } from 'uuid';

import cards from "./cards.json";

const getSuit = (suit: string) => {

  if (suit === "hearts") {
    return Hearts;
  }
  if (suit === "spades") {
    return Spades;
  }
  if (suit === "diamonds") {
    return Diamonds;
  }
  if (suit === "joker") {
    return Joker;
  }

  if (suit === "clubs") {
    return Clubs;
  }
  return Joker;
};

const getCard = (suit: string, value: string) => {
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
    console.log(suit, value)
    return null
      // throw Error ('Card not found in getCard')
  }
  foundCard.Icon = getSuit(suit);
  foundCard.id = uuid()

  // console.log(foundCard);

  // console.log(suit,value)
  return foundCard

//   return {
//     id: value,
//     suit: suit
//   };
};



export {
  getCard
};
