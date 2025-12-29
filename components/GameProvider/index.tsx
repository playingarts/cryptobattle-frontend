import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useReducer,
} from "react";
import { useNotifications } from "../NotificationProvider";
import Text from "../Text/";
import Button from "../Button/";
import { formatUsername } from "../../utils/helpers";
import { logError } from "../../utils/errorHandler";
import { useRouter } from "next/router";
import Refresh from "../Icons/Refresh";
import { useWS } from "../../components/WsProvider/index";
import { useAuth } from "../../components/AuthProvider";
import { api } from "../../api";
import Warning from "../../components/Icons/Warning";
import {
  isGameStarted,
  setGameStarted,
  setRoomId as setGlobalRoomId,
} from "../../utils/gameState";
import { gameReducer, initialGameState, GameReducerState } from "../../store/gameReducer";
import { GameAction, gameStateReceived, setCurrentPlayer, resetGame } from "../../store/gameActions";
import {
  createWSMessageHandler,
  createWSCloseHandler,
  createWSErrorHandler,
  HandlerDependencies,
} from "../../utils/wsEventHandlers";

type GameProviderProps = { children: ReactNode };

export type IGameProviderContext = {
  // NEW: Reducer state and dispatch (single source of truth for game state)
  state: GameReducerState;
  dispatch: React.Dispatch<GameAction>;

  // KEEP: Room/lobby state (separate concern, will be migrated later)
  players: any;
  roomId: any;
  roomInfo: any;
  setRoomId: any;
  setPlayers: any;

  // KEEP: UI state
  selectedCard: any;
  setSelectedCard: any;
  timer: number;
  totalSeconds: number;

  // KEEP: Results flow
  results: any;

  // KEEP: Connection state
  userInfo: any;
  isBackendReady: boolean;
  isAlreadyConnected: boolean;
  userSocketIdle: any;
  setUserSocketIdle: any;

  // DEPRECATED: These are derived from state.serverState - kept temporarily for consumers
  // Will be removed when consumers are migrated
  gameState: any;
  isMyTurn: any;
  playersGame: any;
};

const getUser = async (playerId: string) => {
  if (!playerId) {
    return;
  }
  return api.get(`api/rest/user-info/${playerId}`);
};

const GameProviderContext = createContext<IGameProviderContext | null>(null);

