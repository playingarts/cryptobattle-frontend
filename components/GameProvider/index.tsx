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

  const [userInfo, setUserInfo] = useState<any>([]);

  const [isBackendReady, setIsBackendReady] = useState(false);

  const [roomInfo, setRoomInfo] = useState<any>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const [roomId, setRoomId] = useState<any>("");

  const router = useRouter();

  const startGameBeep = new Audio("../../sounds/start-game.mp3");

  const playStartGameSound = () => {
    startGameBeep.play();
  };

  const quit = () => {
    setResults(null);
    closeNotification();
    // eslint-disable-next-line
    // @ts-ignore: Unreachable code error
    window.gameStarted = false;
    router.push("/dashboard");
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
  };

  useEffect(() => {
    console.log(selectedCard);
  }, [selectedCard]);

  useEffect(() => {
    return () => setPlayingAgain(false);
  }, []);

  const WSProvider = useWS();
  const { user } = useAuth();

  const playAgain = () => {
    setPlayingAgain(true);
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
      return
    }

    WSProvider.onerror = function (event: any) {
      console.log("WebSocket error: " + event.code);
      console.log(event);
    };

    WSProvider.onclose = function (e) {
      console.log("on close: " + e.code);
    };

    WSProvider.onmessage = function ({ data }) {
      const event = JSON.parse(data);
      console.log("Game Provider WS event:", event);
      // WSProvider.send(
      //   JSON.stringify({
      //     event: "room-info",
      //     data: {},
      //   })
      // );

      // Timeout ended
      if (event.event === "timer") {
        setTimer(event.data.secondsLeft);
        setTotalSeconds(event.data.totalSeconds);
        return;
      }

      // Timeout ended
      if (event.event === "user-socket-idle") {
        setUserSocketIdle(event.data)
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
        event.ownerId !== user.userId &&
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

            router.push("/play");
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
    if (!results) {
      closeNotification();

      return;
    }
    openNotification({
      title: "Game Over!",
      description: (
        <Text
          variant="h1"
          css={{ fontSize: 30, lineHeight: 1, marginBottom: 60 }}
        >
          {playersGame.map((player: any) => {
            const points = results.playersPoints.find(
              (playersWithPoints: any) =>
                playersWithPoints.userId === player.userId
            );
            return (
              <div css={{ marginBottom: 16 }} key={player.userId}>
                {formatUsername(player.username)} : {points ? points.points : 0}{" "}
              </div>
            );
          })}
        </Text>
      ),
      dark: true,
      iconColor: "#FEEA3A",

      footer: (
        <div css={{ display: "flex" }}>
          <Button
            css={(theme) => ({
              color: "#fff",
              background: "#7B61FF",
              marginRight: theme.spacing(2),
            })}
            Icon={Refresh}
            onClick={playAgain}
            disabled={playingAgain}
          >
            {playingAgain
              ? "Waiting"
              : "Play again " + "(" + timer / 1000 + ")"}
          </Button>
          <Button onClick={playAgainQuit}>Quit</Button>
        </div>
      ),
    });
  }, [results, openNotification, timer]);

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
      results,
      isBackendReady,
    }),
    [
      gameState,
      players,
      userSocketIdle,
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
