import { NextPage } from "next";
import Layout from "../../components/Layout";
import Loader from "../../components/Loader";

import GameLayout from "../../components/GameLayout";
import GameBoard from "../../components/GameBoard";
import GameInventory from "../../components/GameInventory";
import { getCard } from "../../components/Cards";
import { useGame } from "../../components/GameProvider";
import { useWS } from "../../components/WsProvider";
import { useAuth } from "../../components/AuthProvider";

import { useState, useEffect } from "react";
const Play: NextPage = () => {
  const WSProvider = useWS();
  const { user } = useAuth();
  const [minWidth, setMinWidth] = useState(1400);
  const [loading, setLoading] = useState(true);

  const [myCards, setMyCards] = useState<Array<any>>([]);

  const { gameState } = useGame();

  useEffect(() => {
    console.log('play use effect')
    // WSProvider.onopen = function () {
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
    // };
  }, []);


  useEffect(() => {
    if (!gameState ) {
      return;
    }
    
    setMinWidth(7*250)

  }, [gameState]);


  useEffect(() => {
    if (!gameState || !user || !user.userId) {
      return;
    }

    // if (!gameState.gameUsersWitchCards) {
    //   return
    // }

    setTimeout(() => {
      setLoading(false)
    }, 1000);

    console.log(gameState.gameUsersWithCards);
    console.log(user.userId, "id");

    const cards = gameState.gameUsersWithCards.filter(
      (userCards: any) => userCards.userId === user.userId
    )[0].cards;


    if (!cards) {
      return;
    }

    const cardsFormatted = cards.map((card: any) => {
      return getCard(card.suit, card.value, card);
    });

    setMyCards(cardsFormatted);




  }, [gameState, user]);

  if (loading) {
    return (
      <div
        css={{
          height: "100vh",
          background: "#181818",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader
          css={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%) scale(2)",
            lineHeight: 1,
            color: "#fff",
          }}
        />
      </div>
    );
  }



  return (
    <GameLayout loading={loading}
    >
      <Layout
        css={(theme) => ({
          background: theme.colors.dark_gray,
          color: theme.colors.text_title_light,
          backgroundColor: "#0A0A0A",
          backgroundSize: "cover",
          minHeight: "100vh",
          padding: "20px 50px",
          minWidth
        })}
      >
        <GameBoard
          removeCard={(cardToRemove: any) =>
            setMyCards(
              myCards.filter((card: any) => card.uid !== cardToRemove.uid)
            )
          }
        ></GameBoard>
      </Layout>
      <GameInventory
        loading={loading}
        cards={myCards}
      ></GameInventory>
    </GameLayout>
  );
};

export default Play;
