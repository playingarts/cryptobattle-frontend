import { NextPage } from "next";
import Layout from "../../components/Layout";

import GameLayout from "../../components/GameLayout";
import GameBoard from "../../components/GameBoard";
import GameInventory from "../../components/GameInventory";
import { getCard } from "../../components/Cards";
import { useGame } from "../../components/GameProvider";

import { useState, useEffect } from "react";
const Play: NextPage = () => {
  const [selectedCard, setSelectedCard] = useState("");

  const [myCards, setMyCards] = useState<Array<any>>([]);

  const {gameState} = useGame()

  useEffect(() => {
    if (!gameState) {
      return
    }
    const cards = gameState.gameUsersWithCards[0].cards

    if (!cards) {
      return
    }

    const cardsFormatted = cards.map((card: any) => {
      return getCard(card.suit, card.value);
    });

    setMyCards(cardsFormatted);
  }, []);

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
          removeCard={(cardToRemove: any) =>
            setMyCards(myCards.filter((card:any) => card.id !== cardToRemove.id))
          }
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
