import { NextPage } from "next";
import Layout from "../../components/Layout";

import GameLayout from "../../components/GameLayout";
import GameBoard from "../../components/GameBoard";
import GameInventory from "../../components/GameInventory";
import {CardKH, CardQC, Card2H, Card10S, CardJD, Card8H, CardAS, CardKD, Card4C, Card6D} from "../../components/Cards";

import { useState } from "react";
const Play: NextPage = () => {
  const [selectedCard, setSelectedCard] = useState('');
  const [myCards, setMyCards] = useState([CardKH, CardQC, Card2H, Card10S, CardJD, Card8H, CardAS, CardKD, Card4C, Card6D]);



  return (
    <GameLayout>
      <Layout
        css={(theme) => ({
          background: theme.colors.dark_gray,
          color: theme.colors.text_title_light,
          backgroundColor: "#0A0A0A",
          backgroundSize: "cover",
          minHeight: "100vh",
        })}
      >

        <GameBoard
          selectedCard={selectedCard}
          removeCard={(cardId) => setMyCards(myCards.filter(card => card.id !== cardId))}

        ></GameBoard>
  
      </Layout>
      <GameInventory
        onChange={(selectedCard) => setSelectedCard(selectedCard)}
        cards={myCards}
      ></GameInventory>
    </GameLayout>
  );
};

export default Play;
