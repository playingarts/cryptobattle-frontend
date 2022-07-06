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

import { useWS } from "../../components/WsProvider/index";
import { useAuth } from "../../components/AuthProvider";
import { api } from "../../api";
type GameProviderProps = { children: ReactNode };

//   import Loader from "../Loader";

export type IGameProviderContext = {
  gameState: any;
  players: any;
  playersGame: any;
  roomId: any;
  userInfo: any;
  roomInfo: any;
  selectedCard: any;
  setSelectedCard: any;
  isMyTurn: any;
};

const getUser = async (playerId: string) => {
  if (!playerId) 
  {return}
  return api.get(`api/rest/user-info/${playerId}`)

};

const GameProviderContext = createContext<IGameProviderContext | null>(null);

function GameProvider({ children }: GameProviderProps): JSX.Element {
  const { openNotification, closeNotification } = useNotifications();

  const [results, setResults] = useState<any>(null);

  const [players, setPlayers] = useState<any>([]);
  const [playersGame, setPlayersGame] = useState<any>([]);

  const [userInfo, setUserInfo] = useState<any>([]);
  const [roomInfo, setRoomInfo] = useState<any>([]);

  const [selectedCard, setSelectedCard] = useState<any>(null);

  const [roomId, setRoomId] = useState<any>("");

  const router = useRouter();

  const quit = () => {
    setResults(null);
    closeNotification();
    router.push("/dashboard");
  };

  useEffect(() => {
    console.log(selectedCard);
  }, [selectedCard]);

  const WSProvider = useWS();
  const { user } = useAuth();

  const [gameState, setGameState] = useState<any>(null);
  const [isMyTurn, setIsMyTurn] = useState<any>(null);

  useEffect(() => {
    if (!players) {
      return;
    }

    players.forEach((player: any) => {
      if (!player.username) {
      getUser(player.userId)
        .then((data) => {
          if (!data) {
            return
          }
          const playersFiltered = players.map((player: any) => {
            if (player.userId === data.userId) {
              return { ...player, ...data };
            }
            return player;
          });
          setPlayers(playersFiltered);
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
    WSProvider.onmessage = function ({ data }) {
      const event = JSON.parse(data);
      console.log("Game Provider WS event:", event);
      // WSProvider.send(
      //   JSON.stringify({
      //     event: "room-info",
      //     data: {},
      //   })
      // );
      if (event.event === "room-updated" || event.event === "room-info") {
        setRoomInfo(event.data);
        if (!event.data.roomUsers) {
          return;
        }
        console.log("Room updated: ", event.data.roomUsers);
        setPlayers(event.data.roomUsers);


      }

      if (event.data.error && event.data.error.message) {
        if (
          event.data.error.message === "Player must be in a room"
        ) {
          setRoomId(null)
          return;
        }
      }


      if (event.event === "choose-nft-cards") {
        console.log("choose-nft-cards sub: ", event);
      }

      if (event.event === "user-info") {
        setUserInfo(event.data);
        if (event.data.inRoomId) {
          setRoomId(event.data.inRoomId);
        }
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

      if (event.event === "join-room") {
        WSProvider.send(
          JSON.stringify({
            event: "room-info",
            data: {},
          })
        );
      }


      if (event.event === "quit-room" && event.data.reason === 'KICKED_BY_ROOM_OWNER') {
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
          setRoomId(null)
          return;
        }
      }

      if (event.data.error && event.data.error.message) {
        if (
          event.data.error.message === "Joining while hosting a game is forbidden"
        ) {

          openNotification({
            title: "Cannot join room while hosting a game",
            dark: true,
            iconColor: "red",
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
      }
      if (event.event === "game-info") {
        setGameState({ ...gameState, ...event.data });

        if (event.data.state === "ended" && !results) {
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
          if (event.data.state === "ended") {
            WSProvider.send(
              JSON.stringify({
                event: "purge-rooms-and-games",
                data: {},
              })
            );
          }
        }

        console.log(event.data.state);

        console.log('game-info": ', event.data);
      }

      if (event.event === "game-updated") {
        setGameState({ ...event.data });
        setTimeout(() => {
          if (event.data.state === "started") {
            closeNotification();
            router.push("/play");
          }
        }, 0);

        console.log('game-updated": ', event.data);
      }
      // if (event.data.error && event.data.error.message) {
      // }
    };
  }, []);

  useEffect(() => {
    setPlayers([{ ...user, state: "ready" }]);
  }, [user]);

  useEffect(() => {
    if (!results) {
      closeNotification();

      return;
    }
    openNotification({
      title: "Game Over!",
      description: (
        <Text variant="h1" css={{ fontSize: 30, lineHeight: 1 }}>
          {results.playersPoints.map((entry: any) => {
            return (
              <div css={{ marginBottom: 10 }} key={entry.userId}>
                {formatUsername(
                  players.find((player: any) => player.userId === entry.userId)
                    .username
                ) +
                  " : " +
                  entry.points}
              </div>
            );
          })}
        </Text>
      ),
      dark: true,
      iconColor: "blue",

      footer: (
        <div css={{ display: "flex" }}>
          <Button
            css={(theme) => ({
              color: "#fff",
              background: "purple",
              marginRight: theme.spacing(2),
            })}
            disabled
          >
            Play again (60)
          </Button>
          <Button onClick={quit}>Quit</Button>
        </div>
      ),
    });
  }, [results, openNotification]);

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
    }),
    [
      gameState,
      players,
      playersGame,
      roomId,
      userInfo,
      selectedCard,
      setSelectedCard,
      isMyTurn,
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
