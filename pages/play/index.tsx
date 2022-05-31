import { NextPage } from "next";
import Layout from "../../components/Layout";

import GameLayout from "../../components/GameLayout";
import GameBoard from "../../components/GameBoard";
import GameInventory from "../../components/GameInventory";
import { getCard } from "../../components/Cards";
import { useGame } from "../../components/GameProvider";
import { useWS } from "../../components/WsProvider";
import { useAuth } from "../../components/AuthProvider";

import { useState, useEffect } from "react";
const Play: NextPage = () => {
  const [selectedCard, setSelectedCard] = useState("");
  const WSProvider = useWS();
  const { user } = useAuth();

  const [myCards, setMyCards] = useState<Array<any>>([]);

  const { gameState } = useGame();

  useEffect(() => {
    WSProvider.onopen = function () {
      WSProvider.send(
        JSON.stringify({
          event: "game-info",
          data: {},
        })
      );
      WSProvider.send(
        JSON.stringify({
          event: "room-info",
          data: {},
        })
      );
    };
  }, []);

  useEffect(() => {
    if (!gameState || !user || !user.userId) {
      return;
    }
    console.log(gameState.gameUsersWithCards);
    console.log(user.userId, "id");

    const cards = gameState.gameUsersWithCards.filter(
      (userCards: any) => userCards.userId === user.userId
    )[0].cards;


    if (!cards) {
      return;
    }

    const cardsFormatted = cards.map((card: any) => {
      return getCard(card.suit, card.value);
    });

    setMyCards(cardsFormatted);




  }, [gameState, user]);

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
            setMyCards(
              myCards.filter((card: any) => card.id !== cardToRemove.id)
            )
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
