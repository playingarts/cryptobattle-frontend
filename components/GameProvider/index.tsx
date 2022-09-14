import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useNotifications } from "../NotificationProvider";
import Text from "../Text/";
import Button from "../Button/";
import { formatUsername } from "../../utils/helpers";
import { useRouter } from "next/router";
import Refresh from "../Icons/Refresh";
import { useWS } from "../../components/WsProvider/index";
import { useAuth } from "../../components/AuthProvider";
import { api } from "../../api";
import Warning from "../../components/Icons/Warning";

type GameProviderProps = { children: ReactNode };

// eslint-disable

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
    // eslint-disable-next-line
    // @ts-ignore: Unreachable code error
    window.gameStarted = false;
    router.push("/dashboard");
  };

  const newGame = () => {
    setResults(null);
    localStorage.setItem("chosen-nfts", "");

    closeNotification();
    // eslint-disable-next-line
    // @ts-ignore: Unreachable code error
    window.gameStarted = false;
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
    // eslint-disable-next-line
    // @ts-ignore: Unreachable code error
    if (isAlreadyConnected || !user || window.gameStarted) {
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
      // eslint-disable-next-line
      // @ts-ignore: Unreachable code error
      localStorage.removeItem("play-again");
    };
  }, []);

  const playAgain = () => {
    setPlayingAgain(true);
    // eslint-disable-next-line
    // @ts-ignore: Unreachable code error
    localStorage.setItem("play-again", true);
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
            console.log(err);
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
    // eslint-disable-next-line
    // @ts-ignore: Unreachable code error
    window.roomId = roomId;
  }, [roomId]);

  useEffect(() => {
    if (!WSProvider) {
      return;
    }

    WSProvider.onerror = function (event: any) {
      console.log("WebSocket error: " + event.code);
      console.log(event);
    };

    WSProvider.onclose = function (e) {
      console.log("on close: " + e.code);
      if (e.code === 4000) {
        if (!localStorage.getItem("adding-metamask")) {
          setIsAlreadyConnected(true);

        } 
      }
    };

    WSProvider.onmessage = function ({ data }) {
      setIsAlreadyConnected(false);

      const event = JSON.parse(data);
      if (event.event !== "timer") {
        console.log("Game Provider WS event:", event);
      }

      // Timeout ended
      if (event.event === "timer") {
        setTimer(event.data.secondsLeft);
        setTotalSeconds(event.data.totalSeconds);
        return;
      }

      // Timeout ended
      if (event.event === "user-socket-idle") {
        setUserSocketIdle(event.data);
        return;
      }

      if (event.data.error && event.data.error.message) {
        if (event.data.error.message === "Player must be in a room") {
          // setRoomId(null);
          router.push("/dashboard");
          return;
        }
      }

      if (event.event === "choose-nft-cards") {
        console.log("choose-nft-cards sub: ", event);
      }

      if (event.event === "user-info") {
        setUserInfo(event.data);
        // eslint-disable-next-line
        // @ts-ignore: Unreachable code error
        window.userId = event.data.userId;
        setIsBackendReady(true);
        // if (event.data.inRoomId) {
        //   setRoomId(event.data.inRoomId);
        // }
      }

      if (event.event === "create-room") {
        console.log("create-room happens");
        setRoomId(event.data.roomId);
        WSProvider.send(
          JSON.stringify({
            event: "room-info",
            data: {},
          })
        );
      }

      // Timeout ended
      if (event.event === "close-room" && event.data.reason === "TIMEOUT") {
        quit();

        return;
      }

      // Play againjoin/62c999531f743708ecebd3ab
      if (event.event === "next-game") {
        console.log("next-game", event);
      }

      // eslint-disable-next-line
      // @ts-ignore: Unreachable code error
      if (event.event === "room-updated" && window.results) {
        setResults(null);
        closeNotification();
        setRoomInfo(event.data);
        setPlayers(event.data.roomUsers);
        setPlayingAgain(null);
        // eslint-disable-next-line
        // @ts-ignore: Unreachable code error
        window.results = null;

        router.push(`/game/${event.data.roomId}`);
        return;
      }

      if (event.event === "close-room") {
        // eslint-disable-next-line
        // @ts-ignore: Unreachable code error
        event.data.ownderId && event.data.ownderId !== window.userId && !window.results && 
          openNotification({
            title: "Room closed by host",
            dark: true,
            iconColor: "blue",
            footer: (
              <div css={{ display: "flex" }}>
                <Button onClick={quit}>Quit</Button>
              </div>
            ),
          });
      }

      if (event.event === "room-updated" || event.event === "room-info") {
        setRoomInfo(event.data);

        if (!event.data.roomUsers) {
          return;
        }
        console.log("Room updated: ", event.data);
        setPlayers(event.data.roomUsers);
      }
      if (event.event === "join-room") {
        if (
          event.data?.error?.errorCode === 403 &&
          event.data?.error?.message.startsWith(
            "No valid server instance for the room"
          )
        ) {
          openNotification({
            description: (
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
            ),
            dark: false,
            icon: <Warning />,
            iconColor: "#FF6F41",
            footer: (
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
            ),
          });

          router.push("/dashboard");
        }
        WSProvider.send(
          JSON.stringify({
            event: "room-info",
            data: {},
          })
        );
      }

      if (
        event.event === "quit-room" &&
        event.data.reason === "KICKED_BY_ROOM_OWNER"
      ) {
        openNotification({
          title: "You were kicked!",
          dark: true,
          iconColor: "blue",
          footer: (
            <div css={{ display: "flex" }}>
              <Button onClick={quit}>Quit</Button>
            </div>
          ),
        });
      }

      if (event.data.error && event.data.error.message) {
        if (
          event.data.error.message === "No valid server instance for the room"
        ) {
          // setRoomId(null);
          return;
        }
      }

      if (event.data.error && event.data.error.message) {
        if (
          event.data.error.message ===
          "Joining while hosting a game is forbidden"
        ) {
          openNotification({
            title: "Cannot join room while hosting a game",
            dark: true,
            iconColor: "#FEEA3A",
            footer: (
              <div css={{ display: "flex" }}>
                <Button onClick={quit}>Quit game</Button>
              </div>
            ),
          });

          return;
        }
      }

      if (event.event === "game-results") {
        console.log("game-results", event.data);
        setResults(event.data);

        // eslint-disable-next-line
        // @ts-ignore: Unreachable code error
        window.results = true;
        // eslint-disable-next-line
        // @ts-ignore: Unreachable code error
      }

      if (event.event === "game-info") {
        // eslint-disable-next-line
        // @ts-ignore: Unreachable code error
        if (event.data.state === "ended" && window.results) {
          return;
        }
        setGameState({ ...gameState, ...event.data });
        // eslint-disable-next-line
        // @ts-ignore: Unreachable code error
        if (event.data.state === "ended" && !window.results) {
          WSProvider.send(
            JSON.stringify({
              event: "game-results",
              data: {},
            })
          );

          openNotification({
            title: "Game Over!",
            dark: true,
            iconColor: "blue",
            footer: (
              <div css={{ display: "flex" }}>
                <Button onClick={quit}>Quit</Button>
              </div>
            ),
          });
        }

        console.log(event.data.state);

        console.log('game-info": ', event.data);
      }

      if (event.event === "game-updated") {
        setGameState({ ...event.data });

        setTimeout(() => {
          if (event.data.state === "started") {
            closeNotification();
            // eslint-disable-next-line
            // @ts-ignore: Unreachable code error
            if (!window.gameStarted && !window.results) {
              playStartGameSound();
              // eslint-disable-next-line
              // @ts-ignore: Unreachable code error
              window.gameStarted = true;
            }
            // eslint-disable-next-line
            // @ts-ignore: Unreachable code error
            if (
              !window.location.pathname.split("?")[0].endsWith("/dashboard")
            ) {
              router.push("/play");
            }
          }
        }, 0);

        console.log('game-updated": ', event.data);
      }
      // if (event.data.error && event.data.error.message) {
      // }
    };
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
              disabled={playingAgain || localStorage.getItem("play-again")}
            >
              {/* // eslint-disable-next-line
    // @ts-ignore: Unreachable code error */}
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
