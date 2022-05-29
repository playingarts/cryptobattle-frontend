import { createContext, useContext, useMemo, ReactNode, useState, useEffect } from "react";
import { useNotifications } from "../NotificationProvider";

type GameProviderProps = { children: ReactNode };

//   import Loader from "../Loader";

export type IGameProviderContext = {
  gameState: any;
  setGameState: any;
};

const GameProviderContext = createContext<IGameProviderContext | null>(null);

function GameProvider({ children }: GameProviderProps): JSX.Element {


  const {openNotification} = useNotifications()

  const [results] = useState(null)

  useEffect(() => {
    if (!results) {
      openNotification(null)

      return

    }
    console.log('happens')
    openNotification(true)
  

  }, [results, openNotification])
  

  // setTimeout(() => {
  //   setResults(true)
  // }, 5000);


  const [gameState, setGameState] = useState<any>({
    gameId: "6290ecf5c570987ca2e71986",
    tableSizeX: 7,
    tableSizeY: 5,
    turnForPlayer: "6285c7787c045edb5ceb24aa",
    gameUsersWithCards: [
      {
        lastAction: "none",
        userId: "6285c7787c045edb5ceb24aa",
        cards: [
          {
            power: 4,
            scoring: 1,
            suit: "spades",
            value: "2",
          },
          {
            power: 4,
            scoring: 1,
            suit: "hearts",
            value: "9",
          },
          {
            power: 4,
            scoring: 1,
            suit: "diamonds",
            value: "ace",
          },
          {
            power: 4,
            scoring: 1,
            suit: "diamonds",
            value: "4",
          },
          {
            power: 4,
            scoring: 1,
            suit: "hearts",
            value: "jack",
          },
          {
            power: 4,
            scoring: 1,
            suit: "spades",
            value: "jack",
          },
          {
            power: 4,
            scoring: 1,
            suit: "hearts",
            value: "6",
          },
          {
            power: 4,
            scoring: 1,
            suit: "hearts",
            value: "5",
          },
          {
            power: 4,
            scoring: 1,
            suit: "spades",
            value: "ace",
          },
          {
            power: 4,
            scoring: 1,
            suit: "hearts",
            value: "2",
          },
        ],
      },
    ],
    gameTableCards: {
      additionalProperties: {
        "3-2": [
          {
            id: null,
            userId: "system",
            imageUrl: null,
            name: null,
            power: 4,
            scoring: 1,
            suit: "clubs",
            value: "8",
            xp: null,
            videoUrl: null,
          },
        ],
      },
    },
    allowedUserCardsPlacement: {
      additionalProperties: {
        "2-2": [
          {
            suit: "hearts",
            value: "9",
          },
        ],
        "3-1": [
          {
            suit: "hearts",
            value: "9",
          },
        ],
        "3-3": [
          {
            suit: "hearts",
            value: "9",
          },
        ],
        "4-2": [
          {
            suit: "hearts",
            value: "9",
          },
        ],
      },
    },
    playersCurrentPoints: {},
    opponentPlayers: [
      {
        username: "uvisgrinfelds",
        profileImageUrl:
          "https://pbs.twimg.com/profile_images/1520748027622866947/Pmy0a_v4_normal.jpg",
      },
    ],
    state: "started",
  });


  const memoedValue = useMemo(
    () => ({
      gameState,
      setGameState,
    }),
    [gameState, setGameState]
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
