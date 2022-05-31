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

import { useRouter } from "next/router";

import { useWS } from "../../components/WsProvider/index";
import { useAuth } from "../../components/AuthProvider";
import axios from "axios"
type GameProviderProps = { children: ReactNode };

//   import Loader from "../Loader";

export type IGameProviderContext = {
  gameState: any;
  players: any;
  roomUrl: any;
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
  const { openNotification } = useNotifications();

  const [results, setResults] = useState<any>(null);
  const [players, setPlayers] = useState<any>([]);
  const [roomUrl, setRoomUrl] = useState("");



  const router = useRouter();

  const quit = () => {
    setResults(null)
    router.push('/dashboard')
  }
  const WSProvider = useWS();
  const { user } = useAuth();

  const [gameState, setGameState] = useState<any>(null);



  useEffect( () => {
    if (!players) {
      return 

    }


    players.forEach((player:any) => {
      if (!player.username) {
        getUser(player.userId)
        .then(({ data }) => {
          const playersFiltered = players.map(player => {
            if (player.userId === data.userId) {
              return {...player, ...data}
            }
            return player
          })
          setPlayers(playersFiltered)
        })
        .catch((err) => {
          console.log(err);
        });
      }
    })




  }, [players]);



  useEffect(() => {
    WSProvider.onmessage = function ({ data }) {
      const event = JSON.parse(data);
      console.log("Game Provider WS event:", event);

      if (event.event === "room-updated" || event.event === "room-info") {
        console.log("Room updated: ", event.data.roomUsers);
        setPlayers(event.data.roomUsers);
      }

      if (event.event === "create-room") {
        setRoomUrl(`https://play2.playingarts.com/join/${event.data.roomId}`);
      }

      if (event.data.error && event.data.error.message) {
        if (
          event.data.error.message ===
            "Its not allowed to create new room while being in game" ||
          event.data.error.message ===
            "Joining while hosting a game is forbidden"
        ) {
          WSProvider.send(
            JSON.stringify({
              event: "purge-rooms-and-games",
              data: {},
            })
          );
          return;
        }
      }

      if (event.event === "game-results") {
        console.log('game-results', event.data)
        setResults(true);
      }
      if (event.event === "game-info") {
        // setGameState({})
        setGameState({ ...event.data });
        // setTimeout(() => {
        //   // setGameState({ ...event.data });

        //   if (event.data.state === "started") {
        //     router.push("/play", null, { shallow: true });
        //   }

        //   if (event.data.state === "ended") {
        //     setResults(true);
        //   }

        // }, 100);

        console.log(event.data.state)

        if (event.data.state === "ended") {
          console.log('eneded')
            // setResults(true)
        }

        console.log('game-info": ', event.data);
      }

      if (event.event === "game-updated") {
        // setGameState({})
        setGameState({ ...event.data });
        setTimeout(() => {
          // setGameState({ ...event.data });

          if (event.data.state === "started") {
            router.push("/play");

            // router.push("/play", null, { shallow: true });
          }

          if (event.data.state === "ended") {
            setResults(true);
          }

          // setTimeout(() => {
          //   if (event.data.state === "started") {
          //     router.push("/play");
          //   }
          // }, 4000);
        }, 1000);

        console.log('game-updated": ', event.data);
      }
      if (event.data.error && event.data.error.message) {
        alert(event.data.error.message);
      }

      // console.log(JSON.parse(data));
    };
  }, []);

  useEffect(() => {
    setPlayers([{ ...user, state: "ready" }]);
  }, [user]);

  useEffect(() => {
    if (!results) {
      openNotification(null);

      return;
    }
    openNotification({
      title: "Game Over!",
      description: "You did it",
      dark: true,
      iconColor: "blue",
      icon: (
        <Text variant="h1" css={{ fontSize: 30, lineHeight: 1 }}>
          55
        </Text>
      ),
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
      roomUrl,
    }),
    [gameState, players, roomUrl]
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
