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
import axios from "axios";
type GameProviderProps = { children: ReactNode };

//   import Loader from "../Loader";

export type IGameProviderContext = {
  gameState: any;
  players: any;
  roomId: any;
  userInfo: any;
  roomInfo: any;
  selectedCard: any;
  setSelectedCard: any;
};

const getUser = async (playerId: string) => {
  return axios.get(
    `https://playing-arts-game-backend-test-7pogl.ondigitalocean.app/api/rest/user-info/${playerId}`,
    {
      headers: {
        accesstoken: localStorage.getItem("accessToken"),
        "content-type": "application/json",
      },
    }
  );
};

const GameProviderContext = createContext<IGameProviderContext | null>(null);

function GameProvider({ children }: GameProviderProps): JSX.Element {
  const { openNotification, closeNotification } = useNotifications();

  const [results, setResults] = useState<any>(null);
  const [players, setPlayers] = useState<any>([]);
  const [userInfo, setUserInfo] = useState<any>([]);
  const [roomInfo, setRoomInfo] = useState<any>([]);

  const [selectedCard, setSelectedCard] = useState<any>(null);

  const [roomId, setRoomId] = useState("");

  const router = useRouter();

  const quit = () => {
    setResults(null);
    closeNotification();
    router.push("/dashboard");
  };

  useEffect(() => {
    console.log(selectedCard)
  }, [selectedCard])
  


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
          .then(({ data }) => {
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
      return
    }
    setIsMyTurn(user.userId === gameState.turnForPlayer)
  
  }, [gameState])
  

  useEffect(() => {
    WSProvider.onmessage = function ({ data }) {
      const event = JSON.parse(data);
      console.log("Game Provider WS event:", event);

      if (event.event === "room-updated" || event.event === "room-info") {
        setRoomInfo(event.data);
        if (!event.data.roomUsers) {
          return;
        }
        console.log("Room updated: ", event.data.roomUsers);
        setPlayers(event.data.roomUsers);
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
        })
      }

      if (event.event === "join-room") {
        console.log("joined room");
        WSProvider.send(
          JSON.stringify({
            event: "room-info",
            data: {},
          })
        );
      }

      if (event.data.error && event.data.error.message) {
          if (event.data.error.message === "No valid server instance for the room'") {
            quit()
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
        }, 1000);

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
      roomId,
      userInfo,
      roomInfo,
      selectedCard,
      setSelectedCard,
      isMyTurn
    }),
    [gameState, players, roomId, userInfo, selectedCard, setSelectedCard, isMyTurn]
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