function GameProvider({ children }: GameProviderProps): JSX.Element {
  const { openNotification, closeNotification } = useNotifications();

  const [results, setResults] = useState<any>(null);

  const [players, setPlayers] = useState<any>([]);
  const [playersInfo, setPlayersInfo] = useState<any>([]);
  // DELETED: playersGame - now derived from state.serverState.allGamePlayers
  // const [playersGame, setPlayersGame] = useState<any>([]);

  const [playingAgain, setPlayingAgain] = useState<any>(false);

  const [timer, setTimer] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isAlreadyConnected, setIsAlreadyConnected] = useState<boolean>(false);

  const [userInfo, setUserInfo] = useState<any>([]);

  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isNewGameLoading, setIsNewGameLoading] = useState(false);

  // Use useWS(false) to not throw when there's no connection
  const WSProvider = useWS(false);

  const { user } = useAuth();

  // SINGLE SOURCE OF TRUTH for game state
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const [roomInfo, setRoomInfo] = useState<any>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const [roomId, setRoomId] = useState<any>("");

  const router = useRouter();

  const playStartGameSound = () => {
    // Sound disabled
  };

  const quit = () => {
    // Set flag to prevent redirect back to game (persists across navigation)
    localStorage.setItem("intentional-leave", "true");
    localStorage.setItem("chosen-nfts", "");

    // Send quit event to server
    if (WSProvider) {
      WSProvider.send(
        JSON.stringify({
          event: "quit-game",
          data: {},
        })
      );
    }

    setResults(null);
    closeNotification();
    setGameStarted(false);
    setPlayersInfo([]);
    dispatch(resetGame());
    router.push("/dashboard");
  };

  const reload = () => {
    window.location.reload();
  };

  const newGame = () => {
    setIsNewGameLoading(true);
    // Set flag to prevent redirect back to game (persists across navigation)
    localStorage.setItem("intentional-leave", "true");
    localStorage.setItem("chosen-nfts", "");

    // Send quit event to server
    if (WSProvider) {
      WSProvider.send(
        JSON.stringify({
          event: "quit-game",
          data: {},
        })
      );
    }

    setResults(null);
    closeNotification();
    setGameStarted(false);
    setPlayersInfo([]);
    dispatch(resetGame());
    router.push("/new");
  };

  const playAgainQuit = () => {
    // Set flag to prevent redirect back to game (persists across navigation)
    localStorage.setItem("intentional-leave", "true");
    localStorage.setItem("chosen-nfts", "");

    if (WSProvider) {
      WSProvider.send(
        JSON.stringify({
          event: "next-game",
          data: {
            wantNextGame: false,
          },
        })
      );
    }
    setResults(null);

    closeNotification();
    setGameStarted(false);
    setPlayersInfo([]);
    dispatch(resetGame());
    router.push("/dashboard");
  };

  useEffect(() => {
    console.log(selectedCard);
  }, [selectedCard]);

  useEffect(() => {
    if (!WSProvider) {
      return;
    }
    const intervalId = setInterval(() => {
      WSProvider.send(
        JSON.stringify({
          event: "ping",
          data: {},
        })
      );
    }, 20000);

    return () => {
      clearInterval(intervalId);
    };
  }, [WSProvider]);

  useEffect(() => {
    // Use both pathname and asPath for more reliable path detection
    const currentPath = router.pathname;
    const actualPath = router.asPath;

    // Check if user intentionally left (persists across navigation)
    const intentionalLeave = localStorage.getItem("intentional-leave") === "true";

    console.log('[DEBUG GameProvider redirect check]', {
      isAlreadyConnected,
      user: user ? { userId: user.userId, inGameId: user.inGameId, inRoomId: user.inRoomId } : null,
      isGameStarted: isGameStarted(),
      intentionalLeave,
      pathname: currentPath,
      asPath: actualPath,
    });

    // Clear the flag after checking (one-time use)
    if (intentionalLeave) {
      localStorage.removeItem("intentional-leave");
    }

    if (isAlreadyConnected || !user || isGameStarted() || intentionalLeave) {
      console.log('[DEBUG GameProvider] Skipping redirect - early return conditions met');
      return;
    }

    // Skip redirect if already on game-related pages or dashboard
    // Check both pathname and asPath for reliability
    const skipRedirectPaths = ['/new', '/game/', '/play', '/dashboard'];
    const shouldSkipRedirect = skipRedirectPaths.some(path =>
      currentPath.startsWith(path) || actualPath.startsWith(path)
    );

    console.log('[DEBUG GameProvider redirect decision]', {
      shouldSkipRedirect,
      willRedirectToPlay: user.inGameId && !shouldSkipRedirect,
      willRedirectToRoom: user.inRoomId && !currentPath.startsWith("/join") && !actualPath.startsWith("/join") && !shouldSkipRedirect,
    });

    if (user.inGameId && !shouldSkipRedirect) {
      console.log('[DEBUG GameProvider] Redirecting to /play due to inGameId:', user.inGameId);
      router.push(`/play`);
      return;
    }
    if (user.inRoomId && !currentPath.startsWith("/join") && !actualPath.startsWith("/join") && !shouldSkipRedirect) {
      console.log('[DEBUG GameProvider] Redirecting to /game/ due to inRoomId:', user.inRoomId);
      router.push(`/game/${user.inRoomId}`);
    }
    console.log(selectedCard);
  }, [user, isAlreadyConnected]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount - don't dispatch as component may be unmounting
      setPlayingAgain(false);
      localStorage.removeItem("play-again");
      localStorage.setItem("chosen-nfts", "");
      setGameStarted(false);
    };
  }, []);

  const playAgain = () => {
    setPlayingAgain(true);
    localStorage.setItem("play-again", "true");
    if (WSProvider) {
      WSProvider.send(
        JSON.stringify({
          event: "next-game",
          data: {
            wantNextGame: true,
          },
        })
      );
    }
  };

  // DELETED: gameState, isMyTurn - now derived from reducer state
  // const [gameState, setGameState] = useState<any>(null);
  // const [isMyTurn, setIsMyTurn] = useState<any>(null);
  const [userSocketIdle, setUserSocketIdle] = useState<any>(null);

  // Set current player in reducer when user is authenticated
  useEffect(() => {
    if (user?.userId) {
      dispatch(setCurrentPlayer(user.userId));
    }
  }, [user?.userId]);

  useEffect(() => {
    if (!players) {
      return;
    }

    players.forEach((player: any) => {
      if (
        !player.username ||
        !playersInfo.find(
          (playerInfo: any) => player.userId === playerInfo.userId
        )
      ) {
        getUser(player.userId)
          .then((data) => {
            if (!data) {
              return;
            }
            // const playersFiltered = players.map((player: any) => {
            //   if (player.userId === data.userId) {
            //     return { ...player, ...data };
            //   }
            //   return player;
            // });

            console.log();
            setPlayersInfo([...playersInfo, data]);
          })
          .catch((err) => {
            logError(err, 'GameProvider');
          });
      }
    });
  }, [players]);

  // DELETED: Sync useEffect - isMyTurn and playersGame now derived from reducer state
  // useEffect(() => {
  //   if (!gameState) { return; }
  //   setIsMyTurn(user.userId === gameState.turnForPlayer);
  //   setPlayersGame(gameState.allGamePlayers);
  // }, [gameState]);

  // NOTE: Timer display is now handled locally in Player.tsx using Date.now()
  // Server timer values are still received but only used for "Play again" countdown

  useEffect(() => {
    setGlobalRoomId(roomId);
  }, [roomId]);

  // Render functions for handler dependencies
  const renderWarningIcon = useCallback(() => <Warning />, []);
  const renderQuitButton = useCallback(() => (
    <div css={{ display: "flex", marginTop: "0px" }}>
      <Button onClick={quit}>Go to dashboard</Button>
    </div>
  ), [quit]);
  const renderReloadButton = useCallback(() => (
    <div css={{ display: "flex", marginTop: "0px" }}>
      <Button onClick={reload}>Play Here</Button>
    </div>
  ), [reload]);
  const renderNewGameButton = useCallback(() => (
    <div css={{ display: "flex" }}>
      <Button
        css={() => ({
          background: "#7B61FF",
          color: "#fff",
          margin: "10px auto",
        })}
        onClick={newGame}
        loading={isNewGameLoading}
        disabled={isNewGameLoading}
      >
        New Game
      </Button>
    </div>
  ), [newGame, isNewGameLoading]);
  const renderDashboardButton = useCallback(() => (
    <div css={{ display: "flex" }}>
      <Button onClick={quit}>Quit</Button>
    </div>
  ), [quit]);
  const renderGameEndedNotification = useCallback(() => (
    <div>
      <Text
        variant="h1"
        css={{
          fontSize: 35,
          lineHeight: "45.5px",
          marginBottom: 0,
          marginTop: 60,
        }}
      >
        Ended
      </Text>
      <Text
        variant="body3"
        css={{ fontSize: 22, lineHeight: "33px", marginBottom: 0 }}
      >
        The game you are trying to join has ended.
      </Text>
    </div>
  ), []);

  // WebSocket event handlers setup
  useEffect(() => {
    if (!WSProvider) {
      return;
    }

    // Wrapper: dispatch to reducer when game state is received
    const setGameState = (data: unknown) => {
      if (data && typeof data === 'object' && 'gameId' in data) {
        dispatch(gameStateReceived(data as Parameters<typeof gameStateReceived>[0]));
      }
    };

    const handlerDeps: HandlerDependencies = {
      notifications: { openNotification, closeNotification },
      stateSetters: {
        setTimer,
        setTotalSeconds,
        setUserSocketIdle,
        setUserInfo,
        setIsBackendReady,
        setRoomId,
        setResults,
        setRoomInfo,
        setPlayers,
        setPlayingAgain,
        setIsAlreadyConnected,
        setGameState,
      },
      router,
      wsProvider: WSProvider,
      uiActions: {
        quit,
        reload,
        newGame,
        playStartGameSound,
      },
      getGameState: () => state.serverState,
      renderWarningIcon,
      renderQuitButton,
      renderNewGameButton,
      renderReloadButton,
      renderDashboardButton,
      renderGameEndedNotification,
    };

    WSProvider.onerror = createWSErrorHandler();
    WSProvider.onclose = createWSCloseHandler(handlerDeps);
    WSProvider.onmessage = createWSMessageHandler(handlerDeps);
  }, [WSProvider]);

  // useEffect(() => {
  //   setPlayers([{ ...user, state: "ready" }]);
  // }, [user]);

  useEffect(() => {
    if (!results || !router.pathname.endsWith("/play")) {
      return;
    }

    // Use allGamePlayers from reducer state
    const playersGame = state.serverState.allGamePlayers || [];

    const getTitle = () => {
      if (results.winnerPlayersUserIds.length === playersGame.length) {
        return "Tie!";
      }

      if (results.winnerPlayersUserIds.includes(user.userId)) {
        return "You Win!";
      }

      const winners = results.winnerPlayersUserIds.map((winnerId: any) =>
        formatUsername(
          playersGame.find((player: any) => player.userId === winnerId)?.username || ''
        )
      );

      return winners.length > 0 ? winners.join(", ") + " won!" : "Tie!";
    };

    const playerResults = playersGame
      .map((player: any) => {
        const resultsPlayer = results.playersPoints.find(
          (playerR: any) => player.userId === playerR.userId
        );

        return {
          points: resultsPlayer ? resultsPlayer.points : 0,
          ...player,
        };
      })
      .sort((a: any, b: any) => b.points - a.points);

    // const playerResults = results.playersPoints
    //   .map((player: any) => {
    //     const playerFull = playersGame.find(
    //       (playerGame: any) => player.userId === playerGame.userId
    //     );

    //     return {
    //       points: player.points,
    //       ...playerFull,
    //     };
    //   })
    //   .sort((a: any, b: any) => b.points - a.points);

    openNotification({
      description: (
        <div
          css={{
            marginTop: 40,
          }}
        >
          <Text
            variant="h1"
            css={{
              marginTop: 40,
              fontSize: 35,
              lineHeight: "45.5px",
              letterSpacing: "-5%",
              marginBottom: 30,
            }}
          >
            {getTitle()}
          </Text>
          <Text
            variant="body"
            css={{
              fontSize: 18,
              lineHeight: "21.11px",
              marginBottom: 30,
              width: 390,
            }}
          >
            {playerResults.map((player: any, index: number) => {
              // const points = results.playersPoints.find(
              //   (playersWithPoints: any) =>
              //     playersWithPoints.userId === player.userId
              // );
              return (
                <div
                  css={{
                    padding: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    borderTop:
                      index === 0
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "none",
                  }}
                  key={player.userId}
                >
                  <div>
                    {index + 1 + ". "}
                    {formatUsername(player.username)}{" "}
                  </div>
                  <div>
                    {player.points ? player.points : 0}
                    {" points"}
                  </div>
                </div>
              );
            })}
          </Text>
        </div>
      ),
      dark: true,
      isWinner:
        results.winnerPlayersUserIds.includes(user.userId) &&
        results.winnerPlayersUserIds.length !== playersGame.length,

      footer: (
        <div
          css={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            marginBottom: 40,
          }}
        >
          {results.areAllPlayersActive && (
            <Button
              css={(theme) => ({
                color: "#fff",
                background: "#7B61FF",
                marginBottom: theme.spacing(2),
              })}
              Icon={Refresh}
              onClick={playAgain}
              disabled={!!(playingAgain || localStorage.getItem("play-again"))}
            >
              {playingAgain || localStorage.getItem("play-again")
                ? "Waiting"
                : "Play again " + "(" + timer / 1000 + ")"}
            </Button>
          )}
          <Button
            css={() => ({
              color: "#fff",
              background: "rgba(255, 255, 255, 0.05)",
            })}
            onClick={playAgainQuit}
          >
            Dashboard
          </Button>
        </div>
      ),
    });
  }, [results, openNotification, timer, router, state.serverState.allGamePlayers]);

  const memoedValue = useMemo(
    () => ({
      // NEW: Reducer state and dispatch
      state,
      dispatch,

      // Room/lobby state
      players,
      roomId,
      roomInfo,
      setRoomId,
      setPlayers,

      // UI state
      selectedCard,
      setSelectedCard,
      timer,
      totalSeconds,

      // Results
      results,

      // Connection state
      userInfo,
      isBackendReady,
      isAlreadyConnected,
      userSocketIdle,
      setUserSocketIdle,

      // DEPRECATED: Derived from reducer state for backwards compatibility
      // These will be removed when all consumers are migrated
      gameState: state.serverState,
      isMyTurn: state.isMyTurn,
      playersGame: state.serverState.allGamePlayers,
    }),
    [
      state,
      players,
      roomId,
      roomInfo,
      selectedCard,
      timer,
      totalSeconds,
      results,
      userInfo,
      isBackendReady,
      isAlreadyConnected,
      userSocketIdle,
    ]
  );

  return (
    <GameProviderContext.Provider value={memoedValue}>
      {children}
    </GameProviderContext.Provider>
  );
}

function useGame(): IGameProviderContext {
  const context = useContext(GameProviderContext);

  if (context == undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }

  return context;
}

export { GameProvider, useGame };
