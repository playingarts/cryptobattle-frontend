import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useState,
  useEffect,
  useCallback,
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
import {
  createWSMessageHandler,
  createWSCloseHandler,
  createWSErrorHandler,
  HandlerDependencies,
} from "../../utils/wsEventHandlers";

type GameProviderProps = { children: ReactNode };

export type IGameProviderContext = {
  gameState: any;
  players: any;
  playersGame: any;
  isBackendReady: boolean;
  roomId: any;
  userInfo: any;
  roomInfo: any;
  selectedCard: any;
  setSelectedCard: any;
  isMyTurn: any;
  setRoomId: any;
  setPlayers: any;
  timer: any;
  totalSeconds: any;
  results: any;
  userSocketIdle: any;
  setUserSocketIdle: any;
  isAlreadyConnected: boolean;
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
  const [playersGame, setPlayersGame] = useState<any>([]);

  const [playingAgain, setPlayingAgain] = useState<any>(false);

  const [timer, setTimer] = useState<any>([]);
  const [totalSeconds, setTotalSeconds] = useState<any>([]);
  const [isAlreadyConnected, setIsAlreadyConnected] = useState<boolean>(false);

  const [userInfo, setUserInfo] = useState<any>([]);

  const [isBackendReady, setIsBackendReady] = useState(false);

  const WSProvider = useWS();

  const { user } = useAuth();

  const [roomInfo, setRoomInfo] = useState<any>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const [roomId, setRoomId] = useState<any>("");

  const router = useRouter();

  const startGameBeep = new Audio("../../sounds/start-game.mp3");

  const playStartGameSound = () => {
    startGameBeep.play();
  };

  const quit = () => {
    localStorage.setItem("chosen-nfts", "");

    setResults(null);
    closeNotification();
    setGameStarted(false);
    router.push("/dashboard");
  };

  const reload = () => {
    window.location.reload();
  };

  const newGame = () => {
    setResults(null);
    localStorage.setItem("chosen-nfts", "");

    closeNotification();
    setGameStarted(false);
    router.push("/new");
  };

  const playAgainQuit = () => {
    WSProvider.send(
      JSON.stringify({
        event: "next-game",
        data: {
          wantNextGame: false,
        },
      })
    );
    setResults(null);
    localStorage.setItem("chosen-nfts", "");

    closeNotification();
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
    if (isAlreadyConnected || !user || isGameStarted()) {
      return;
    }

    if (user.inGameId) {
      router.push(`/play`);
      return;
    }
    if (user.inRoomId && !router.pathname.startsWith("/join")) {
      router.push(`/game/${user.inRoomId}`);
    }
    console.log(selectedCard);
  }, [user, isAlreadyConnected]);

  useEffect(() => {
    return () => {
      setPlayingAgain(false);
      localStorage.removeItem("play-again");
    };
  }, []);

  const playAgain = () => {
    setPlayingAgain(true);
    localStorage.setItem("play-again", "true");
    WSProvider.send(
      JSON.stringify({
        event: "next-game",
        data: {
          wantNextGame: true,
        },
      })
    );
  };

  const [gameState, setGameState] = useState<any>(null);
  const [isMyTurn, setIsMyTurn] = useState<any>(null);
  const [userSocketIdle, setUserSocketIdle] = useState<any>(null);

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

  useEffect(() => {
    if (!gameState) {
      return;
    }
    setIsMyTurn(user.userId === gameState.turnForPlayer);

    setPlayersGame(gameState.allGamePlayers);
  }, [gameState]);

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
      >
        New Game
      </Button>
    </div>
  ), [newGame]);
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
      getGameState: () => gameState,
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
    const getTitle = () => {
      if (results.winnerPlayersUserIds.length === playersGame.length) {
        return "Tie!";
      }

      if (results.winnerPlayersUserIds.includes(user.userId)) {
        return "You Win!";
      }

      const winners = results.winnerPlayersUserIds.map((winnerId: any) =>
        formatUsername(
          playersGame.find((player: any) => player.userId === winnerId).username
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
  }, [results, openNotification, timer, router]);

  const memoedValue = useMemo(
    () => ({
      gameState,
      players,
      playersGame,
      roomId,
      userInfo,
      roomInfo,
      selectedCard,
      setSelectedCard,
      isMyTurn,
      setRoomId,
      setPlayers,
      timer,
      totalSeconds,
      userSocketIdle,
      setUserSocketIdle,
      results,
      isBackendReady,
      isAlreadyConnected,
    }),
    [
      gameState,
      players,
      userSocketIdle,
      setUserSocketIdle,
      playersGame,
      roomId,
      userInfo,
      selectedCard,
      setSelectedCard,
      isMyTurn,
      setRoomId,
      setPlayers,
      timer,
      totalSeconds,
      results,
      isBackendReady,
      isAlreadyConnected,
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
