import { NextPage } from "next";
import { useWS } from "../components/WsProvider/index";
import { useEffect, useRef } from "react";
import { useGame } from "../components/GameProvider";
import Loader from "../components/Loader";
import { useRouter } from "next/router";
import { useNotifications } from "../components/NotificationProvider";
import Warning from "../components/Icons/Warning";
import { setNavigationLocked } from "../utils/gameState";

/**
 * Quickstart page - creates a room, starts the game, and redirects to /play
 * Shows only a loader during the entire process
 */
const Quickstart: NextPage = () => {
  const { openNotification } = useNotifications();
  const { state, isBackendReady, isAlreadyConnected } = useGame();
  const router = useRouter();
  const WSProvider = useWS();

  // Track if we've started the quickstart process
  const hasStarted = useRef(false);

  // Get game state from reducer
  const gameState = state.serverState;

  // Lock navigation on mount to prevent GameProvider from redirecting during quickstart
  // This is the FIRST effect - runs synchronously on mount before any other effects
  useEffect(() => {
    console.log('[quickstart] Mounting - setting navigation lock');
    setNavigationLocked(true);
    return () => {
      console.log('[quickstart] Unmounting - clearing navigation lock');
      setNavigationLocked(false);
    };
  }, []);

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
  }, [isAlreadyConnected]);

  // Start the quickstart process when backend is ready
  useEffect(() => {
    if (!isBackendReady || hasStarted.current) {
      return;
    }

    hasStarted.current = true;

    // Quit any existing game first
    WSProvider.send(JSON.stringify({ event: "quit-game", data: {} }));

    // Create room - the backend will auto-add a bot
    WSProvider.send(JSON.stringify({
      event: "create-room",
      data: { type: "private", maxPlayers: 10 },
    }));
  }, [isBackendReady]);

  // When game state changes to 'started', redirect to /play
  useEffect(() => {
    if (gameState?.state === 'started' && gameState?.gameId) {
      console.log('[quickstart] Game started, navigating to /play');
      router.replace('/play');
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
