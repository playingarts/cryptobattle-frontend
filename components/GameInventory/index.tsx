import { FC, useState, useEffect, useCallback, HTMLAttributes } from "react";
import CardSmall from "../../components/CardSmall";
import { CardSuits } from "../../source/enums";
import Button from "../../components/Button";
import Skip from "../../components/Icons/Skip";
import { useWS } from "../WsProvider";
import { useGame } from "../GameProvider";
import { useAuth } from "../AuthProvider";

interface Card {
  id?: string;
  Icon: FC<HTMLAttributes<SVGElement>>;
  value: string;
  suit?: CardSuits;
}

interface Props {
  selectedCard?: string;
  cards: Card[];
  isOpponentsCards?: boolean;
  loading?: boolean;
  onChange?: (cardId: string) => void;
}

const GameInventory: FC<Props> = ({
  children,
  loading,
  isOpponentsCards,
  cards,
}) => {
  // const [selectedCard, setSelectedCard] = useState<any>(null);
  const [cardsRegular, setCardsRegular] = useState<any>([]);
  const [cardsNft, setCardsNft] = useState<any>([]);
  const [loadingDelayed, setLoadingDelayed] = useState(true);

  const { gameState, selectedCard, setSelectedCard, players} = useGame();
  const { user } = useAuth();

  const WSProvider = useWS();


  const getColor = useCallback(
    (userId) => () => {
      if (userId === "system") {
        return "#2D3038";
      }
      const foundPlayer = players.find(
        (player: any) => player.userId === userId
      );

      return foundPlayer ? foundPlayer.color : "gray";
    },
    [players]
  );


  const skip = () => {
    WSProvider.send(
      JSON.stringify({
        event: "play-card",
        data: {
          action: "pass",
        },
      })
    );
  };

  const cardPriority: any = {
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 4,
    "6": 5,
    "7": 6,
    "8": 7,
    "9": 8,
    "10": 9,
    jack: 10,
    queen: 11,
    king: 12,
    ace: 13,
    joker: 14,
  };
  const suitPriority: any = { spades: 1, hearts: 2, clubs: 3, diamonds: 4 };

  const sortCards = (cards: any) => {
    cards.sort(
      (a: any, b: any) =>
        cardPriority[a.value] - cardPriority[b.value] ||
        suitPriority[a.suit] - suitPriority[b.suit]
    );

    return cards;
  };

  useEffect(() => {
    setTimeout(() => {
      setLoadingDelayed(false);
    }, 0);
  }, [loading]);

  useEffect(() => {
    const cardsNft = sortCards(
      cards.filter((card) => card.id || card.value === "unknown")
    );
    const cardsRegular = sortCards(
      cards.filter((card) => !card.id && card.value !== "unknown")
    );
    setCardsNft(cardsNft);
    setCardsRegular(cardsRegular);
  }, [cards]);

  const selectCard = useCallback(
    (card) => () => {
      setSelectedCard(card);


    },
    [setSelectedCard]
  );

  return (
    <div
      className="game-inventory"
      style={{
        position: "fixed",
        bottom: -8,
        left: 0,
        width: "100%",
        background: "transparent",
        zIndex: 400,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: loadingDelayed ? "0" : "1",
        transform: loadingDelayed
          ? isOpponentsCards
            ? "translate(0,-200px)"
            : "translate(0,200px)"
          : "translate(0, 0)",
      }}
    >
      <div
        style={{
          background:
            (gameState?.turnForPlayer === user.userId && !isOpponentsCards) ||
            (gameState?.turnForPlayer !== user.userId && isOpponentsCards)
              ? "#fff"
              : "#181818",
          borderRadius: isOpponentsCards ? 10 : 20,
          height: "100%",
          marginBottom: 20,
          marginTop: 20,
          position: "relative",
          display: "flex",
          justifyContent:
            gameState?.turnForPlayer === user.userId && isOpponentsCards
              ? "space-between"
              : "space-around",
          zIndex: 999999,
        }}
      >
        {cardsRegular.length > 0 && (
          <div
            css={{
              padding: isOpponentsCards ? 5 : 15,
              minWidth: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {cardsRegular.map((card: any, index: number) => {
              return (
                <div
                  style={{
                    width:
                      gameState?.turnForPlayer === user.userId &&
                      !isOpponentsCards
                        ? 72
                        : 84,
                    marginRight:
                      gameState?.turnForPlayer === user.userId &&
                      !isOpponentsCards
                        ? index + 1 === cardsRegular.length
                          ? 0
                          : 10
                        : 0,
                    height: 91,
                  }}
                  key={`${index}`}
                >
                  <CardSmall
                    className={"draggable"}
                    onMouseDown={selectCard(card)}

                    key={`${index}`}
                    isSelected={
                      selectedCard ? selectedCard.uid === card.uid : false
                    }
                    background={
                      gameState?.turnForPlayer === user.userId &&
                      isOpponentsCards
                        ? "#181818"
                        : isOpponentsCards
                        ? "white"
                        : "#0C0E11"
                    }
                    color={
                      gameState?.turnForPlayer === user.userId &&
                      isOpponentsCards
                        ? !isOpponentsCards
                          ? "#0C0E11"
                          : "white"
                        : isOpponentsCards
                        ? "#0C0E11"
                        : "white"
                    }
                    css={{
                      transition: "all 400ms",

                      borderRight: !isOpponentsCards
                        ? "none"
                        : index + 1 === cardsRegular.length
                        ? "none"
                        : `1px solid ${
                            gameState?.turnForPlayer === user.userId
                              ? "rgba(221, 221, 221, 0.2)"
                              : "rgba(221, 221, 221, 0.8)"
                          } `,
                      padding:
                        gameState?.turnForPlayer === user.userId &&
                        !isOpponentsCards
                          ? "0 0"
                          : isOpponentsCards
                          ? "0 10px"
                          : "0 6px",
                      pointerEvents:
                        !isOpponentsCards &&
                        gameState?.turnForPlayer === user.userId
                          ? "auto"
                          : "none",
                    }}
                    cardValue={card.value}
                    {...card}
                  />
                </div>
              );
            })}{" "}
          </div>
        )}
        {cardsNft.length > 0 && (
          <div
            css={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderTopRightRadius: isOpponentsCards ? 10 : 20,
              borderBottomRightRadius: isOpponentsCards ? 10 : 20,
              padding: isOpponentsCards ? 5 : 15,
              background: isOpponentsCards
                ? gameState?.turnForPlayer === user.userId
                  ? "#282828"
                  : "#E5E5E5"
                : gameState?.turnForPlayer === user.userId
                ? "linear-gradient(90.19deg, #8482F8 14%, #A6FBF6 86.07%)"
                : "#282828",
            }}
          >
            {cardsNft.map((card: any, index: number) => {
              return (
                <div
                  style={{
                    width:
                      gameState?.turnForPlayer === user.userId &&
                      !isOpponentsCards
                        ? 72
                        : 84,
                    marginRight:
                      gameState?.turnForPlayer === user.userId &&
                      !isOpponentsCards
                        ? index + 1 === cardsNft.length
                          ? 0
                          : 10
                        : 0,
                    height: 91,
                  }}
                  key={`${index + "nft"}`}
                >
                  <CardSmall
                    className={"draggable"}
                    onMouseDown={selectCard(card)}
                    isSelected={
                      selectedCard ? selectedCard.uid === card.uid : false
                    }
                    background={
                      gameState?.turnForPlayer === user.userId &&
                      isOpponentsCards
                        ? "#282828"
                        : isOpponentsCards
                        ? "E5E5E5"
                        : gameState?.turnForPlayer === user.userId
                        ? "#0C0E11"
                        : "#0C0E11"
                    }
                    color={
                      gameState?.turnForPlayer === user.userId &&
                      isOpponentsCards
                        ? "#fff"
                        : isOpponentsCards
                        ? "#0C0E11"
                        : "#fff"
                    }
                    css={{
                      marginRight:
                        index + 1 === cardsNft.length && !isOpponentsCards
                          ? 0
                          : 10,
                      pointerEvents:
                        !isOpponentsCards &&
                        gameState?.turnForPlayer === user.userId
                          ? "auto"
                          : "none",
                      borderRight:
                        gameState?.turnForPlayer === user.userId &&
                        !isOpponentsCards &&
                        index + 1 === cardsRegular.length
                          ? "none"
                          : "px solid rgba(221, 221, 221, 0.1)",
                      "&::before": {
                        opacity: 0,
                        content: `"${card.powerLevel}"`,
                        display: "flex",

                        justifyContent: "center",
                        alignItems: "center",
                        transition: "all  400ms",
                        color: "#fff",
                        fontFamily: "Aldrich",
                        background: getColor(user.userId)(),
                        backgroundImage:
                          'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAxNCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzLjkxNzIgNy4zMTE4Mkw3LjU1MzU3IDE4Ljc2NjRDNy40MzkwMyAxOC45NyA3LjIyOTAzIDE5LjA5MDkgNi45OTk5NCAxOS4wOTA5QzYuOTQ5MDMgMTkuMDkwOSA2Ljg5MTc1IDE5LjA4NDUgNi44NDA4NCAxOS4wNzE4QzYuNTYwODQgMTguOTk1NCA2LjM2MzU3IDE4Ljc0NzMgNi4zNjM1NyAxOC40NTQ1VjExLjQ1NDVIMC42MzYzMDFDMC40MTk5MzggMTEuNDU0NSAwLjIyMjY2NSAxMS4zNDY0IDAuMTAxNzU2IDExLjE2ODJDLTAuMDEyNzg5NSAxMC45OSAtMC4wMzE4ODAzIDEwLjc2MDkgMC4wNTA4NDY5IDEwLjU2MzZMNC41MDUzOSAwLjM4MTgxOEM0LjYwNzIxIDAuMTUyNzI3IDQuODM2MyAwIDUuMDkwODUgMEg4LjkwOTAzQzkuMTE5MDMgMCA5LjMxNjMgMC4xMDE4MTggOS40MzcyMSAwLjI4QzkuNTUxNzUgMC40NTE4MTggOS41NzcyMSAwLjY3NDU0NSA5LjUwMDg0IDAuODcxODE4TDcuMzA1MzkgNi4zNjM2M0gxMy4zNjM2QzEzLjU4NjMgNi4zNjM2MyAxMy43OTYzIDYuNDg0NTQgMTMuOTEwOCA2LjY3NTQ1QzE0LjAyNTQgNi44NzI3MiAxNC4wMzE4IDcuMTE0NTQgMTMuOTE3MiA3LjMxMTgyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==")',
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "12px 8px",

                        position: "absolute",
                        borderRadius: 20,
                        fontSize: 28,
                        zIndex: 9999,
                        top: -72,
                        left: "50%",
                        transform: "translate(-50%, 0)",
                        padding: "12px 0",
                        paddingTop: 18,
                        paddingLeft: 20,
                        minWidth: 70,
                        height: 36,
                        pointerEvents: "none",
                        textTransform: "uppercase",
                      },
                      "&:hover": {
                        color: "#7B61FF",
                        "&::before": {
                          opacity: 1,
                          pointerEvents: "none",
                          transform: "translate(-50%, 8px)",
                        },
                      },
                    }}
                    cardValue={isOpponentsCards ? "unknown" : card.value}
                    {...card}
                  />
                </div>
              );
            })}
          </div>
        )}
        {!isOpponentsCards && (
          <Button
            Icon={Skip}
            onClick={skip}
            css={{
              marginLeft: 40,
              position: "absolute",
              borderRadius: 400,
              right: -120,
              top: 32,
              background: "#181818",
              color:
                gameState?.turnForPlayer !== user.userId ? "#282828" : "white",
              height: 60,
              width: 60,
              transition: "all 400ms",
              pointerEvents:
                gameState?.turnForPlayer !== user.userId ? "none" : "auto",

              "&::before": {
                opacity: 0,
                content: `"skip"`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 400ms",
                color: "black",
                fontFamily: "Aldrich",
                position: "absolute",
                background: "#ffff",
                borderRadius: 6,
                fontSize: 18,
                zIndex: 9999,
                top: -50,
                left: "50%",
                transform: "translate(-50%, 0)",
                padding: "12px 14px",
                paddingTop: 16,
                minWidth: 70,
                height: 30,
                pointerEvents: "none",
                textTransform: "uppercase",
              },
              "&:hover": {
                color: "#7B61FF",
                "&::before": {
                  opacity: 1,
                  pointerEvents: "none",
                  transform: "translate(-50%, 8px)",
                },
              },
            }}
          ></Button>
        )}{" "}
      </div>

      {children}
    </div>
  );
};

export default GameInventory;
