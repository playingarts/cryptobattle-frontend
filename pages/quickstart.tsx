import { NextPage } from "next";
import { useWS } from "../components/WsProvider/index";
import { useEffect, useRef } from "react";
import { useGame } from "../components/GameProvider";
import Loader from "../components/Loader";
import { useRouter } from "next/router";
import { useNotifications } from "../components/NotificationProvider";
import Warning from "../components/Icons/Warning";
import { setNavigationLocked, setGameStarted } from "../utils/gameState";
import { resetGame } from "../store/gameActions";

/**
 * Quickstart page - creates a room, starts the game, and redirects to /play
 * Shows only a loader during the entire process
 */
const Quickstart: NextPage = () => {
  const { openNotification } = useNotifications();
  const { state, dispatch, isBackendReady, isAlreadyConnected } = useGame();
  const router = useRouter();
  const WSProvider = useWS();

  // Track if we've started the quickstart process
  const hasStarted = useRef(false);
  // Track the gameId we're creating to ignore old game events
  const expectedGameId = useRef<string | null>(null);

  // Get game state from reducer
  const gameState = state.serverState;

  // Lock navigation and reset state on mount
  useEffect(() => {
    console.log('[quickstart] Mounting - setting navigation lock and resetting state');
    setNavigationLocked(true);
    setGameStarted(false);

    // Reset reducer state to clear any old game data
    dispatch(resetGame());

    // Reset refs for fresh start
    hasStarted.current = false;
    expectedGameId.current = null;

    return () => {
      console.log('[quickstart] Unmounting - clearing navigation lock');
      setNavigationLocked(false);
    };
  }, [dispatch]);

  // Handle already connected warning
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
  }, [isAlreadyConnected, openNotification]);

  // Start the quickstart process when backend is ready
  useEffect(() => {
    if (!isBackendReady || hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    console.log('[quickstart] Backend ready, creating new game');

    // Quit any existing game first
    WSProvider.send(JSON.stringify({ event: "quit-game", data: {} }));

    // Small delay to ensure quit is processed before creating new room
    setTimeout(() => {
      // Create room - the backend will auto-add a bot
      WSProvider.send(JSON.stringify({
        event: "create-room",
        data: { type: "private", maxPlayers: 10 },
      }));
    }, 100);
  }, [isBackendReady, WSProvider]);

  // When game state changes to 'started' with a NEW gameId, redirect to /play
  useEffect(() => {
    const newGameId = gameState?.gameId;
    const gameStarted = gameState?.state === 'started';

    if (!gameStarted || !newGameId) {
      return;
    }

    // Track the gameId we're expecting
    if (expectedGameId.current === null) {
      expectedGameId.current = newGameId;
    }

    // Only navigate if this is the game we created (not an old game event)
    if (newGameId === expectedGameId.current) {
      console.log('[quickstart] Game started with ID:', newGameId, '- navigating to /play');
      router.replace('/play');
    } else {
      console.log('[quickstart] Ignoring old game event, expected:', expectedGameId.current, 'got:', newGameId);
    }
  }, [gameState?.state, gameState?.gameId, router]);

  // Always show loader - never show lobby UI
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
};

export default Quickstart;
