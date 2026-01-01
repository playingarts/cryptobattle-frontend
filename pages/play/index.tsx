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
import { useNotifications } from "../../components/NotificationProvider";
import { useState, useEffect } from "react";
import Warning from "../../components/Icons/Warning";
const Play: NextPage = () => {
  const WSProvider = useWS();
  const { user } = useAuth();
  const [minWidth, setMinWidth] = useState(1400);
  const [loading, setLoading] = useState(true);

  const [myCards, setMyCards] = useState<Array<any>>([]);
  const { openNotification } = useNotifications();

  // Use reducer state for game data
  const { state, isBackendReady, isAlreadyConnected } = useGame();
  const gameState = state.serverState; // Derive gameState from reducer

  // Request game info when backend is ready and game exists
  // Note: Room/game creation is handled by /new?quickstart=true flow
  // This page should only be reached after game is started
  useEffect(() => {
    if (!isBackendReady) {
      return;
    }

    // Request game and room info
    WSProvider.send(JSON.stringify({ event: "game-info", data: {} }));
    WSProvider.send(JSON.stringify({ event: "room-info", data: {} }));
  }, [isBackendReady]);

  useEffect(() => {
    if (!gameState?.gameId) {
      return;
    }

    setMinWidth(7 * 250);
  }, [gameState?.gameId]);

  useEffect(() => {
    if (!isAlreadyConnected) {
      return;
    }
    openNotification({
      title: "Already connected!",
      description: (
        <span>
          You are already in a lobby or a game in an another browser or tab.
        </span>
      ),
      dark: false,
      icon: <Warning />,
      iconColor: "#FF6F41",
    });
  }, [isAlreadyConnected]);

  useEffect(() => {
    if (!gameState?.gameId || !user || !user.userId) {
      return;
    }

    // Show game board as soon as data is ready
    setLoading(false);

    // Find current user's cards from gameUsersWithCards array
    const userWithCards = gameState.gameUsersWithCards?.find(
      (userCards: any) => userCards.userId === user.userId
    );
    const cards = userWithCards?.cards;

    if (!cards) {
      return;
    }

    const cardsFormatted = cards.map((card: any) => {
      return getCard(card.suit, card.value, card);
    });

    setMyCards(cardsFormatted);
  }, [gameState?.gameId, gameState?.gameUsersWithCards, user]);

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
    <GameLayout loading={loading}>
      <Layout
        css={(theme) => ({
          background: "transparent",
          color: theme.colors.text_title_light,
          backgroundColor: "transparent",
          backgroundSize: "cover",
          minHeight: "100vh",
          padding: "20px 50px",
          minWidth,
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
      <GameInventory loading={loading} cards={myCards}></GameInventory>
    </GameLayout>
  );
};

export default Play;
