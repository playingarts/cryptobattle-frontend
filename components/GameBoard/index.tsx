import { FC, useState, useEffect, useCallback, HTMLAttributes } from "react";
import Card from "../../components/CardNew";
import { getCard } from "../../components/Cards";

import CardEmpty from "../../components/CardEmpty";
import { useGame } from "../GameProvider";
import { useWS } from "../WsProvider";

interface Props extends HTMLAttributes<HTMLElement> {
  selectedCard?: string;
  removeCard?: (cardId: string) => void;
}

const GameBoard: FC<Props> = ({ children, selectedCard, removeCard }) => {
  const WSProvider = useWS();

  const generateBoard = (x: number, y: number) => {
    const columns: any = Array(x)
      .fill(0)
      .map(() => null);

    const rows: any = Array(y)
      .fill(0)
      .map(() => [...columns]);

    return rows;
  };
  const { gameState, players } = useGame();

  const [board, setBoard] = useState(generateBoard(7, 5));

  const [refresh, setRefresh] = useState(false);
  const [cardError, setCardError] = useState<any>([]);

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

  const addCard = useCallback(
    (rowIndex, columnIndex, card = selectedCard) =>
      () => {
        if (!card) {
          return;
        }

        console.log(card);
        const allowedPlacement =
          gameState.allowedUserCardsPlacement.additionalProperties[
            `${columnIndex}-${rowIndex}`
          ];

        if (!card || !allowedPlacement) {
          // alert("Not allowed to place card there.");
          setCardError([rowIndex, columnIndex]);

          setTimeout(() => {
            setCardError([]);
          }, 1000);

          return;
        }

        console.log(
          rowIndex,
          columnIndex,
          allowedPlacement,
          "allowedPlacement"
        );

        if (
          allowedPlacement &&
          !allowedPlacement.find(
            (allowedCard: any) =>
              allowedCard.value === "joker" && allowedCard.value === card.value
          ) &&
          !allowedPlacement.find(
            (allowedCard: any) =>
              allowedCard.suit.toLowerCase() === card.suit.toLowerCase() &&
              allowedCard.value === card.value
          )
        ) {
          // alert("Not allowed to place card there.");
          setCardError([rowIndex, columnIndex]);
          setTimeout(() => {
            setCardError([]);
          }, 0);
          return;
        }

        console.log("Playing card: ", card);
        WSProvider.send(
          JSON.stringify({
            event: "play-card",
            data: {
              action: "move",
              x: columnIndex,
              y: rowIndex,
              suit: card.suit,
              value: card.value.toString(),
              nftId: card.id ? card.id : "",
            },
          })
        );
        // setTimeout(() => {
        //   WSProvider.send(
        //     JSON.stringify({
        //       event: "game-info",
        //       data: {},
        //     })
        //   );
        // }, 1000);
      },
    [WSProvider, selectedCard, gameState]
  );

  const addCardOnce = (
    rowIndex: number,
    columnIndex: number,
    card: any = selectedCard
  ) => {
    const row = Number(rowIndex);
    const column = Number(columnIndex);

    const localBoard = [...board];

    localBoard[row][column] = card;

    if (
      localBoard[row][column + 1] !== undefined &&
      localBoard[row][column + 1] === null
    ) {
      localBoard[row][column + 1] = "empty";
    }

    if (
      localBoard[row][column - 1] !== undefined &&
      localBoard[row][column - 1] === null
    ) {
      localBoard[row][column - 1] = "empty";
    }

    if (
      localBoard[row - 1] !== undefined &&
      localBoard[row - 1][column] === null
    ) {
      localBoard[row - 1][column] = "empty";
    }

    if (
      localBoard[row + 1] !== undefined &&
      localBoard[row + 1][column] === null
    ) {
      localBoard[row + 1][column] = "empty";
    }

    setBoard([...localBoard]);

    console.log(board, " :addCardOnce");

    removeCard ? removeCard(card) : null;
  };

  useEffect(() => {
    // console.log(gameState)
    console.log("gameState:", gameState);
    if (!gameState) {
      return;
    }
    setRefresh(true);

    const tableCards = gameState.gameTableCards?.additionalProperties;
    console.log("tableCards", tableCards);
    if (!tableCards) {
      return;
    }

    Object.keys(tableCards).forEach((key) => {
      const cards = gameState.gameTableCards?.additionalProperties;
      const indexes = key.split("-");
      const card = getCard(
        cards[key].slice(-1)[0].suit,
        cards[key].slice(-1)[0].value,
        cards[key].slice(-1)[0]
      );
      addCardOnce(Number(indexes[1]), Number(indexes[0]), card);
    });
    setRefresh(false);
  }, [gameState]);

  return (
    <div
      css={() => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px",
        minHeight: "100vh",
      })}
    >
      <div>
        {!refresh &&
          board.map((row: any, rowIndex: number) => {
            return (
              <div
                key={rowIndex}
                css={() => ({
                  display: "flex",
                  justifyContent: "center",
                })}
              >
                {row.map((column: any, columnIndex: number) => {
                  return (
                    <div
                      key={column + columnIndex + Math.random()}
                      css={() => ({
                        margin: column ? "20px" : "20px",
                      })}
                    >
                      {!column && (
                        <div style={{ width: "210px", height: "300px" }}></div>
                      )}
                      {column === "empty" && (
                        <CardEmpty
                          css={{
                            outline:
                              cardError[0] === rowIndex &&
                              cardError[1] === columnIndex
                                ? "#FA5252 6px solid"
                                : "none",
                            transition: "all 300ms",
                            borderRadius: 10,
                          }}
                          onClick={addCard(rowIndex, columnIndex)}
                        ></CardEmpty>
                      )}
                      {/* TODO */}
                      {column?.value && (
                        <Card
                          onClick={addCard(rowIndex, columnIndex)}
                          animated={column.id ? true : false}
                          card={column}
                          style={{
                             outline:
                              cardError[0] === rowIndex &&
                              cardError[1] === columnIndex
                                ? "#FA5252 6px solid"
                                : `6px solid ${getColor(column.userId)()}`,
                            borderRadius: 16,
                          }}
                        ></Card>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
      {children}
    </div>
  );
};

export default GameBoard;
